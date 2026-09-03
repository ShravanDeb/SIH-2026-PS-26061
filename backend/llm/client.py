import os
import json
import requests
from typing import Dict, Any, Optional

OLLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

class LlmService:
    """
    SYSTEM 1: LLM ENGINE
    Used ONLY for:
    - Natural language understanding & operator conversation
    - Generating plain-English explanations and executive summaries
    - Interpreting complex multi-variable situations for operators
    NOT the SIAPS AI. Does NOT execute physical controls directly.
    """
    def __init__(self):
        self.api_url = OLLAMA_API_URL
        self.model = OLLAMA_MODEL

    def is_available(self) -> bool:
        try:
            res = requests.get("http://localhost:11434/api/tags", timeout=1.5)
            return res.status_code == 200
        except Exception:
            return False

    def generate_response(self, system_prompt: str, user_prompt: str, format_json: bool = False) -> str:
        """Sends prompt to local Ollama on GPU/CPU."""
        payload = {
            "model": self.model,
            "prompt": f"<|system|>\n{system_prompt}\n<|user|>\n{user_prompt}\n<|assistant|>",
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9
            }
        }
        if format_json:
            payload["format"] = "json"

        try:
            res = requests.post(self.api_url, json=payload, timeout=8)
            if res.status_code == 200:
                return res.json().get("response", "").strip()
        except Exception as e:
            return f"[LLM Offline: {str(e)}]"

        return "[LLM returned empty response]"

llm_service = LlmService()
