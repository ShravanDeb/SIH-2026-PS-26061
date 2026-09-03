from typing import Dict, Any
from ..siaps_ai.core import siaps_ai_core

class SiapsAiTools:
    """
    Typed tools interface exposing SIAPS AI capabilities to the Orchestrator.
    """
    @staticmethod
    def get_station_telemetry() -> Dict[str, Any]:
        return siaps_ai_core.step()

    @staticmethod
    def get_weather_forecast() -> Dict[str, Any]:
        return siaps_ai_core.forecasting.get_weather_forecast()

    @staticmethod
    def get_prognostics() -> Dict[str, Any]:
        return siaps_ai_core.prognostics.evaluate_equipment_health()

    @staticmethod
    def execute_action(action_name: str, level: int, operator_pin: str) -> Dict[str, Any]:
        return siaps_ai_core.execute_controlled_action(action_name, level, operator_pin)
