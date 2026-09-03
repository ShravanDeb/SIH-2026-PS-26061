from typing import Dict, Any, List

class DemandForecaster:
    """
    Feature 3: Energy Demand Prediction
    Calculates station thermal loss & mission equipment demand.
    Q_loss = U * Area * (T_target - T_outside)
    """
    def __init__(self):
        # Base station parameters
        self.cabin_target_temp = 19.0 # °C
        self.cabin_u_value = 0.28     # W/m²K (Arctic insulated shell)
        self.cabin_surface_area = 380 # m²
        
        # Priority tiers breakdown (nominal kW)
        self.tier_specs = {
            0: {"name": "Critical / Life-Support", "nominal": 12.8, "sheddable": False},
            1: {"name": "Scientific Equipment",   "nominal": 11.4, "sheddable": True, "min_factor": 0.65},
            2: {"name": "Heating & HVAC",          "nominal": 9.6,  "sheddable": True, "thermal_dependent": True},
            3: {"name": "Communication",           "nominal": 2.1,  "sheddable": False},
            4: {"name": "Computing & Data",        "nominal": 5.8,  "sheddable": True, "min_factor": 0.5},
            5: {"name": "General Appliances",      "nominal": 3.9,  "sheddable": True},
            6: {"name": "Flexible Loads",          "nominal": 1.7,  "sheddable": True},
        }

    def predict_demand(self, outside_temp: float, wind_speed: float, occupancy: int = 4) -> Dict[str, Any]:
        delta_t = max(0.0, self.cabin_target_temp - outside_temp)
        # Wind chill accelerates thermal boundary layer loss
        wind_chill_factor = 1.0 + (wind_speed / 25.0) * 0.35
        heating_kw = round((self.cabin_u_value * self.cabin_surface_area * delta_t * wind_chill_factor) / 1000.0 + 4.5, 1)

        loads = [
            {"name": "Critical / Life-Support", "value": 12.8, "priority": 0, "color": "#ef4444"},
            {"name": "Scientific Equipment",   "value": 11.4, "priority": 1, "color": "#8b5cf6"},
            {"name": "Heating & HVAC",          "value": heating_kw, "priority": 2, "color": "#f97316"},
            {"name": "Communication",           "value": 2.1,  "priority": 3, "color": "#0ea5e9"},
            {"name": "Computing & Data",        "value": 5.8,  "priority": 4, "color": "#06b6d4"},
            {"name": "General Appliances",      "value": 3.9,  "priority": 5, "color": "#64748b"},
            {"name": "Flexible Loads",          "value": 1.7,  "priority": 6, "color": "#94a3b8"},
        ]
        total_kw = round(sum(l["value"] for l in loads), 1)

        return {
            "total_consumption": total_kw,
            "loads": loads,
            "heating_demand": heating_kw,
            "occupancy": occupancy
        }

demand_forecaster = DemandForecaster()
