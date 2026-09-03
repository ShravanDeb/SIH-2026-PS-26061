import os
import json
import requests
from typing import Dict, Any, Optional

import time

OLLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://127.0.0.1:11434/api/generate")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

class LlmService:
    """
    SYSTEM 1: LLM ENGINE (Operator Copilot)
    """
    def __init__(self):
        self.api_url = OLLAMA_API_URL
        self.model = OLLAMA_MODEL
        self._cached_available = False
        self._last_check = 0.0

    def is_available(self) -> bool:
        now = time.time()
        if now - self._last_check < 10.0:
            return self._cached_available

        self._last_check = now
        try:
            res = requests.get("http://127.0.0.1:11434/api/tags", timeout=0.4)
            self._cached_available = (res.status_code == 200)
        except Exception:
            self._cached_available = False
        return self._cached_available

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
