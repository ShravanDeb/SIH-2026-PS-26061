import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle, Battery, Sun, Wind, Flame, Zap, Bot, ChevronRight, ChevronDown, Check, X, Shield, MessageSquare
} from "lucide-react";
import {
  alerts, generateTimeSeriesData, stationData,
} from "../data/mockData";
import { Card, CardHeader, StatusBadge, AlertItem, HealthBar, LevelBadge } from "../components/ui";
import { useIsMobile, useIsTablet } from "../hooks/useWindowWidth";
import { useLiveStationTelemetry, fetchLiveRecommendations, submitRecommendationAction } from "../services/stationApi";
import AIChatDrawer from "../components/AIChatDrawer";

const RANGES = [
  { label: "6h", hours: 6 }, { label: "12h", hours: 12 },
  { label: "24h", hours: 24 }, { label: "7d", hours: 168 },
];

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--sidebar)", border: "1px solid var(--sidebar-border)", borderRadius: 8,
      padding: "10px 14px", fontSize: 11, color: "var(--sidebar-text)",
    }}>
      <p style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 6, fontFamily: "JetBrains Mono, monospace" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{p.name}</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "var(--text-1)", marginLeft: 12 }}>{p.value} kW</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [range, setRange]       = useState(12);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [recs, setRecs]         = useState<any[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const { isBackendConnected, power, weather, anomalies, timestamp } = useLiveStationTelemetry();

  useEffect(() => {
    fetchLiveRecommendations().then(r => { if (r && r.length) setRecs(r); });
    const timer = setInterval(() => {
      fetchLiveRecommendations().then(r => { if (r && r.length) setRecs(r); });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (recId: string, decision: string) => {
    const res = await submitRecommendationAction(recId, decision, "1234");
    if (res.success) {
      setActionFeedback(`Action ${decision.toUpperCase()} dispatched with PIN 1234!`);
      setRecs(prev => prev.map(r => r.id === recId ? { ...r, status: decision } : r));
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const pending = recs.filter(r => r.status === "awaiting_approval").length;
  const unacked = alerts.filter(a => !a.acknowledged).length;
  const b       = power.battery;

  // Dynamically update time-series chart with real live numbers
  const baseData = generateTimeSeriesData(range);
  const td = baseData.map((pt, idx) => {
    if (idx === baseData.length - 1 && isBackendConnected) {
      return {
        ...pt,
        solar: power.solar.output,
        wind: power.wind.output,
        generator: power.generator.output,
        totalRenewable: Number((power.solar.output + power.wind.output).toFixed(1)),
        consumption: power.totalConsumption,
        netBalance: power.netBalance
      };
    }
    return pt;
  });

  const gap = isMobile ? 10 : 14;
  const px  = isMobile ? 12 : 36;

  return (
    <div style={{ padding: isMobile ? "14px 0 40px" : "32px 0 56px", maxWidth: 1280, margin: "0 auto" }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ padding: `0 ${px}px`, marginBottom: isMobile ? 16 : 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Overview
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
            {isMobile ? "Bharati Antarctic Station" : `${stationData.name} · 69.4°S 76.2°E · Larsemann Hills · ${stationData.uptime} uptime`}
          </p>
        </div>
        {/* Pills — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {isBackendConnected ? (
              <Pill color="#10b981" bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.3)">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "ping 1.5s ease infinite", display: "inline-block" }} />
                LIVE SCADA (1 Hz) · Connected
              </Pill>
            ) : (
              <Pill color="#38bdf8" bg="rgba(56,189,248,0.12)" border="rgba(56,189,248,0.3)">
                AUTONOMOUS SIMULATION
              </Pill>
            )}
            <Pill color="#7CB9FB" bg="rgba(124,185,251,0.09)" border="rgba(124,185,251,0.24)">
              {power.renewableContribution}% Renewable
            </Pill>
            {pending > 0 && (
              <button onClick={() => onNavigate("approval")} style={{ all: "unset", cursor: "pointer" }}>
                <Pill color="#FBB740" bg="rgba(251,183,64,0.09)" border="rgba(251,183,64,0.26)">
                  <AlertTriangle size={11} style={{ color: "#FBB740" }} />
                  {pending} pending approval
                </Pill>
              </button>
            )}
          </div>
        )}
        {/* Mobile: compact status row */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: isBackendConnected ? "#10b981" : "#38bdf8", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: isBackendConnected ? "#10b981" : "#38bdf8", display: "inline-block" }} />
              {isBackendConnected ? "Live SCADA" : "Simulation"}
            </span>
            {pending > 0 && (
              <button
                onClick={() => onNavigate("approval")}
                style={{ fontSize: 11, fontWeight: 700, color: "#FBB740", background: "rgba(251,183,64,0.10)", border: "1px solid rgba(251,183,64,0.26)", borderRadius: 5, padding: "2px 8px", cursor: "pointer" }}
              >
                ⏳ {pending} pending
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: `0 ${px}px`, display: "flex", flexDirection: "column", gap }}>

        {/* ── Row 1: KPI cards ─────────────────────────────────────────────── */}
        {isMobile ? (
          /* Mobile: 2×2 compact cards */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Generation",    value: power.totalGeneration.toFixed(1), unit: "kW",  sub: `Solar ${power.solar.output} · Wind ${power.wind.output}`, color: "var(--blue)"  },
              { label: "Station Load",  value: power.totalConsumption.toFixed(1), unit: "kW", sub: `Net ${power.netBalance >= 0 ? "+" : ""}${power.netBalance} kW`, color: "var(--text-1)"},
              { label: "Battery SOC",   value: `${b.soc}`,                            unit: "%",  sub: `${b.remaining} kWh · ${b.status}`,            color: "var(--green)" },
              { label: "Temperature",   value: `${weather.temperature}°`,         unit: "C",  sub: `${weather.windSpeed} m/s wind`, color: "var(--text-1)" },
            ].map(k => (
              <div key={k.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 14px 12px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{k.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 5 }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 700, color: k.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {k.value}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>{k.unit}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{k.sub}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: 4-col full KPI cards */
          <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr 1fr" : "repeat(4, 1fr)", gap }}>
            {[
              { label: "Total Generation", value: power.totalGeneration.toFixed(1), unit: "kW",  sub: `Solar ${power.solar.output} · Wind ${power.wind.output} · Gen ${power.generator.output}`, color: "var(--blue)"  },
              { label: "Station Load",     value: power.totalConsumption.toFixed(1), unit: "kW", sub: `Net balance ${power.netBalance >= 0 ? "+" : ""}${power.netBalance} kW`, color: "var(--text-1)"},
              { label: "Battery SOC",      value: `${b.soc}`,                            unit: "%",  sub: `${b.remaining} kWh · ${b.runtime}h runtime (${b.status})`, color: "var(--green)" },
              { label: "Outside Temp",     value: `${weather.temperature}°`,         unit: "C",  sub: `Wind ${weather.windSpeed} m/s (Gust ${weather.windGust} m/s) · ${weather.solarRadiation} W/m²`, color: "var(--text-1)" },
            ].map(k => (
              <div key={k.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "22px 22px 18px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>{k.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 8 }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 34, fontWeight: 700, color: k.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{k.value}</span>
                  <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "JetBrains Mono, monospace" }}>{k.unit}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.4 }}>{k.sub}</p>
              </div>
            ))}
          </div>
        )}


        {/* ── Row 2: Chart + Battery ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 300px", gap }}>

          {/* Chart */}
          <Card>
            <CardHeader
              title="Generation & Consumption"
              subtitle={`Last ${range >= 168 ? "7 days" : range + "h"} · kW`}
              icon={<Zap size={13} />}
              action={
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
                  <div style={{ display: "flex", gap: 2, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 2 }}>
                    {RANGES.map(r => (
                      <button key={r.label} onClick={() => setRange(r.hours)} style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 6px", borderRadius: 4, border: "none", cursor: "pointer",
                        background: range === r.hours ? "var(--surface)" : "none",
                        color: range === r.hours ? "var(--blue)" : "var(--text-3)",
                        boxShadow: range === r.hours ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.12s",
                      }}>{r.label}</button>
                    ))}
                  </div>
                  {!isMobile && (
                    <button onClick={() => onNavigate("energy")} style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                      Full view <ChevronRight size={11} />
                    </button>
                  )}
                </div>
              }
            />

            {/* Source summary — desktop only */}
            {!isMobile && (
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
                {[
                  { icon: <Sun size={12} style={{ color: "#F59E0B" }} />, label: "Solar",     value: power.solar.output, cap: power.solar.capacity, c: "#F59E0B", status: (power.solar.output > 0 ? "normal" : "standby") as any },
                  { icon: <Wind size={12} style={{ color: "#38BDF8" }} />, label: "Wind",     value: power.wind.output,  cap: power.wind.capacity,  c: "#38BDF8", status: (power.wind.output > 0 ? "normal" : "standby") as any },
                  { icon: <Flame size={12} style={{ color: "var(--sidebar-text)" }} />, label: "Generator", value: power.generator.output, cap: power.generator.capacity || 80, c: "#94A3B8", status: (power.generator.output > 0 ? "normal" : "standby") as any },
                ].map((s, i) => (
                  <div key={s.label} style={{ flex: 1, padding: "14px 20px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      {s.icon}
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</span>
                      <StatusBadge status={s.status} label={s.status === "standby" ? "Standby" : "On"} />
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 700, color: s.value > 0 ? s.c : "var(--text-3)", lineHeight: 1 }}>{s.value}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>/ {s.cap} kW</span>
                    </div>
                    <HealthBar value={Math.round((s.value / s.cap) * 100)} showValue={false} />
                  </div>
                ))}
              </div>
            )}

            {/* Mobile source summary — compact 3-stat bar */}
            {isMobile && (
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "10px 14px", gap: 16 }}>
                {[
                  { icon: <Sun size={11} style={{ color: "#F59E0B" }} />, v: `${power.solar.output}`, label: "Solar" },
                  { icon: <Wind size={11} style={{ color: "#38BDF8" }} />, v: `${power.wind.output}`, label: "Wind" },
                  { icon: <Flame size={11} style={{ color: "var(--sidebar-text)" }} />, v: power.generator.output > 0 ? `${power.generator.output}k` : "Off", label: "Gen" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {s.icon}
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>{s.v}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: isMobile ? "14px 8px 12px 2px" : "20px 12px 14px 4px" }}>
              <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
                <AreaChart data={td} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    {[{ id: "gS", c: "#F59E0B" }, { id: "gW", c: "#38BDF8" }, { id: "gC", c: "#94A3B8" }].map(({ id, c }) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={c} stopOpacity={0.01} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 0" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#A8A7A2", fontFamily: "JetBrains Mono, monospace" }} tickLine={false} axisLine={false} interval={isMobile ? 2 : 0} />
                  <YAxis tick={{ fontSize: 10, fill: "#A8A7A2", fontFamily: "JetBrains Mono, monospace" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="solar"       name="Solar"       stroke="#F59E0B" fill="url(#gS)" strokeWidth={2}   dot={false} />
                  <Area type="monotone" dataKey="wind"        name="Wind"        stroke="#38BDF8" fill="url(#gW)" strokeWidth={2}   dot={false} />
                  <Area type="monotone" dataKey="consumption" name="Consumption" stroke="#94A3B8" fill="url(#gC)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 16, paddingLeft: isMobile ? 8 : 16, marginTop: 6, flexWrap: "wrap" }}>
                {[{ c: "#F59E0B", l: "Solar" }, { c: "#38BDF8", l: "Wind" }, { c: "#94A3B8", l: "Consumption", dashed: true }].map(i => (
                  <div key={i.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke={i.c} strokeWidth="2" strokeDasharray={i.dashed ? "3 2" : undefined} /></svg>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{i.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Battery */}
          <Card>
            <CardHeader
              title="Battery Storage"
              subtitle="4 × LiFePO₄ · 400 kWh"
              icon={<Battery size={13} />}
              accent="var(--green)"
              action={<button onClick={() => onNavigate("battery")} style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Detail →</button>}
            />
            <div style={{ padding: isMobile ? "16px 14px" : "28px 24px" }}>
              {isMobile ? (
                /* Mobile battery: horizontal ring + stats */
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                    <svg viewBox="0 0 80 80" style={{ width: 80, height: 80, transform: "rotate(-90deg)" }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface-2)" strokeWidth="7" />
                      <circle cx="40" cy="40" r="32" fill="none"
                        stroke={b.soc >= 60 ? "var(--green)" : b.soc >= 30 ? "var(--amber)" : "var(--red)"}
                        strokeWidth="7"
                        strokeDasharray={`${(b.soc / 100) * 201.06} 201.06`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 18, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{b.soc}%</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <StatusBadge status="charging" />
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        { l: "Available", v: `${b.remaining} kWh` },
                        { l: "Runtime",   v: `${b.runtime} h` },
                        { l: "Health",    v: `${b.health}%` },
                      ].map(r => (
                        <div key={r.l} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>{r.l}</span>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop battery: centered ring + full stats */
                <>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                    <div style={{ position: "relative", width: 120, height: 120 }}>
                      <svg viewBox="0 0 80 80" style={{ width: 120, height: 120, transform: "rotate(-90deg)" }}>
                        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface-2)" strokeWidth="6" />
                        <circle cx="40" cy="40" r="32" fill="none"
                          stroke={b.soc >= 60 ? "var(--green)" : b.soc >= 30 ? "var(--amber)" : "var(--red)"}
                          strokeWidth="6"
                          strokeDasharray={`${(b.soc / 100) * 201.06} 201.06`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>{b.soc}%</span>
                        <span style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>State of Charge</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}><StatusBadge status="charging" /></div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Available energy", value: `${b.remaining} kWh` },
                      { label: "Estimated runtime", value: `${b.runtime} h` },
                      { label: "Voltage / Current", value: `${b.voltage} V · ${Math.abs(b.current)} A` },
                      { label: "Cell temperature",  value: `${b.temperature} °C` },
                      { label: "Pack health",        value: `${b.health}%` },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{row.label}</span>
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* ── Row 3: AI Recommendations + Alerts ───────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap }}>

          <Card>
            <CardHeader
              title="AI Recommendations"
              subtitle={isMobile ? "Tap to expand reasoning" : "Supervisor-in-the-loop · human approval required for L2+"}
              icon={<Bot size={13} />}
              accent="var(--blue)"
              action={
                <button onClick={() => onNavigate("ai")} style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                  All {recs.length} <ChevronRight size={11} />
                </button>
              }
            />
            {actionFeedback && (
              <div style={{ padding: "8px 16px", background: "rgba(16,185,129,0.1)", borderBottom: "1px solid rgba(16,185,129,0.2)", fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                ✓ {actionFeedback}
              </div>
            )}
            <div>
              {recs.slice(0, 3).map((r, i) => {
                const isOpen = expanded === r.id;
                return (
                  <div key={r.id} style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      style={{
                        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                        gap: 10, width: "100%", padding: isMobile ? "12px 14px" : "16px 22px",
                        background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
                          <LevelBadge level={r.level} />
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                            background: r.status === "approved" ? "var(--green-bg)" : r.status === "rejected" ? "var(--red-bg)" : "var(--amber-bg)",
                            color: r.status === "approved" ? "var(--green)" : r.status === "rejected" ? "var(--red)" : "var(--amber)",
                            border: `1px solid ${r.status === "approved" ? "var(--green-border)" : r.status === "rejected" ? "var(--red-border)" : "var(--amber-border)"}`,
                          }}>
                            {r.status === "approved" ? "✓ Approved" : r.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                          </span>
                        </div>
                        <p style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.4, marginBottom: 3 }}>{r.title}</p>
                        {!isMobile && <p style={{ fontSize: 12, color: "var(--blue)" }}>→ {r.impact}</p>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "var(--text-1)" }}>{r.confidence}%</span>
                          <p style={{ fontSize: 9, color: "var(--text-3)", marginTop: 1 }}>conf.</p>
                        </div>
                        <ChevronDown size={13} style={{ color: "var(--text-3)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s" }} />
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: isMobile ? "0 14px 12px" : "0 22px 16px", borderTop: "1px solid var(--border)", background: "var(--surface-2)", animation: "pageFadeIn 0.15s ease" }}>
                        <div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Reason</p>
                            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{r.reason}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Expected Impact</p>
                            <p style={{ fontSize: 12, color: "var(--blue)", lineHeight: 1.6 }}>{r.impact}</p>
                          </div>
                          {r.status === "awaiting_approval" && (
                            <div style={{ display: "flex", gap: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                              <button
                                onClick={() => handleAction(r.id, "approved")}
                                style={{
                                  padding: "6px 12px", borderRadius: 6, background: "var(--green)", color: "#fff",
                                  border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                                }}
                              >
                                <Check size={13} /> Authorize (PIN: 1234)
                              </button>
                              <button
                                onClick={() => handleAction(r.id, "delayed")}
                                style={{
                                  padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "var(--text-2)",
                                  border: "1px solid var(--border)", fontSize: 11, fontWeight: 600, cursor: "pointer"
                                }}
                              >
                                Delay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Active Alerts"
              subtitle={`${unacked} unacknowledged · ${alerts.length} active`}
              icon={<AlertTriangle size={13} />}
              accent="var(--amber)"
            />
            <div>
              {alerts.slice(0, isMobile ? 3 : 4).map(a => <AlertItem key={a.id} {...a} />)}
            </div>
            {alerts.length > (isMobile ? 3 : 4) && (
              <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
                <button onClick={() => onNavigate("logs")} style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                  View all {alerts.length} alerts →
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Floating Ask SIAPS AI Button */}
      <button
        onClick={() => setChatOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #6366f1, #3b82f6)",
          color: "#fff",
          border: "none",
          borderRadius: 30,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 10px 25px rgba(99,102,241,0.4), 0 0 15px rgba(59,130,246,0.3)",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13,
          zIndex: 999,
          transition: "transform 0.15s, box-shadow 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1.0)"}
      >
        <Bot size={18} />
        Ask SIAPS AI
      </button>

      {/* Floating AI Mission Copilot Drawer */}
      <AIChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

function Pill({ children, color, bg, border }: { children: React.ReactNode; color: string; bg: string; border: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: bg, border: `1px solid ${border}`, fontSize: 12, fontWeight: 600, color }}>
      {children}
    </div>
  );
}
