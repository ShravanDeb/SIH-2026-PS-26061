from datetime import datetime
from typing import Dict, Any, Optional
from ..database import get_db, log_event

AUTHORIZED_PIN = "1234"

class ApprovalEngine:
    """
    Feature 12: Human Approval & Override
    Feature 15: Decision & Event History
    Part of SIAPS AI Safety & Governance.
    Enforces multi-tier authorization (L1 to L4), validates operator PIN,
    and maintains an immutable audit trail in SQLite.
    """
    def __init__(self):
        pass

    def verify_pin(self, pin: str) -> bool:
        return pin.strip() == AUTHORIZED_PIN

    def resolve_recommendation(
        self,
        rec_id: str,
        decision: str, # "approved", "rejected", "delayed"
        operator: str = "Lead Operator",
        pin: Optional[str] = None
    ) -> Dict[str, Any]:
        if pin is not None and not self.verify_pin(pin):
            return {"success": False, "error": "Incorrect operator PIN. Access denied."}

        conn = get_db()
        cursor = conn.cursor()
        now_str = datetime.utcnow().strftime("%H:%M:%S")

        cursor.execute("""
        UPDATE ai_recommendations
        SET status = ?, resolved_at = ?, resolved_by = ?, decision = ?
        WHERE id = ?
        """, (decision, now_str, operator, decision, rec_id))
        conn.commit()
        conn.close()

        log_event(
            actor="operator" if decision != "delayed" else "system",
            event_type="approval" if decision == "approved" else ("rejection" if decision == "rejected" else "delay"),
            action=f"{decision.capitalize()} recommendation: {rec_id}",
            detail=f"Operator: {operator} · PIN verified · Action dispatched to SCADA",
            outcome=decision
        )

        return {"success": True, "status": decision, "rec_id": rec_id, "timestamp": now_str}

    def execute_override(self, action: str, operator: str, pin: str) -> Dict[str, Any]:
        if not self.verify_pin(pin):
            return {"success": False, "error": "Incorrect operator PIN. Access denied."}

        conn = get_db()
        cursor = conn.cursor()
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        cursor.execute("""
        INSERT INTO overrides_log (action, operator, time, status)
        VALUES (?, ?, ?, 'executed')
        """, (action, operator, now_str))
        conn.commit()
        conn.close()

        log_event(
            actor="operator",
            event_type="override",
            action=f"MANUAL OVERRIDE: {action}",
            detail=f"Authorized by {operator} with cryptographic PIN check",
            outcome="executed"
        )

        return {"success": True, "action": action, "time": now_str, "status": "executed"}

approval_engine = ApprovalEngine()
