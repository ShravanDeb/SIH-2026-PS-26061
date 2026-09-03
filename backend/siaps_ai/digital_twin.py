import math
from typing import Dict, Any

class StationDigitalTwin:
    """
    Physical virtual model of Svalbard Station Alpha (78.2°N 15.4°E).
    Calculates solar array physics, wind turbine aerodynamics,
    and LiFePO4 battery dynamics.
    Operates 100% deterministically without LLM.
    """
    def __init__(self):
        self.solar_capacity = 48.0 # kW
        self.wind_capacity = 60.0  # kW (2x 30 kW)
        self.battery_capacity = 400.0 # kWh
        self.battery_soc = 78.0
        self.battery_temp = 18.4
        self.battery_voltage = 54.2
        self.generator_runtime_hours = 1247.0

    def compute_solar_power(self, irradiance: float, ambient_temp: float) -> float:
        if irradiance <= 0:
            return 0.0
        t_cell = ambient_temp + (irradiance / 800.0) * 25.0
        temp_coeff = 1.0 - 0.0038 * (t_cell - 25.0)
        p = self.solar_capacity * (irradiance / 1000.0) * temp_coeff * 0.95
        return round(max(0.0, min(self.solar_capacity, p)), 1)

    def compute_wind_power(self, wind_speed: float, wind_gust: float) -> float:
        # Automatic feathering safety cutoff at 25 m/s
        if wind_speed >= 25.0 or wind_gust >= 28.0:
            return 0.0
        if wind_speed < 3.0:
            return 0.0
        elif wind_speed < 12.0:
            v_norm = (wind_speed - 3.0) / 9.0
            p = self.wind_capacity * (v_norm ** 2.2)
            return round(max(0.0, min(self.wind_capacity, p)), 1)
        else:
            return round(self.wind_capacity * 0.95, 1)

    def update_battery_state(self, net_flow_kw: float, dt_seconds: float = 1.0) -> Dict[str, Any]:
        """
        Calculates Coulomb counting, voltage curve, and temperature change.
        + net_flow_kw = charging, - net_flow_kw = discharging.
        """
        efficiency = 0.95 if net_flow_kw >= 0 else (1.0 / 0.95)
        energy_delta = (net_flow_kw * efficiency) * (dt_seconds / 3600.0)
        soc_delta = (energy_delta / self.battery_capacity) * 100.0
        self.battery_soc = round(max(5.0, min(100.0, self.battery_soc + soc_delta)), 2)
        
        # Dynamic voltage and cell temperature response
        self.battery_voltage = round(48.0 + (self.battery_soc / 100.0) * 6.5, 1)
        self.battery_temp = round(18.0 + abs(net_flow_kw) * 0.08, 1)

        # Usable runtime calculation down to 20% reserve
        usable_kwh = max(0.0, (self.battery_soc - 20.0) / 100.0 * self.battery_capacity)

        return {
            "soc": self.battery_soc,
            "voltage": self.battery_voltage,
            "temperature": self.battery_temp,
            "usable_kwh": round(usable_kwh, 1),
            "remaining_kwh": round((self.battery_soc / 100.0) * self.battery_capacity, 1),
            "power": round(net_flow_kw, 1)
        }
