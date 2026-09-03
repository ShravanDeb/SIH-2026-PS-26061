import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "siaps.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Telemetry records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        solar_output REAL,
        wind_output REAL,
        gen_output REAL,
        total_gen REAL,
        total_consumption REAL,
        net_balance REAL,
        battery_soc REAL,
        battery_power REAL,
        battery_health REAL,
        battery_temp REAL,
        outside_temp REAL,
        wind_speed REAL,
        wind_gust REAL,
        solar_irradiance REAL,
        renewable_contribution REAL
    );
    """)

    # AI Recommendations
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ai_recommendations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        reason TEXT NOT NULL,
        impact TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        level INTEGER NOT NULL,
        status TEXT NOT NULL,
        category TEXT NOT NULL,
        urgency TEXT NOT NULL,
        created_at TEXT NOT NULL,
        resolved_at TEXT,
        resolved_by TEXT,
        decision TEXT
    );
    """)

    # Events & Decision Audit Log (Immutable)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT NOT NULL,
        actor TEXT NOT NULL,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        detail TEXT,
        outcome TEXT NOT NULL
    );
    """)

    # Equipment Registry & Health
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS equipment_health (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        health INTEGER NOT NULL,
        status TEXT NOT NULL,
        anomalies INTEGER NOT NULL,
        last_maintenance TEXT NOT NULL,
        next_maintenance TEXT NOT NULL,
        predicted_failure TEXT,
        detail TEXT
    );
    """)

    # Overrides log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS overrides_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        operator TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL
    );
    """)

    conn.commit()

    # Seed initial equipment if empty
    cursor.execute("SELECT COUNT(*) as count FROM equipment_health")
    if cursor.fetchone()["count"] == 0:
        initial_equipment = [
            ("eq1", "Solar Array — Array A", "Solar", 97, "normal", 0, "2025-01-15", "2025-07-15", None, "All 48 panels nominal; soiling loss 2.1%"),
            ("eq2", "Solar Array — Array B", "Solar", 91, "normal", 1, "2025-01-15", "2025-07-15", None, "Panel B-14 degraded output (-18%); monitoring"),
            ("eq3", "Wind Turbine T-1", "Wind", 98, "normal", 0, "2025-02-01", "2025-08-01", None, "42 rpm rotor, pitch 12°, gearbox 38°C — within spec"),
            ("eq4", "Wind Turbine T-2", "Wind", 89, "warning", 1, "2025-02-01", "2025-05-15", "Gearbox bearing wear — 45 days", "Vibration anomaly detected (0.87 mm/s RMS); recommend inspection"),
            ("eq5", "Battery Bank — Rack 1–4", "Battery", 96, "normal", 0, "2025-03-01", "2025-06-01", None, "Capacity 400 kWh, degradation 4%, all cells balanced"),
            ("eq6", "Diesel Generator G-1", "Generator", 94, "normal", 0, "2025-02-20", "2025-05-20", None, "1247 hours total runtime; oil change due in 253h"),
            ("eq7", "HVAC / Heating System", "HVAC", 88, "warning", 1, "2025-01-10", "2025-04-10", "Filter efficiency — 22 days", "Air filter 78% loaded; schedule replacement"),
            ("eq8", "Meteorological Station", "Sensors", 99, "normal", 0, "2025-02-28", "2025-08-28", None, "All 14 sensors active and calibrated"),
            ("eq9", "Satellite Comm — VSAT", "Communication", 95, "normal", 0, "2025-01-20", "2025-07-20", None, "12.4 Mbps uplink; 98.7% uptime (30d)"),
        ]
        cursor.executemany("""
        INSERT INTO equipment_health (id, name, category, health, status, anomalies, last_maintenance, next_maintenance, predicted_failure, detail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_equipment)
        conn.commit()

    conn.close()

def log_event(actor: str, event_type: str, action: str, detail: str = "", outcome: str = "ok"):
    conn = get_db()
    cursor = conn.cursor()
    now_str = datetime.utcnow().strftime("%H:%M:%S")
    cursor.execute("""
    INSERT INTO events_log (time, actor, type, action, detail, outcome)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (now_str, actor, event_type, action, detail, outcome))
    conn.commit()
    conn.close()

def save_telemetry(data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat() + "Z"
    cursor.execute("""
    INSERT INTO telemetry_history (
        timestamp, solar_output, wind_output, gen_output, total_gen,
        total_consumption, net_balance, battery_soc, battery_power,
        battery_health, battery_temp, outside_temp, wind_speed,
        wind_gust, solar_irradiance, renewable_contribution
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_iso,
        data.get("solar_output"),
        data.get("wind_output"),
        data.get("gen_output"),
        data.get("total_gen"),
        data.get("total_consumption"),
        data.get("net_balance"),
        data.get("battery_soc"),
        data.get("battery_power"),
        data.get("battery_health"),
        data.get("battery_temp"),
        data.get("outside_temp"),
        data.get("wind_speed"),
        data.get("wind_gust"),
        data.get("solar_irradiance"),
        data.get("renewable_contribution")
    ))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
