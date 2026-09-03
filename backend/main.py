import asyncio
import json
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .database import init_db, get_db, log_event, save_telemetry
from .simulator import station_simulator
from .recommendations import recommendation_engine
from .approval_engine import approval_engine

app = FastAPI(
    title="SIAPS AI Engine — Svalbard Station Alpha",
    description="100% Free & Open-Source Autonomous Microgrid Intelligence Backend (SIH 2026 PS-26061)",
    version="1.0.0"
)

# Enable CORS for React frontend (localhost:5173, etc.)
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
        action="SIAPS AI Core v1.0.0 Initialized",
        detail="All 15 Phase 1 AI sub-engines active · Free open-source stack operational",
        outcome="ok"
    )

# ── REST API Models ─────────────────────────────────────────────────────────

class ActionRequest(BaseModel):
    decision: str # "approved", "rejected", "delayed"
    operator: str = "Operator"
    pin: Optional[str] = None

class OverrideRequest(BaseModel):
    action: str
    operator: str = "Lead Operator"
    pin: str

# ── REST API Endpoints ──────────────────────────────────────────────────────

@app.get("/api/status")
def get_station_status():
    """Returns complete current snapshot of station telemetry & physics."""
    state = station_simulator.get_live_state()
    save_telemetry({
        "solar_output": state["power"]["solar"]["output"],
        "wind_output": state["power"]["wind"]["output"],
        "gen_output": state["power"]["generator"]["output"],
        "total_gen": state["power"]["totalGeneration"],
        "total_consumption": state["power"]["totalConsumption"],
        "net_balance": state["power"]["netBalance"],
        "battery_soc": state["power"]["battery"]["soc"],
        "battery_power": state["power"]["battery"]["power"],
        "battery_health": state["power"]["battery"]["health"],
        "battery_temp": state["power"]["battery"]["temperature"],
        "outside_temp": state["weather"]["temperature"],
        "wind_speed": state["weather"]["windSpeed"],
        "wind_gust": state["weather"]["windGust"],
        "solar_irradiance": state["weather"]["solarRadiation"],
        "renewable_contribution": state["power"]["renewableContribution"]
    })
    return state

@app.get("/api/recommendations")
def get_recommendations():
    """Generates explainable AI recommendations based on live state."""
    state = station_simulator.get_live_state()
    telemetry = {
        "battery_soc": state["power"]["battery"]["soc"],
        "net_balance": state["power"]["netBalance"]
    }
    recs = recommendation_engine.generate_recommendations(telemetry, state["weather"])
    return recs

@app.post("/api/recommendations/{rec_id}/action")
def resolve_recommendation(rec_id: str, payload: ActionRequest):
    """Executes Human-in-the-Loop decision (Approve / Reject / Delay) with PIN authorization."""
    res = approval_engine.resolve_recommendation(
        rec_id=rec_id,
        decision=payload.decision,
        operator=payload.operator,
        pin=payload.pin
    )
    if not res.get("success"):
        raise HTTPException(status_code=403, detail=res.get("error", "Action unauthorized"))
    return res

@app.post("/api/override")
def manual_override(payload: OverrideRequest):
    """Executes critical manual emergency override with PIN verification."""
    res = approval_engine.execute_override(
        action=payload.action,
        operator=payload.operator,
        pin=payload.pin
    )
    if not res.get("success"):
        raise HTTPException(status_code=403, detail=res.get("error", "Access denied"))
    return res

@app.get("/api/logs")
def get_event_logs():
    """Returns immutable audit trail of events, decisions, and overrides."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events_log ORDER BY id DESC LIMIT 50")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/equipment")
def get_equipment():
    """Returns monitored fleet health scores and predictive maintenance status."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM equipment_health")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# ── Live WebSocket 1 Hz Telemetry Broadcast ────────────────────────────────

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            state = station_simulator.get_live_state()
            await websocket.send_json(state)
            await asyncio.sleep(1.0) # 1 Hz real-time updates
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
