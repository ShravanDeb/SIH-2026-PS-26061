import {
  Activity, BarChart2, Battery, Zap, Bot, CheckSquare, Flame,
  GitBranch, Layout, Layers, Radio, Settings, Shield, Sun,
  Thermometer, Wrench, Wind, Globe, ChevronLeft, ChevronRight,
} from "lucide-react";
import { weatherData, powerData } from "../data/mockData";
import { haptic } from "../utils/haptic";

export type Screen =
  | "dashboard" | "energy" | "solar" | "wind" | "battery" | "generator"
  | "loads" | "weather" | "equipment" | "maintenance" | "ai" | "approval"
  | "safety" | "twin" | "analytics" | "logs" | "comm" | "settings";

type NavItem = { id: Screen; label: string; icon: any; badge?: number };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [
      { id: "dashboard", label: "Main Dashboard",    icon: Layout },
      { id: "energy",    label: "Energy Management", icon: Zap },
    ],
  },
  {
    group: "Generation & Storage",
    items: [
      { id: "solar",     label: "Solar Arrays",    icon: Sun },
      { id: "wind",      label: "Wind Turbines",   icon: Wind },
      { id: "battery",   label: "Battery Storage", icon: Battery },
      { id: "generator", label: "Generator",       icon: Flame },
    ],
  },
  {
    group: "Station",
    items: [
      { id: "loads",   label: "Loads",          icon: Zap },
      { id: "weather", label: "Weather",         icon: Thermometer },
      { id: "safety",  label: "Safety Systems", icon: Shield },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { id: "ai",       label: "AI Recommendations", icon: Bot },
      { id: "approval", label: "Human Approval",     icon: CheckSquare },
    ],
  },
  {
    group: "Equipment",
    items: [
      { id: "equipment",   label: "Equipment Health",       icon: Activity },
      { id: "maintenance", label: "Predictive Maintenance", icon: Wrench },
    ],
  },
  {
    group: "Data",
    items: [
      { id: "twin",      label: "Digital Twin",    icon: Layers },
      { id: "analytics", label: "Analytics",       icon: BarChart2 },
      { id: "logs",      label: "Decision Log",    icon: GitBranch },
      { id: "comm",      label: "Communication",   icon: Radio },
      { id: "settings",  label: "Settings",        icon: Settings },
    ],
  },
];

export default function Sidebar({
  active, onNavigate, alerts, collapsed, onToggleCollapse,
}: {
  active: Screen;
  onNavigate: (s: Screen) => void;
  alerts: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const soc = powerData.battery.soc;
  const socColor = soc >= 60 ? "var(--green)" : soc >= 30 ? "var(--amber)" : "var(--red)";
  const w = collapsed ? 60 : 216;

  return (
    <aside style={{
      width: w, minWidth: w, flexShrink: 0,
      background: "var(--sidebar)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex", flexDirection: "column",
      height: "100%",
      transition: "width 0.22s ease, min-width 0.22s ease",
      overflow: "hidden",
    }}>

      {/* ── Wordmark ──────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? "16px 0" : "20px 16px 16px",
        borderBottom: "1px solid var(--sidebar-border)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 8, flexShrink: 0,
      }}>
        {collapsed ? (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--sidebar-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Globe size={15} color="white" strokeWidth={2.5} />
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "var(--sidebar-accent)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Globe size={15} color="white" strokeWidth={2.5} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "white", fontWeight: 800, fontSize: 14, letterSpacing: "0.05em", lineHeight: 1 }}>SIAPS</p>
                <p style={{ fontSize: 9, color: "var(--sidebar-text)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Svalbard Station Alpha
                </p>
              </div>
            </div>
            {/* Live status */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              <span style={{ position: "relative", display: "inline-flex", width: 7, height: 7 }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--green)", animation: "ping 1.5s ease infinite", opacity: 0.5 }} />
                <span style={{ position: "relative", width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "8px 4px" : "8px 8px" }}>
        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: collapsed ? 4 : 8 }}>
            {!collapsed && (
              <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--sidebar-border)",
                padding: "8px 8px 4px",
              }}>
                {group.group}
              </p>
            )}
            {collapsed && <div style={{ height: 8 }} />}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const hasBadge = item.id === "approval" && alerts > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => { haptic("select"); onNavigate(item.id); }}
                  title={collapsed ? item.label : undefined}
                  className="nav-item-t"
                  style={{
                    display: "flex", alignItems: "center",
                    gap: collapsed ? 0 : 9,
                    justifyContent: collapsed ? "center" : "flex-start",
                    width: "100%",
                    padding: collapsed ? "9px 0" : "7px 10px",
                    borderRadius: 7, fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer", border: "none",
                    background: isActive ? "rgba(165,180,252,0.12)" : "transparent",
                    color: isActive ? "var(--sidebar-accent)" : "var(--sidebar-text)",
                    textAlign: "left", marginBottom: 1, position: "relative",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.color = "#C4C8E8";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)";
                    }
                  }}
                >
                  {isActive && (
                    <span style={{
                      position: "absolute", left: 0, top: "20%", bottom: "20%",
                      width: 2.5, background: "var(--sidebar-accent)",
                      borderRadius: "0 2px 2px 0",
                    }} />
                  )}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Icon size={13} style={{ color: isActive ? "var(--sidebar-accent)" : undefined }} strokeWidth={isActive ? 2.5 : 2} />
                    {hasBadge && collapsed && (
                      <span style={{
                        position: "absolute", top: -4, right: -4,
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#F59E0B",
                      }} />
                    )}
                  </div>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {hasBadge && (
                        <span style={{
                          background: "#F59E0B", color: "white", fontSize: 10,
                          fontWeight: 800, width: 16, height: 16,
                          borderRadius: "50%", display: "flex",
                          alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {alerts}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Live vitals (expanded only) ───────────────────────────── */}
      {!collapsed && (
        <div style={{ borderTop: "1px solid var(--sidebar-border)", padding: "12px 14px", flexShrink: 0 }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sidebar-border)", marginBottom: 8 }}>
            Live Vitals
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
            {[
              { label: "Temp", value: `${weatherData.temperature}°`, color: "#7DD3FC" },
              { label: "SOC",  value: `${soc}%`, color: socColor },
              { label: "Gen",  value: `${powerData.totalGeneration}`, color: "#6EE7B7" },
            ].map(v => (
              <div key={v.label} style={{ textAlign: "center", borderRadius: 5, padding: "6px 4px", background: "rgba(255,255,255,0.04)" }}>
                <p style={{ fontSize: 9, color: "var(--sidebar-text)", letterSpacing: "0.06em", marginBottom: 2 }}>{v.label}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: v.color }}>{v.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Collapse toggle ───────────────────────────────────────── */}
      <button
        onClick={onToggleCollapse}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, width: "100%",
          padding: "10px 0",
          background: "rgba(255,255,255,0.03)",
          border: "none",
          borderTop: "1px solid var(--sidebar-border)",
          cursor: "pointer", color: "var(--sidebar-text)",
          fontSize: 11, fontWeight: 500,
          transition: "background 0.12s, color 0.12s",
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#CBD5E1"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color = "var(--sidebar-text)"; }}
      >
        {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
      </button>
    </aside>
  );
}
