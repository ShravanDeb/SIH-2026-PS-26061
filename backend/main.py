import asyncio
import json
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .database import init_db, get_db, log_event
from .siaps_ai.core import siaps_ai_core
from .siaps_ai.recommendations import siaps_recommendations
from .siaps_ai.approval_engine import approval_engine
from .llm.client import llm_service
from .orchestrator.agent import mission_agent

app = FastAPI(
    title="SIAPS Mission Control Platform",
    description="Decoupled Cyber-Physical Architecture: 1. LLM (Ollama) + 2. SIAPS AI Core + AI Agent Orchestrator",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    log_event(
        actor="system",
        event_type="system",
        action="SIAPS Dual-AI Architecture Online",
        detail="System 1 (LLM/Ollama) and System 2 (SIAPS AI Core) initialized independently with Agent Bridge.",
        outcome="ok"
    )

# ── API Models ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str

class ActionRequest(BaseModel):
    decision: str # "approved", "rejected", "delayed"
    operator: str = "Lead Operator"
    pin: Optional[str] = None

class ControlActionRequest(BaseModel):
    action: str
    level: int = 2
    pin: str

# ── REST API Endpoints ──────────────────────────────────────────────────────

@app.get("/api/system-status")
def get_system_architecture_status():
    """Confirms both AI systems and the orchestrator state."""
    return {
        "siaps_ai_core": {
            "status": "active",
            "independent": True,
            "role": "Station monitoring, forecasting, optimization, prognostics & safety interlocks"
        },
        "llm_engine": {
            "status": "connected" if llm_service.is_available() else "standby_offline",
            "model": llm_service.model,
            "role": "Natural language reasoning, operator dialogue, and explanations"
        },
        "orchestrator_agent": {
            "status": "active",
            "role": "Bridges Operator <-> LLM <-> SIAPS AI Core Tools"
        }
    }

@app.get("/api/status")
def get_live_station_status():
    """Directly queries the SIAPS AI Core (independent of LLM)."""
    return siaps_ai_core.step()

@app.post("/api/chat")
def operator_chat(payload: ChatRequest):
    """
    Operator conversation routed through the AI Agent Orchestrator:
    Queries ground truth from SIAPS AI Core, then invokes LLM for language explanation.
    """
    return mission_agent.answer_operator_query(payload.query)

@app.get("/api/recommendations")
def get_recommendations():
    """Generates explainable operational recommendations."""
    state = siaps_ai_core.step()
    telemetry = {
        "battery_soc": state["power"]["battery"]["soc"],
        "net_balance": state["power"]["netBalance"]
    }
    return siaps_recommendations.evaluate_recommendations(telemetry, state["weather"])

@app.post("/api/recommendations/{rec_id}/action")
def resolve_recommendation(rec_id: str, payload: ActionRequest):
    """Routes decision through SIAPS AI + safety layer."""
    res = approval_engine.resolve_recommendation(
        rec_id=rec_id,
        decision=payload.decision,
        operator=payload.operator,
        pin=payload.pin
    )
    if not res.get("success"):
        raise HTTPException(status_code=403, detail=res.get("error", "Action unauthorized"))
    return res

@app.post("/api/control")
def execute_controlled_action(payload: ControlActionRequest):
    """
    Critical control decisions go strictly through SIAPS AI Core + safety layer.
    The LLM has zero authority to bypass this.
    """
    res = siaps_ai_core.execute_controlled_action(
        action_name=payload.action,
        level=payload.level,
        operator_pin=payload.pin
    )
    if not res.get("success"):
        raise HTTPException(status_code=403, detail=res.get("error", "Action blocked by safety layer"))
    return res

@app.get("/api/logs")
def get_event_logs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events_log ORDER BY id DESC LIMIT 50")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── WebSocket 1 Hz Telemetry Broadcast (SIAPS AI Core) ─────────────────────

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # SIAPS AI Core runs autonomously at 1 Hz
            state = siaps_ai_core.step()
            await websocket.send_json(state)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
