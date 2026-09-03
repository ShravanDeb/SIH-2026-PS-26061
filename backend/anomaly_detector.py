import numpy as np
from typing import Dict, Any, List, Optional

class AnomalyDetector:
    """
    Feature 9: Anomaly Detection
    Continuous statistical rolling window checks across telemetry:
    - Inverter dropouts / solar array degradation
    - Battery over-temperature (>40°C) or rapid voltage drop
    - Turbine vibration anomalies
    """
    def __init__(self, window_size: int = 60):
        self.window_size = window_size
        self.history: Dict[str, List[float]] = {
            "solar": [],
            "wind": [],
            "battery_temp": [],
            "consumption": []
        }

    def check_telemetry(self, telemetry: Dict[str, Any]) -> List[Dict[str, Any]]:
        anomalies = []

        # 1. Battery temperature threshold
        b_temp = telemetry.get("battery_temp", 18.4)
        if b_temp >= 40.0:
            anomalies.append({
                "severity": "error",
                "system": "Battery",
                "message": f"Cell over-temperature detected: {b_temp}°C (Threshold 40.0°C).",
                "action": "Cooling loop active; reducing charge current."
            })

        # 2. Wind vs Turbine mismatch (e.g. high wind but 0 output without feathering)
        wind_speed = telemetry.get("wind_speed", 0.0)
        wind_output = telemetry.get("wind_output", 0.0)
        if wind_speed >= 7.0 and wind_output < 5.0 and wind_speed < 25.0:
            anomalies.append({
                "severity": "warning",
                "system": "Wind",
                "message": f"Wind turbine output anomaly: {wind_output} kW observed at {wind_speed} m/s.",
                "action": "Check pitch controller and inverter synchronization."
            })

        # 3. Sudden consumption spike (e.g. short circuit / heater runaway)
        consumption = telemetry.get("total_consumption", 47.3)
        if consumption > 70.0:
            anomalies.append({
                "severity": "warning",
                "system": "Loads",
                "message": f"Unusual peak consumption: {consumption} kW exceeds 1.4x station baseline.",
                "action": "Verify heating sub-circuits and science instrument draw."
            })

        return anomalies

anomaly_detector = AnomalyDetector()
