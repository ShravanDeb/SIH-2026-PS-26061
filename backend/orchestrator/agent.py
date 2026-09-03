from typing import Dict, Any, Optional
from ..siaps_ai.core import siaps_ai_core
from ..llm.client import llm_service
from .tools import SiapsAiTools

class MissionControlAgent:
    """
    THE BRIDGE: AI AGENT ORCHESTRATOR
    - Connects the Operator, the LLM, and SIAPS AI.
    - Uses the LLM when language reasoning, conversation, or explanation is needed.
    - Calls SIAPS AI tools for ground-truth physical telemetry, models, and optimization.
    - Enforces that all critical control decisions pass through SIAPS AI + Safety Layer.
    """
    def __init__(self):
        self.tools = SiapsAiTools()
        self.llm = llm_service

    def answer_operator_query(self, query: str) -> Dict[str, Any]:
        # 1. Fetch deterministic truth from SIAPS AI Core
        telemetry = self.tools.get_station_telemetry()
        power = telemetry["power"]
        weather = telemetry["weather"]
        safety = telemetry["safety"]

        ground_truth_context = (
            f"Station: Bharati Antarctic Research Station (69°24′S 76°11′E, Larsemann Hills, Antarctica · NCPOR / MoES, Govt. of India)\n"
            f"Solar: {power['solar']['output']} kW / {power['solar']['capacity']} kW\n"
            f"Wind: {power['wind']['output']} kW / {power['wind']['capacity']} kW (Speed: {weather['windSpeed']} m/s)\n"
            f"Generator: {power['generator']['output']} kW (Status: {power['generator']['status']})\n"
            f"Battery: {power['battery']['soc']}% SOC, Voltage: {power['battery']['voltage']}V, Net: {power['battery']['power']} kW\n"
            f"Station Demand: {power['totalConsumption']} kW (Renewable Share: {power['renewableContribution']}%)\n"
            f"Outside Temperature: {weather['temperature']}°C\n"
            f"Emergency Status: {safety['emergency_status']}\n"
        )

        system_prompt = (
            "You are the AI Assistant for the SIAPS Arctic Polar Mission Control. "
            "You provide concise, factual, and technically accurate explanations based strictly on the ground-truth telemetry. "
            "Never invent numbers. If an action is requested, remind the operator of the required authorization level."
        )
        user_prompt = f"Ground Truth Station Telemetry:\n{ground_truth_context}\n\nOperator Query: {query}"

        # 2. Use LLM if available, otherwise deterministic answer
        if self.llm.is_available():
            explanation = self.llm.generate_response(system_prompt, user_prompt)
        else:
            explanation = (
                f"Ground truth telemetry: Solar={power['solar']['output']} kW, Wind={power['wind']['output']} kW, "
                f"Battery={power['battery']['soc']}%, Station Demand={power['totalConsumption']} kW. "
                f"Dispatch note: {power['actionNote']}."
            )

        return {
            "query": query,
            "response": explanation,
            "llm_active": self.llm.is_available(),
            "telemetry_snapshot": power
        }

    def request_action_execution(self, action_name: str, level: int, operator_pin: str) -> Dict[str, Any]:
        """
        Routes action request directly through SIAPS AI + safety layer.
        Does NOT allow LLM to bypass safety.
        """
        return self.tools.execute_action(action_name, level, operator_pin)

mission_agent = MissionControlAgent()
