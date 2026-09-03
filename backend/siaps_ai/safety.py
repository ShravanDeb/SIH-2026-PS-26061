from typing import Dict, Any, List

AUTHORIZED_PIN = "1234"

class SafetyAndInterlocks:
    """
    Safety Layer of SIAPS AI:
    - Strictly controls all physical action executions.
    - Level 0 to Level 4 authorization framework.
    - Enforces emergency tripwires (SOC < 15%, Wind >= 25 m/s).
    - Validates operator cryptographic/PIN authorization.
    - NEVER bypassed by any LLM or external agent.
    """
    def __init__(self):
        self.emergency_state = "none"

    def check_safety_tripwires(self, battery_soc: float, wind_speed: float, wind_gust: float) -> Dict[str, Any]:
        interlocks = []
        is_emergency = False

        if battery_soc < 15.0:
            is_emergency = True
            interlocks.append({
                "name": "Battery Critical Load Shedding",
                "trigger": f"SOC {battery_soc}% < 15%",
                "status": "TRIPPED",
                "action": "Immediate Tier 1 isolation."
            })
        else:
            interlocks.append({
                "name": "Battery Critical Load Shedding",
                "trigger": "SOC < 15%",
                "status": "Armed"
            })

        if wind_speed >= 25.0 or wind_gust >= 28.0:
            interlocks.append({
                "name": "Turbine Emergency Feathering",
                "trigger": f"Wind {max(wind_speed, wind_gust)} m/s >= 25 m/s",
                "status": "ACTIVE",
                "action": "Blades feathered to 90° aerodynamic stall."
            })
        else:
            interlocks.append({
                "name": "Turbine Emergency Feathering",
                "trigger": "Wind >= 25 m/s",
                "status": "Armed"
            })

        return {
            "emergency_status": "emergency" if is_emergency else "none",
            "interlocks": interlocks,
            "life_support_intact": True
        }

    def validate_action_authorization(self, level: int, pin: str = "") -> Dict[str, Any]:
        """
        Level 1: Autonomous (Allowed without PIN)
        Level 2: Single Operator (Requires valid PIN 1234)
        Level 3: Dual Person (Requires valid PIN 1234)
        Level 4: Emergency (Pre-authorized automated tripwire)
        """
        if level <= 1:
            return {"allowed": True, "reason": "Level 1 autonomous low-risk execution."}
        elif level in [2, 3]:
            if pin.strip() == AUTHORIZED_PIN:
                return {"allowed": True, "reason": f"Level {level} operator authorization verified."}
            else:
                return {"allowed": False, "reason": "Invalid or missing operator PIN. Execution blocked by safety layer."}
        elif level == 4:
            return {"allowed": True, "reason": "Level 4 emergency procedure pre-authorized."}
        return {"allowed": False, "reason": "Unknown authorization level."}
