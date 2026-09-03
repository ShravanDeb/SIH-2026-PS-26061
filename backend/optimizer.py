from typing import Dict, Any, List

class MicrogridOptimizer:
    """
    Features 4, 5, 6, 7, 8:
    - AI Energy Management
    - Renewable-First Optimization
    - Smart Battery Management (SOC bounds 20% to 90%)
    - Generator Optimization (Warm-standby & fuel minimization)
    - Smart Load Management (Tiered load shedding)
    """
    def __init__(self, battery_capacity_kwh: float = 400.0):
        self.battery_capacity = battery_capacity_kwh
        self.max_inverter_kw = 50.0
        self.max_generator_kw = 80.0
        self.generator_warm_standby = False

    def optimize_dispatch(
        self,
        solar_kw: float,
        wind_kw: float,
        total_load_kw: float,
        current_soc: float,
        storm_advisory: bool = False
    ) -> Dict[str, Any]:
        renewable_total = round(solar_kw + wind_kw, 1)
        net_balance = round(renewable_total - total_load_kw, 1)

        batt_charge = 0.0
        batt_discharge = 0.0
        gen_output = 0.0
        active_load = total_load_kw
        shed_amount = 0.0
        action_note = "All loads served nominally"

        if net_balance >= 0:
            # Renewable Surplus: Charge battery up to 90% (or 95% if pre-storm)
            target_max_soc = 95.0 if storm_advisory else 90.0
            headroom_kwh = max(0.0, (target_max_soc - current_soc) / 100.0 * self.battery_capacity)
            batt_charge = round(min(net_balance, self.max_inverter_kw, headroom_kwh), 1)
            action_note = f"Renewable surplus +{net_balance} kW routed to battery bank"
        else:
            # Renewable Deficit: Discharge battery down to 20%
            deficit = abs(net_balance)
            usable_reserve_kwh = max(0.0, (current_soc - 20.0) / 100.0 * self.battery_capacity)
            batt_discharge = round(min(deficit, self.max_inverter_kw, usable_reserve_kwh), 1)
            remaining_deficit = round(deficit - batt_discharge, 1)

            if remaining_deficit > 0:
                # If battery cannot cover deficit:
                if self.generator_warm_standby or current_soc < 30.0 or remaining_deficit > 15.0:
                    gen_output = round(min(remaining_deficit, self.max_generator_kw), 1)
                    remaining_after_gen = round(remaining_deficit - gen_output, 1)
                    if remaining_after_gen > 0:
                        # Smart load shedding: shed flexible loads first
                        shed_amount = remaining_after_gen
                        active_load = round(total_load_kw - shed_amount, 1)
                        action_note = f"Tier 6/5 load shedding active: {shed_amount} kW reduced"
                    else:
                        action_note = f"Generator dispatched at {gen_output} kW to cover renewable gap"
                else:
                    # Minor short-term deficit: shed tier 6 flexible load (1.7 kW)
                    shed_amount = min(remaining_deficit, 1.7)
                    active_load = round(total_load_kw - shed_amount, 1)
                    action_note = f"Autonomous load trimming: {shed_amount} kW flexible load deferred"

        # Calculate new estimated SOC after this step (1 second simulation tick)
        net_batt_flow = (batt_charge * 0.95) - (batt_discharge / 0.95) # 95% round-trip efficiency
        soc_delta = (net_batt_flow / 3600.0) / self.battery_capacity * 100.0
        new_soc = round(max(5.0, min(100.0, current_soc + soc_delta)), 2)

        # Renewable contribution percentage
        total_delivered = renewable_total + gen_output + batt_discharge
        renewable_pct = round((renewable_total / max(0.1, total_delivered)) * 100.0, 1) if total_delivered > 0 else 100.0
        renewable_pct = min(100.0, max(0.0, renewable_pct))

        return {
            "solar_output": solar_kw,
            "wind_output": wind_kw,
            "renewable_total": renewable_total,
            "gen_output": gen_output,
            "battery_charge": batt_charge,
            "battery_discharge": batt_discharge,
            "battery_power": round(batt_charge - batt_discharge, 1),
            "new_soc": new_soc,
            "active_load": active_load,
            "shed_amount": shed_amount,
            "net_balance": net_balance,
            "renewable_contribution": renewable_pct,
            "action_note": action_note
        }

optimizer = MicrogridOptimizer()
