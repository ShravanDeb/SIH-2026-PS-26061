from typing import Dict, Any

class MicrogridOptimizer:
    """
    SIAPS AI Core Dispatch Optimizer:
    - Prioritizes solar & wind renewable generation.
    - Manages battery storage within safe longevity bounds (20% to 90%).
    - Minimizes diesel generator runtime and fuel.
    - Executes tiered load shedding when physical capacity is constrained.
    - 100% deterministic mathematical model. No LLM involved.
    """
    def __init__(self, battery_capacity_kwh: float = 400.0):
        self.battery_capacity = battery_capacity_kwh
        self.max_inverter_kw = 50.0
        self.max_generator_kw = 80.0

    def compute_dispatch(
        self,
        p_solar: float,
        p_wind: float,
        total_demand: float,
        current_soc: float,
        storm_advisory: bool = False
    ) -> Dict[str, Any]:
        p_renewables = round(p_solar + p_wind, 1)
        net_balance = round(p_renewables - total_demand, 1)

        batt_charge = 0.0
        batt_discharge = 0.0
        gen_output = 0.0
        shed_kw = 0.0

        if net_balance >= 0:
            # Renewable Surplus -> Charge battery up to 90% (95% if pre-storm)
            target_soc = 95.0 if storm_advisory else 90.0
            headroom = max(0.0, (target_soc - current_soc) / 100.0 * self.battery_capacity)
            batt_charge = round(min(net_balance, self.max_inverter_kw, headroom), 1)
            action_desc = f"Renewable surplus +{net_balance} kW routed to battery bank."
        else:
            # Renewable Deficit -> Discharge battery down to 20%
            deficit = abs(net_balance)
            usable_reserve = max(0.0, (current_soc - 20.0) / 100.0 * self.battery_capacity)
            batt_discharge = round(min(deficit, self.max_inverter_kw, usable_reserve), 1)
            remaining_gap = round(deficit - batt_discharge, 1)

            if remaining_gap > 0:
                # If battery cannot cover gap, dispatch generator
                gen_output = round(min(remaining_gap, self.max_generator_kw), 1)
                shortfall = round(remaining_gap - gen_output, 1)
                if shortfall > 0:
                    # Emergency load shedding
                    shed_kw = shortfall
                    action_desc = f"Tier 6 load shedding active: {shed_kw} kW deferred."
                else:
                    action_desc = f"Generator active at {gen_output} kW to cover deficit."
            else:
                action_desc = "Battery discharging nominally to cover demand."

        batt_net = round(batt_charge - batt_discharge, 1)
        delivered_total = p_renewables + gen_output + batt_discharge
        renewable_pct = round((p_renewables / max(0.1, delivered_total)) * 100.0, 1) if delivered_total > 0 else 100.0

        return {
            "p_solar": p_solar,
            "p_wind": p_wind,
            "p_renewables": p_renewables,
            "gen_output": gen_output,
            "batt_charge": batt_charge,
            "batt_discharge": batt_discharge,
            "batt_net_power": batt_net,
            "shed_kw": shed_kw,
            "net_balance": net_balance,
            "renewable_pct": min(100.0, max(0.0, renewable_pct)),
            "action_desc": action_desc
        }
