import { useState, useEffect, useRef } from "react";
import {
  Search, Layout, Zap, Sun, Wind, Battery, Flame,
  Bot, CheckSquare, Activity, Wrench, Layers, BarChart2,
  GitBranch, Radio, Settings, Shield, Thermometer, X, ArrowRight,
} from "lucide-react";

const SCREENS = [
  { id: "dashboard",   label: "Main Dashboard",           icon: <Layout size={14} />,    group: "Overview",              desc: "Station overview, KPIs, alerts" },
  { id: "energy",      label: "Energy Management",        icon: <Zap size={14} />,       group: "Overview",              desc: "Power flow, generation, consumption" },
  { id: "solar",       label: "Solar Arrays",             icon: <Sun size={14} />,       group: "Generation & Storage",  desc: "Photovoltaic output, irradiance" },
  { id: "wind",        label: "Wind Turbines",            icon: <Wind size={14} />,      group: "Generation & Storage",  desc: "Turbine RPM, output, efficiency" },
  { id: "battery",     label: "Battery Storage",          icon: <Battery size={14} />,   group: "Generation & Storage",  desc: "SOC, voltage, thermal, racks" },
  { id: "generator",   label: "Generator",                icon: <Flame size={14} />,     group: "Generation & Storage",  desc: "Diesel backup, fuel level, runtime" },
  { id: "loads",       label: "Station Loads",            icon: <Zap size={14} />,       group: "Station",               desc: "Load distribution by category" },
  { id: "weather",     label: "Weather",                  icon: <Thermometer size={14} />, group: "Station",             desc: "NWP forecast, conditions, alerts" },
  { id: "safety",      label: "Safety Systems",           icon: <Shield size={14} />,    group: "Station",               desc: "Life support, fire, emergency" },
  { id: "ai",          label: "AI Recommendations",       icon: <Bot size={14} />,       group: "Intelligence",          desc: "Decision support, confidence scores" },
  { id: "approval",    label: "Human Approval",           icon: <CheckSquare size={14} />, group: "Intelligence",        desc: "Approval queue, L2–L4 actions" },
  { id: "equipment",   label: "Equipment Health",         icon: <Activity size={14} />,  group: "Equipment",             desc: "Fleet health, status, degradation" },
  { id: "maintenance", label: "Predictive Maintenance",   icon: <Wrench size={14} />,    group: "Equipment",             desc: "Upcoming service, failure prediction" },
  { id: "twin",        label: "Digital Twin",             icon: <Layers size={14} />,    group: "Data",                  desc: "System model, simulation state" },
  { id: "analytics",   label: "Historical Analytics",     icon: <BarChart2 size={14} />, group: "Data",                  desc: "Trends, monthly charts, KPI history" },
  { id: "logs",        label: "Decision Log",             icon: <GitBranch size={14} />, group: "Data",                  desc: "AI decisions, approvals, audit trail" },
  { id: "comm",        label: "Communication",            icon: <Radio size={14} />,     group: "Data",                  desc: "VSAT, Iridium, HF, AIS links" },
  { id: "settings",    label: "Settings",                 icon: <Settings size={14} />,  group: "Data",                  desc: "User roles, preferences, system config" },
];

export default function SearchModal({
  onClose, onNavigate,
}: { onClose: () => void; onNavigate: (s: string) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? SCREENS.filter(s =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.desc.toLowerCase().includes(query.toLowerCase()) ||
        s.group.toLowerCase().includes(query.toLowerCase())
      )
    : SCREENS;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[selected]) {
        onNavigate(results[selected].id);
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, selected, onClose, onNavigate]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(8,14,26,0.7)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)",
        zIndex: 1001, width: "100%", maxWidth: 580,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        overflow: "hidden",
        animation: "slideDown 0.18s ease",
      }}>

        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <Search size={16} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search screens, sensors, logs…"
            style={{
              flex: 1, border: "none", background: "none", outline: "none",
              fontSize: 15, color: "var(--text-1)",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex" }}>
              <X size={14} />
            </button>
          )}
          <kbd style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 4, padding: "2px 6px", color: "var(--text-3)",
            flexShrink: 0,
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>No results for "{query}"</p>
            </div>
          ) : (
            <>
              {!query && (
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 16px 4px" }}>
                  All screens
                </p>
              )}
              {results.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { onNavigate(s.id); onClose(); }}
                  onMouseEnter={() => setSelected(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 16px",
                    background: selected === i ? "var(--surface-2)" : "none",
                    border: "none", cursor: "pointer", textAlign: "left",
                    transition: "background 0.1s",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                    background: selected === i ? "var(--blue-bg)" : "var(--surface-2)",
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: selected === i ? "var(--blue)" : "var(--text-3)",
                    transition: "all 0.1s",
                  }}>
                    {s.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>{s.label}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{s.desc}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>{s.group}</span>
                    {selected === i && <ArrowRight size={12} style={{ color: "var(--blue)" }} />}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div style={{
          display: "flex", gap: 16, padding: "8px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["esc", "close"]].map(([key, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <kbd style={{
                fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 4, padding: "1px 5px", color: "var(--text-2)",
              }}>{key}</kbd>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </>
  );
}
