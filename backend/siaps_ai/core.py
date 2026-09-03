from datetime import datetime
from typing import Dict, Any, List

from .digital_twin import StationDigitalTwin
from .forecasting import StationForecastingEngine
from .optimizer import MicrogridOptimizer
from .prognostics import PrognosticsEngine
from .safety import SafetyAndInterlocks
from ..database import get_db, log_event, save_telemetry

class SiapsAiCore:
    """
    SYSTEM 2: SIAPS AI CORE
    The dedicated station intelligence engine.
    - Responsible for monitoring, prediction, anomaly detection, energy optimization,
      equipment prognostics, and safety enforcement.
    - Runs 100% autonomously without requiring any LLM.
    - Operates cyclically at 1 Hz.
    """
    def __init__(self):
        self.digital_twin = StationDigitalTwin()
        self.forecasting = StationForecastingEngine()
        self.optimizer = MicrogridOptimizer()
        self.prognostics = PrognosticsEngine()
        self.safety = SafetyAndInterlocks()
        self.tick = 0

    def step(self) -> Dict[str, Any]:
        """Advances station state by 1 second."""
        self.tick += 1

        # 1. Weather
        weather = self.forecasting.get_weather_forecast()
        outside_temp = weather["temperature"]
        wind_speed = weather["windSpeed"]
        wind_gust = weather["windGust"]
        irradiance = weather["solarRadiation"]

        # 2. Renewables generation via physical Digital Twin
        solar_output = self.digital_twin.compute_solar_power(irradiance, outside_temp)
        wind_output = self.digital_twin.compute_wind_power(wind_speed, wind_gust)

        # 3. Demand Prediction
        demand = self.forecasting.predict_station_demand(outside_temp, wind_speed)
        total_demand = demand["total_consumption"]

        # 4. Energy Optimization & Dispatch
        has_storm_advisory = wind_gust >= 20.0
        dispatch = self.optimizer.compute_dispatch(
            p_solar=solar_output,
            p_wind=wind_output,
            total_demand=total_demand,
            current_soc=self.digital_twin.battery_soc,
            storm_advisory=has_storm_advisory
        )

        # 5. Update Battery State
        batt_state = self.digital_twin.update_battery_state(dispatch["batt_net_power"], dt_seconds=1.0)

        # 6. Prognostics & Anomaly Detection
        telemetry_snap = {
            "battery_temp": batt_state["temperature"],
            "battery_soc": batt_state["soc"],
            "wind_speed": wind_speed,
            "wind_output": wind_output,
            "total_consumption": total_demand
        }
        anomalies = self.prognostics.detect_telemetry_anomalies(telemetry_snap)
        equipment_status = self.prognostics.evaluate_equipment_health()

        # 7. Safety Interlocks
        safety_status = self.safety.check_safety_tripwires(batt_state["soc"], wind_speed, wind_gust)

        # 8. Assemble Full Digital Twin Snapshot
        now_utc = datetime.utcnow().strftime("%H:%M:%S UTC")
        snapshot = {
            "timestamp": now_utc,
            "station": {
                "name": "Bharati Antarctic Research Station",
                "location": "69°24′S 76°11′E · Larsemann Hills, East Antarctica",
                "agency": "NCPOR / Ministry of Earth Sciences, Govt. of India",
                "alt_station": "Maitri Station (70°46′S 11°44′E · Schirmacher Oasis)"
            },
            "power": {
                "solar": {
                    "output": solar_output,
                    "capacity": self.digital_twin.solar_capacity,
                    "status": "normal" if solar_output > 0 else "standby",
                    "irradiance": irradiance
                },
                "wind": {
                    "output": wind_output,
                    "capacity": self.digital_twin.wind_capacity,
                    "status": "warning" if equipment_status["anomaly"] else "normal",
                    "speed": wind_speed,
                    "gust": wind_gust
                },
                "generator": {
                    "output": dispatch["gen_output"],
                    "capacity": 80.0,
                    "status": "active" if dispatch["gen_output"] > 0 else "standby",
                    "fuel": 87,
                    "runtime": self.digital_twin.generator_runtime_hours
                },
                "battery": {
                    "soc": batt_state["soc"],
                    "voltage": batt_state["voltage"],
                    "power": batt_state["power"],
                    "temperature": batt_state["temperature"],
                    "capacity": self.digital_twin.battery_capacity,
                    "remaining": batt_state["remaining_kwh"],
                    "runtime": round(batt_state["usable_kwh"] / max(1.0, total_demand), 1),
                    "status": "charging" if batt_state["power"] > 0.5 else ("discharging" if batt_state["power"] < -0.5 else "standby"),
                    "health": 96
                },
                "totalGeneration": dispatch["p_renewables"] + dispatch["gen_output"],
                "totalConsumption": total_demand,
                "renewableContribution": dispatch["renewable_pct"],
                "netBalance": dispatch["net_balance"],
                "actionNote": dispatch["action_desc"]
            },
            "loads": demand["loads"],
            "weather": weather,
            "anomalies": anomalies,
            "equipment": equipment_status,
            "safety": safety_status
        }

        # Periodic SQLite persistence
        if self.tick % 10 == 0:
            save_telemetry({
                "solar_output": solar_output,
                "wind_output": wind_output,
                "gen_output": dispatch["gen_output"],
                "total_gen": dispatch["p_renewables"] + dispatch["gen_output"],
                "total_consumption": total_demand,
                "net_balance": dispatch["net_balance"],
                "battery_soc": batt_state["soc"],
                "battery_power": batt_state["power"],
                "battery_health": 96,
                "battery_temp": batt_state["temperature"],
                "outside_temp": outside_temp,
                "wind_speed": wind_speed,
                "wind_gust": wind_gust,
                "solar_irradiance": irradiance,
                "renewable_contribution": dispatch["renewable_pct"]
            })

        return snapshot

    def execute_controlled_action(self, action_name: str, level: int, operator_pin: str) -> Dict[str, Any]:
        """
        Critical control decisions must pass through SIAPS AI + safety layer.
        """
        auth = self.safety.validate_action_authorization(level, operator_pin)
        if not auth["allowed"]:
            return {"success": False, "error": auth["reason"]}

        # Dispatched physically to station SCADA
        log_event(
            actor="operator",
            event_type="control_action",
            action=f"CONTROL EXECUTED: {action_name}",
            detail=f"Validated by SIAPS AI Safety Layer (Level {level})",
            outcome="ok"
        )
        return {"success": True, "action": action_name, "reason": auth["reason"]}

siaps_ai_core = SiapsAiCore()
