import { useState, useEffect, useCallback } from "react";
import Sidebar, { type Screen } from "./components/Sidebar";
import SearchModal from "./components/SearchModal";
import { ToastProvider, useToast } from "./components/Toast";
import { useIsMobile, useWindowWidth } from "./hooks/useWindowWidth";
import Dashboard from "./pages/Dashboard";
import EnergyManagement from "./pages/EnergyManagement";
import Solar from "./pages/Solar";
import Wind from "./pages/Wind";
import Battery from "./pages/Battery";
import Generator from "./pages/Generator";
import Loads from "./pages/Loads";
import Weather from "./pages/Weather";
import EquipmentHealth from "./pages/EquipmentHealth";
import Maintenance from "./pages/Maintenance";
import AIRecommendations from "./pages/AIRecommendations";
import HumanApproval from "./pages/HumanApproval";
import Safety from "./pages/Safety";
import DigitalTwin from "./pages/DigitalTwin";
import Analytics from "./pages/Analytics";
import Logs from "./pages/Logs";
import Communication from "./pages/Communication";
import Settings from "./pages/Settings";
import JudgesSimulation from "./pages/JudgesSimulation";
import Login from "./pages/Login";
import { approvalQueue } from "./data/mockData";
import { Search, Moon, Sun as SunIcon, Bell, Menu, X } from "lucide-react";
import { haptic } from "./utils/haptic";

type StationUser = {
  username: string; name: string; role: string;
  clearance: number; avatar: string; color: string;
};

