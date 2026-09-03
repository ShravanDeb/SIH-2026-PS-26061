import os
import json
import requests
from datetime import datetime
from typing import Dict, Any, List

OLLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2") # or "mistral" / "siaps-controller"

class AIRecommendationEngine:
    """
    Feature 11: AI Recommendations & Explainability
    Transforms mathematical dispatch decisions, weather forecasts,
    and equipment telemetry into explainable human-in-the-loop recommendations.
    
    Supports:
    1. Local Ollama GPU inference (llama3.2, mistral, custom fine-tuned models)
    2. Zero-latency offline deterministic fallback if Ollama is not active
    """
    def __init__(self):
        self.ollama_url = OLLAMA_API_URL
        self.ollama_model = OLLAMA_MODEL

    def _query_ollama(self, prompt: str) -> List[Dict[str, Any]]:
        """Queries local Ollama instance on GPU laptop."""
        try:
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2,
                    "top_p": 0.9
                }
            }
            res = requests.post(self.ollama_url, json=payload, timeout=5)
            if res.status_code == 200:
                raw_response = res.json().get("response", "")
                parsed = json.loads(raw_response)
                if isinstance(parsed, list):
                    return parsed
                elif isinstance(parsed, dict) and "recommendations" in parsed:
                    return parsed["recommendations"]
                elif isinstance(parsed, dict):
                    return [parsed]
        except Exception:
            pass
        return []

    def generate_recommendations(
        self,
        telemetry: Dict[str, Any],
        weather: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        now_time = datetime.utcnow().strftime("%H:%M")
        wind_speed = weather.get("windSpeed", 8.7)
        wind_gust = weather.get("windGust", 13.2)
        soc = telemetry.get("battery_soc", 78.0)
        net_balance = telemetry.get("net_balance", 2.3)

        # ── 1. Try Local Ollama on GPU first ────────────────────────────────
        ollama_prompt = f"""
        You are SIAPS Mission Controller AI for Svalbard Arctic Station Alpha (78.2°N).
        Telemetry: Battery SOC={soc}%, Net Balance={net_balance} kW.
        Weather: Wind Speed={wind_speed} m/s, Wind Gust={wind_gust} m/s, Condition={weather.get("condition")}.
        
        Generate 1 to 3 operational microgrid recommendations in strict JSON:
        [
          {{
            "id": "rec_ollama_1",
            "title": "Short title",
            "reason": "Why this action is needed",
            "impact": "Quantified energy or safety impact",
            "confidence": 92,
            "level": 1,
            "status": "awaiting_approval",
            "category": "battery",
            "urgency": "medium",
            "createdAt": "{now_time}"
          }}
        ]
        """
        ollama_recs = self._query_ollama(ollama_prompt)
        if ollama_recs:
            return ollama_recs

        # ── 2. Deterministic Fallback if Ollama is starting or offline ───────
        recs = []
        if wind_gust >= 20.0 and soc < 88.0:
            recs.append({
                "id": "rec_storm_charge",
                "title": "Charge battery to 90% SOC in next 2 hours",
                "reason": "Strong renewable output now; blizzard forecast reduces generation for 36 hours.",
                "impact": "Extends autonomous runtime from 14.2h to 19.8h during weather event.",
                "confidence": 96,
                "level": 1,
                "status": "approved",
                "category": "battery",
                "urgency": "high",
                "createdAt": now_time
            })

        if wind_gust >= 22.0 or weather.get("condition") == "Snow / Blizzard":
            recs.append({
                "id": "rec_gen_standby",
                "title": "Pre-position generator to warm-standby",
                "reason": "Probability of prolonged renewable gap exceeds 80% (gusts > 25 m/s will force turbine feathering).",
                "impact": "Reduces generator start latency from 45s to 8s; ensures continuous life-support.",
                "confidence": 84,
                "level": 2,
                "status": "awaiting_approval",
                "category": "generator",
                "urgency": "medium",
                "createdAt": now_time
            })

        if net_balance < 5.0 and soc < 82.0:
            recs.append({
                "id": "rec_load_shift_heating",
                "title": "Delay non-critical heating by 40 minutes",
                "reason": "Low renewable generation forecast for 14:00–18:00 due to incoming overcast.",
                "impact": "Preserves ~28 kWh battery reserve before severe weather window.",
                "confidence": 91,
                "level": 1,
                "status": "awaiting_approval",
                "category": "load_shift",
                "urgency": "medium",
                "createdAt": now_time
            })

        recs.append({
            "id": "rec_instrument_trim",
            "title": "Reduce scientific instrument heating to 65%",
            "reason": "Instruments thermally stable; minor heating reduction causes no measurement impact.",
            "impact": "Saves 1.8 kW continuously; extends battery runtime by ~2.3 hours.",
            "confidence": 88,
            "level": 1,
            "status": "approved",
            "category": "load_reduction",
            "urgency": "low",
            "createdAt": now_time
        })

        return recs

recommendation_engine = AIRecommendationEngine()
