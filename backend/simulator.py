import math
import random
from datetime import datetime
from typing import Dict, Any

from .weather import weather_service
from .demand_forecaster import demand_forecaster
from .optimizer import optimizer
from .anomaly_detector import anomaly_detector
from .predictive_maintenance import predictive_maintenance
from .failsafe import safety_engine

class StationSimulator:
    """
    Feature 1: Real-Time Station Monitoring
    Feature 14: Digital Twin / Simulation
    Virtual cyber-physical model of Svalbard Station Alpha (78.2°N 15.4°E).
    Continuously advances station state at 1 Hz, modeling solar physics,
    turbine aerodynamics, battery electrochemistry, and cabin thermodynamics.
    """
    def __init__(self):
        # Physical station parameters
        self.solar_capacity = 48.0 # kW
        self.wind_capacity = 60.0  # kW (2 x 30 kW)
        self.battery_capacity_kwh = 400.0
        self.current_soc = 78.0
        self.battery_voltage = 54.2
        self.battery_temp = 18.4
        self.generator_runtime_hours = 1247.0

        # Step counter
        self.tick_count = 0

    def calculate_solar_output(self, irradiance: float, ambient_temp: float) -> float:
        """PVLib-derived solar physics: P = Cap * (G/1000) * [1 + gamma*(Tcell - 25)]"""
        if irradiance <= 0:
            return 0.0
        t_cell = ambient_temp + (irradiance / 800.0) * 25.0
        temp_coeff = 1.0 - 0.0038 * (t_cell - 25.0)
        p_raw = self.solar_capacity * (irradiance / 1000.0) * temp_coeff * 0.95 # soiling factor
        return round(max(0.0, min(self.solar_capacity, p_raw)), 1)

    def calculate_wind_output(self, wind_speed: float, wind_gust: float) -> float:
        """Aerodynamic wind turbine power curve with 25 m/s auto-feathering"""
        if wind_speed >= 25.0 or wind_gust >= 28.0:
            # Auto-feathering cutoff
            return 0.0
        if wind_speed < 3.0:
            return 0.0
        elif wind_speed < 12.0:
            # Cubic power region: P = 0.5 * rho * A * Cp * v^3
            v_norm = (wind_speed - 3.0) / (12.0 - 3.0)
            p = self.wind_capacity * (v_norm ** 2.2)
            return round(max(0.0, min(self.wind_capacity, p)), 1)
        else:
            # Rated power region
            return round(self.wind_capacity * 0.95, 1)

    def get_live_state(self) -> Dict[str, Any]:
        self.tick_count += 1
        
        # 1. Weather
        weather = weather_service.get_weather_and_forecast()
        outside_temp = weather.get("temperature", -18.4)
        wind_speed = weather.get("windSpeed", 8.7)
        wind_gust = weather.get("windGust", 13.2)
        irradiance = weather.get("solarRadiation", 312.0)

        # 2. Renewables Generation
        # Add slight natural fluctuation to irradiance and wind
        jitter_irr = max(0.0, irradiance + math.sin(self.tick_count * 0.1) * 15.0)
        jitter_wind = max(0.0, wind_speed + math.sin(self.tick_count * 0.15) * 1.2)
        
        solar_output = self.calculate_solar_output(jitter_irr, outside_temp)
        wind_output = self.calculate_wind_output(jitter_wind, wind_gust)

        # 3. Demand Prediction
        demand = demand_forecaster.predict_demand(outside_temp, jitter_wind)
        total_consumption = demand["total_consumption"]

        # 4. Energy Management & Optimal Dispatch
        has_storm_advisory = bool(weather.get("alerts"))
        dispatch = optimizer.optimize_dispatch(
            solar_kw=solar_output,
            wind_kw=wind_output,
            total_load_kw=total_consumption,
            current_soc=self.current_soc,
            storm_advisory=has_storm_advisory
        )

        # Update battery state
        self.current_soc = dispatch["new_soc"]
        batt_power = dispatch["battery_power"] # + charging, - discharging
        # Estimate runtime remaining: (usable kWh / load kW)
        usable_kwh = max(0.0, (self.current_soc - 20.0) / 100.0 * self.battery_capacity_kwh)
        est_runtime = round(usable_kwh / max(1.0, total_consumption), 1)

        # Battery voltage & temperature dynamics
        self.battery_voltage = round(48.0 + (self.current_soc / 100.0) * 6.5, 1)
        self.battery_temp = round(18.0 + abs(batt_power) * 0.08, 1)

        # 5. Anomaly Detection
        telemetry_snap = {
            "battery_temp": self.battery_temp,
            "battery_soc": self.current_soc,
            "wind_speed": jitter_wind,
            "wind_output": wind_output,
            "total_consumption": total_consumption
        }
        anomalies = anomaly_detector.check_telemetry(telemetry_snap)

        # 6. Predictive Maintenance (Turbine T-2)
        maint_status = predictive_maintenance.analyze_turbine_vibration(synthetic_severity=0.87)

        # 7. Safety Interlocks
        safety = safety_engine.evaluate_safety(telemetry_snap, weather)

        now_utc = datetime.utcnow().strftime("%H:%M:%S UTC")

        return {
            "timestamp": now_utc,
            "station": {
                "name": "SIAPS — Svalbard Station Alpha",
                "location": "78.2°N 15.4°E · Svalbard, Norway",
                "operatingMode": "autonomous",
                "overallHealth": 94,
                "uptime": "127d 14h 23m"
            },
            "power": {
                "solar": {
                    "output": solar_output,
                    "capacity": self.solar_capacity,
                    "status": "normal" if solar_output > 0 else "standby",
                    "irradiance": round(jitter_irr, 1)
                },
                "wind": {
                    "output": wind_output,
                    "capacity": self.wind_capacity,
                    "status": "warning" if maint_status["anomaly_detected"] else "normal",
                    "speed": round(jitter_wind, 1),
                    "gust": round(wind_gust, 1)
                },
                "generator": {
                    "output": dispatch["gen_output"],
                    "capacity": 80.0,
                    "status": "active" if dispatch["gen_output"] > 0 else "standby",
                    "fuel": 87,
                    "runtime": round(self.generator_runtime_hours, 1)
                },
                "battery": {
                    "soc": round(self.current_soc, 1),
                    "voltage": self.battery_voltage,
                    "current": round((batt_power * 1000.0) / max(1.0, self.battery_voltage), 1),
                    "power": batt_power,
                    "health": 96,
                    "temperature": self.battery_temp,
                    "capacity": self.battery_capacity_kwh,
                    "remaining": round((self.current_soc / 100.0) * self.battery_capacity_kwh, 1),
                    "runtime": est_runtime,
                    "status": "charging" if batt_power > 0.5 else ("discharging" if batt_power < -0.5 else "standby"),
                    "degradation": 4
                },
                "totalGeneration": dispatch["renewable_total"] + dispatch["gen_output"],
                "totalConsumption": total_consumption,
                "renewableContribution": dispatch["renewable_contribution"],
                "netBalance": dispatch["net_balance"],
                "actionNote": dispatch["action_note"]
            },
            "loads": demand["loads"],
            "weather": weather,
            "anomalies": anomalies,
            "equipmentHealth": maint_status,
            "safety": safety
        }

station_simulator = StationSimulator()