function Shell({ user, onLogout }: { user: StationUser; onLogout: () => void }) {
  const [screen, setScreen]         = useState<Screen>("dashboard");
  const [pageKey, setPageKey]       = useState(0);
  const [collapsed, setCollapsed]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode]     = useState(false);
  const [showSearch, setSearch]     = useState(false);
  const [clock, setClock]           = useState(new Date());
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const width    = useWindowWidth();

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (width < 1024 && width >= 768) setCollapsed(true);
    if (width >= 1024) setCollapsed(false);
  }, [width]);

  // Close drawer on resize to desktop
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearch(v => !v); }
      if (e.key === "Escape") { setSearch(false); setDrawerOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const t  = setTimeout(() => toast("warning", "Wind advisory", "Gusts up to 28 m/s expected 14:00–22:00 UTC. Turbines may auto-feather."), 8000);
    const t2 = setTimeout(() => toast("error", "Battery Rack 3 — Cell over-temperature", "Cell group 3B at 42°C. Threshold: 40°C. Monitoring."), 20000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const navigate = useCallback((s: string) => {
    haptic("select");
    setScreen(s as Screen);
    setPageKey(k => k + 1);
    setDrawerOpen(false);
  }, []);

  const utc     = clock.toUTCString().split(" ");
  const timeStr = (utc[4] ?? "").slice(0, 5) + " UTC";
  const dateStr = `${(utc[0] ?? "").replace(",", "")} ${utc[1] ?? ""} ${utc[2] ?? ""}`;

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":   return <Dashboard onNavigate={navigate} />;
      case "simulation":  return <JudgesSimulation />;
      case "energy":      return <EnergyManagement />;
      case "solar":       return <Solar />;
      case "wind":        return <Wind />;
      case "battery":     return <Battery />;
      case "generator":   return <Generator />;
      case "loads":       return <Loads />;
      case "weather":     return <Weather />;
      case "equipment":   return <EquipmentHealth />;
      case "maintenance": return <Maintenance />;
      case "ai":          return <AIRecommendations onNavigate={navigate} />;
      case "approval":    return <HumanApproval />;
      case "safety":      return <Safety />;
      case "twin":        return <DigitalTwin />;
      case "analytics":   return <Analytics />;
      case "logs":        return <Logs />;
      case "comm":        return <Communication />;
      case "settings":    return <Settings />;
      default:            return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg)", position: "relative" }}>

      {/* ── Mobile drawer backdrop ─────────────────────────────── */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.15s ease",
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      {isMobile ? (
        /* Mobile: slide-in drawer */
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.24s cubic-bezier(0.32,0,0.15,1)",
        }}>
          <Sidebar
            active={screen}
            onNavigate={s => navigate(s)}
            alerts={approvalQueue.length}
            collapsed={false}
            onToggleCollapse={() => setDrawerOpen(false)}
          />
        </div>
      ) : (
        /* Desktop/tablet: inline sidebar */
        <Sidebar
          active={screen}
          onNavigate={s => navigate(s)}
          alerts={approvalQueue.length}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(v => !v)}
        />
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <main style={{
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        background: "var(--bg)", overflow: "hidden",
      }}>

        {/* ── Topbar ──────────────────────────────────────────── */}
        <div style={{
          flexShrink: 0,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          height: isMobile ? 52 : 48,
          display: "flex", alignItems: "center",
          padding: isMobile ? "0 14px" : "0 20px",
          gap: isMobile ? 8 : 10,
        }}>

          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(v => !v)}
              style={{
                width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-2)",
              }}
            >
              {drawerOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          )}

          {/* Mobile: SIAPS wordmark */}
          {isMobile && (
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)", letterSpacing: "0.05em", flex: 1 }}>
              SIAPS
            </span>
          )}

          {/* Search (hide on small mobile to save space) */}
          {!isMobile && (
            <button
              onClick={() => setSearch(true)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 7, padding: "5px 10px 5px 8px",
                cursor: "pointer", color: "var(--text-3)",
                transition: "border-color 0.12s",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <Search size={12} />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Search…</span>
              <kbd style={{
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 3, padding: "1px 5px", color: "var(--text-3)", marginLeft: 4,
              }}>⌘K</kbd>
            </button>
          )}

          <div style={{ flex: isMobile ? 0 : 1 }} />

          {/* Clock — compact on mobile */}
          {!isMobile && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>{timeStr}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{dateStr}</p>
            </div>
          )}
          {isMobile && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>{timeStr}</span>
          )}

          {!isMobile && <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />}

          {/* Dark mode */}
          <button
            onClick={() => { haptic("light"); setDarkMode(v => !v); }}
            title={darkMode ? "Light mode" : "Dark mode"}
            className="btn-press"
            style={{
              width: 32, height: 32, borderRadius: 7,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-2)", flexShrink: 0,
            }}
          >
            {darkMode ? <SunIcon size={14} /> : <Moon size={14} />}
          </button>

          {/* Alerts bell */}
          <button
            onClick={() => { haptic("light"); navigate("logs"); }}
            className="btn-press"
            style={{
              width: 32, height: 32, borderRadius: 7,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-2)", position: "relative", flexShrink: 0,
            }}
          >
            <Bell size={14} />
            <span style={{
              position: "absolute", top: 6, right: 6,
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--red)", border: "1.5px solid var(--surface)",
            }} />
          </button>

          {/* Search icon on mobile */}
          {isMobile && (
            <button
              onClick={() => setSearch(true)}
              style={{
                width: 32, height: 32, borderRadius: 7,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-2)", flexShrink: 0,
              }}
            >
              <Search size={14} />
            </button>
          )}

          {!isMobile && <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />}

          {/* User (compact on mobile) */}
          {isMobile ? (
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: user.color, color: "white",
              fontSize: 10, fontWeight: 800, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user.avatar}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: user.color, color: "white",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {user.avatar}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>{user.name}</p>
                  <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>{user.role}</p>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3,
                  background: user.color + "22", color: user.color,
                  border: `1px solid ${user.color}44`,
                }}>
                  L{user.clearance}
                </span>
              </div>
              <button
                onClick={onLogout}
                style={{
                  fontSize: 12, color: "var(--text-3)",
                  background: "none", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                  transition: "color 0.12s, border-color 0.12s",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--red)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--red-border)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {/* ── Page content ────────────────────────────────────── */}
        <div key={pageKey} className="page-enter" style={{ flex: 1, overflowY: "auto" }}>
          {renderScreen()}
        </div>
      </main>

      {/* ── Global search modal ─────────────────────────────────── */}
      {showSearch && (
        <SearchModal
          onClose={() => setSearch(false)}
          onNavigate={s => { navigate(s); setSearch(false); }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<StationUser | null>(null);
  return (
    <ToastProvider>
      {user
        ? <Shell user={user} onLogout={() => setUser(null)} />
        : <Login onLogin={u => setUser(u)} />
      }
    </ToastProvider>
  );
}
