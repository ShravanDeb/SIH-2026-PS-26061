import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { useIsMobile } from "../hooks/useWindowWidth";
import { haptic } from "../utils/haptic";

const USERS = [
  { username: "commander.larsen", password: "station2024", name: "Dr. Erik Larsen",    role: "Station Commander",      clearance: 4, avatar: "EL", color: "#0095C8" },
  { username: "eng.nakamura",     password: "station2024", name: "Yuki Nakamura",       role: "Lead Engineer",          clearance: 3, avatar: "YN", color: "#7C5CF6" },
  { username: "sci.okonkwo",      password: "station2024", name: "Dr. Amara Okonkwo",   role: "Science Officer",        clearance: 2, avatar: "AO", color: "#00B880" },
  { username: "ops.petrov",       password: "station2024", name: "Ivan Petrov",          role: "Operations Technician",  clearance: 2, avatar: "IP", color: "#F5A624" },
  { username: "med.sorensen",     password: "station2024", name: "Dr. Astrid Sørensen",  role: "Medical Officer",        clearance: 2, avatar: "AS", color: "#FF3860" },
  { username: "it.chen",          password: "station2024", name: "Wei Chen",             role: "IT & Communications",    clearance: 2, avatar: "WC", color: "#A5B4FC" },
];

const CLEARANCE_COLORS: Record<number, string> = {
  1: "#9695A0", 2: "#F5A624", 3: "#00B880", 4: "#A5B4FC",
};

type User = typeof USERS[0];

/* ── Live clock ─────────────────────────────────────────────────────────── */
function useLiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* ── Star field ─────────────────────────────────────────────────────────── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 0.5 + Math.random() * 1.2,
  o: 0.15 + Math.random() * 0.55,
  d: 2 + Math.random() * 4,
}));

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const isMobile = useIsMobile();
  const clock    = useLiveClock();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [phase, setPhase]       = useState<"credentials" | "mfa">("credentials");
  const [mfaCode, setMfaCode]   = useState("");
  const [pending, setPending]   = useState<User | null>(null);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const timeStr = clock.toISOString().slice(11, 19) + " UTC";
  const dateStr = clock.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    haptic("medium");
    setTimeout(() => {
      const found = USERS.find(u => u.username === username.trim() && u.password === password);
      if (found) {
        haptic("success");
        if (found.clearance >= 3) { setPending(found); setPhase("mfa"); }
        else { onLogin(found); }
      } else {
        haptic("error");
        setError("Credentials not recognised. Verify your station-issued username and password.");
      }
      setLoading(false);
    }, 700);
  }

  function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    haptic("medium");
    setTimeout(() => {
      if (mfaCode.length === 6) { haptic("success"); onLogin(pending!); }
      else { haptic("error"); setError("Enter all 6 digits of your authenticator code."); }
      setLoading(false);
    }, 600);
  }

  return (
    <div style={{
      minHeight: "100vh", minWidth: "100vw",
      background: "#12131A",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: isMobile ? "16px" : "24px",
      position: "relative", overflow: "hidden",
    }}>

      {/* ── Aurora atmosphere ──────────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      {/* ── Star field ─────────────────────────────────────────────────── */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {STARS.map(s => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o}>
            <animate attributeName="opacity" values={`${s.o};${s.o * 0.3};${s.o}`} dur={`${s.d}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* ── Polar grid overlay ─────────────────────────────────────────── */}
      {!isMobile && (
        <svg
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 0 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {[150, 280, 420, 560, 700].map((r, i) => (
            <circle key={i} cx="20%" cy="90%" r={r} fill="none" stroke="rgba(129,140,248,0.04)" strokeWidth="1" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI;
            return (
              <line key={i}
                x1="20%" y1="90%"
                x2={`${20 + Math.cos(a) * 80}%`}
                y2={`${90 + Math.sin(a) * 80}%`}
                stroke="rgba(129,140,248,0.03)" strokeWidth="1"
              />
            );
          })}
        </svg>
      )}

      {/* ── Main card ──────────────────────────────────────────────────── */}
      <div
        className="anim-scale-in delay-0"
        style={{
          position: "relative", zIndex: 1,
          width: "100%",
          maxWidth: isMobile ? 440 : 920,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 420px",
          borderRadius: isMobile ? 16 : 20,
          overflow: "hidden",
          border: "1px solid rgba(129,140,248,0.14)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >

        {/* ── Left: Identity panel ─────────────────────────────────────── */}
        {!isMobile && (
          <div style={{
            background: "linear-gradient(160deg, #14151B 0%, #1A1B22 60%, #14151B 100%)",
            borderRight: "1px solid rgba(129,140,248,0.10)",
            padding: "48px 44px 40px",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            position: "relative", overflow: "hidden",
            minHeight: 600,
          }}>

            {/* Subtle inner glow */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 60% 40% at 20% 80%, rgba(129,140,248,0.08) 0%, transparent 70%)",
            }} />

            {/* ── Top: wordmark ── */}
            <div className="anim-in-right delay-1" style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px rgba(129,140,248,0.28)",
                }}>
                  <Shield size={17} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <p style={{ color: "#E8EEF8", fontWeight: 900, fontSize: 15, letterSpacing: "0.12em", lineHeight: 1 }}>SIAPS</p>
                  <p style={{ color: "#636678", fontSize: 10, marginTop: 2, letterSpacing: "0.04em" }}>Autonomous Polar Station</p>
                </div>
              </div>
            </div>

            {/* ── Middle: hero stats ── */}
            <div className="anim-in-right delay-2" style={{ position: "relative" }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, fontWeight: 700, color: "#A5B4FC",
                letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20,
              }}>
                Svalbard · Norway
              </p>

              <h1 style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 46, fontWeight: 700, lineHeight: 1.05,
                letterSpacing: "-0.02em", color: "#E8EEF8",
                marginBottom: 6,
              }}>
                Station<br />Alpha
              </h1>

              {/* Cyan rule */}
              <div style={{
                width: 40, height: 2,
                background: "linear-gradient(90deg, #7CB9FB, transparent)",
                borderRadius: 2, marginBottom: 28,
              }} />

              {/* Stat grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
                {[
                  { label: "Latitude",    value: "78°13′N", mono: true },
                  { label: "Longitude",   value: "15°26′E", mono: true },
                  { label: "Outside",     value: "−23.4°C", mono: true, accent: true },
                  { label: "Wind speed",  value: "14 m/s",  mono: true },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: 10, color: "#636678", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5, fontWeight: 600 }}>
                      {s.label}
                    </p>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 20, fontWeight: 700,
                      color: s.accent ? "#A5B4FC" : "#D4D8F8",
                      lineHeight: 1,
                    }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28 }}>
                <p style={{ fontSize: 10, color: "#636678", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, fontWeight: 600 }}>
                  System status
                </p>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: "94%", height: "100%",
                    background: "linear-gradient(90deg, #7CB9FB, #00B880)",
                    borderRadius: 3,
                    boxShadow: "0 0 8px rgba(0,200,236,0.5)",
                  }} />
                </div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#545868", marginTop: 5 }}>
                  94% capacity · 127 d 14 h uptime
                </p>
              </div>
            </div>

            {/* ── Bottom: live clock + status ── */}
            <div className="anim-in-right delay-3" style={{ position: "relative", borderTop: "1px solid rgba(129,140,248,0.08)", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ position: "relative", display: "inline-flex", width: 7, height: 7, flexShrink: 0 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#00B880", animation: "ping 2s ease infinite", opacity: 0.5 }} />
                  <span style={{ position: "relative", width: 7, height: 7, borderRadius: "50%", background: "#00B880", display: "inline-block" }} />
                </span>
                <span style={{ fontSize: 11, color: "#636678", fontWeight: 600 }}>Online · autonomous mode</span>
              </div>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12, color: "#A5B4FC",
                letterSpacing: "0.06em", fontWeight: 600,
              }}>
                {timeStr}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#454858", marginTop: 2 }}>
                {dateStr} · 78°13′N 15°26′E
              </p>
            </div>
          </div>
        )}

        {/* ── Right: Form panel ────────────────────────────────────────── */}
        <div style={{
          background: isMobile
            ? "linear-gradient(160deg, #060D1E 0%, #0A1428 100%)"
            : "linear-gradient(160deg, #0B1323 0%, #0E1830 100%)",
          padding: isMobile ? "36px 24px 32px" : "48px 44px 40px",
          display: "flex", flexDirection: "column",
        }}>

          {/* Mobile wordmark */}
          {isMobile && (
            <div className="anim-in delay-0" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: "linear-gradient(135deg, #818CF8, #4F46E5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(129,140,248,0.28)",
              }}>
                <Shield size={15} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ color: "#E8EEF8", fontWeight: 900, fontSize: 14, letterSpacing: "0.12em" }}>SIAPS</p>
                <p style={{ color: "#636678", fontSize: 10 }}>Station Alpha · Svalbard</p>
              </div>
            </div>
          )}

          {phase === "credentials" ? (
            <>
              <div className="anim-in delay-1" style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: isMobile ? 24 : 28, fontWeight: 800,
                  color: "#E8EEF8", letterSpacing: "-0.025em", marginBottom: 8, lineHeight: 1.1,
                }}>
                  Secure access
                </h2>
                <p style={{ fontSize: 13, color: "#636678", lineHeight: 1.5 }}>
                  Use your station-issued credentials to authenticate.
                </p>
              </div>

              {error && (
                <div className="anim-scale-in" style={{
                  display: "flex", gap: 9, alignItems: "flex-start",
                  background: "rgba(255,56,96,0.08)", border: "1px solid rgba(255,56,96,0.22)",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                }}>
                  <AlertCircle size={14} style={{ color: "#FF3860", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#FF3860", lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleCredentials} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Username */}
                <div className="anim-in delay-2" style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#636678", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="commander.larsen"
                    autoComplete="username"
                    required
                    style={{
                      width: "100%", padding: "12px 14px",
                      border: "1px solid rgba(129,140,248,0.14)", borderRadius: 10,
                      background: "rgba(129,140,248,0.03)", fontSize: 13, color: "#E8EEF8",
                      fontFamily: "'JetBrains Mono', monospace",
                      outline: "none",
                      transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "rgba(129,140,248,0.55)";
                      e.target.style.background = "rgba(99,160,251,0.06)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.14)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(129,140,248,0.14)";
                      e.target.style.background = "rgba(129,140,248,0.03)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Password */}
                <div className="anim-in delay-3" style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#636678", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="current-password"
                      required
                      style={{
                        width: "100%", padding: "12px 44px 12px 14px",
                        border: "1px solid rgba(129,140,248,0.14)", borderRadius: 10,
                        background: "rgba(129,140,248,0.03)", fontSize: 14, color: "#E8EEF8",
                        outline: "none",
                        transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = "rgba(129,140,248,0.55)";
                        e.target.style.background = "rgba(99,160,251,0.06)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(129,140,248,0.14)";
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "rgba(129,140,248,0.14)";
                        e.target.style.background = "rgba(129,140,248,0.03)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#636678", padding: 4, display: "flex", alignItems: "center",
                        transition: "color 0.14s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#A5B4FC")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#636678")}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="anim-in delay-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-press"
                    style={{
                      width: "100%", padding: "13px 16px",
                      background: loading
                        ? "rgba(0,200,236,0.2)"
                        : "linear-gradient(135deg, #7CB9FB 0%, #0088B0 100%)",
                      color: "white", border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      letterSpacing: "0.01em",
                      boxShadow: loading ? "none" : "0 4px 20px rgba(0,200,236,0.28), 0 1px 3px rgba(0,0,0,0.3)",
                      transition: "background 0.18s ease, box-shadow 0.18s ease",
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(99,160,251,0.40), 0 1px 3px rgba(0,0,0,0.3)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!loading) {
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,200,236,0.28), 0 1px 3px rgba(0,0,0,0.3)";
                      }
                    }}
                  >
                    {loading ? <LoadingRing /> : <><span>Access station</span><ArrowRight size={15} /></>}
                  </button>
                </div>
              </form>

              {/* Demo account */}
              <div className="anim-in delay-5" style={{ marginTop: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(129,140,248,0.08)" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#545868", whiteSpace: "nowrap" }}>Demo account</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(129,140,248,0.08)" }} />
                </div>

                {USERS.slice(0, 1).map(u => (
                  <button
                    key={u.username}
                    type="button"
                    className="btn-press"
                    onClick={() => {
                      haptic("select");
                      setUsername(u.username);
                      setPassword(u.password);
                      setError("");
                      setTimeout(() => {
                        if (u.clearance >= 3) { setPending(u); setPhase("mfa"); }
                        else { onLogin(u); }
                      }, 100);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 14px", borderRadius: 10, width: "100%",
                      background: "rgba(129,140,248,0.04)",
                      border: "1px solid rgba(129,140,248,0.14)",
                      cursor: "pointer", textAlign: "left",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      transition: "border-color 0.14s ease, background 0.14s ease, box-shadow 0.14s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,200,236,0.3)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(129,140,248,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(99,160,251,0.15) inset";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(129,140,248,0.14)";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(129,140,248,0.04)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `linear-gradient(135deg, ${u.color}cc, ${u.color}88)`,
                      color: "white", fontSize: 10, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 10px ${u.color}40`,
                    }}>
                      {u.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#D4D8F8", lineHeight: 1 }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: "#636678", marginTop: 2 }}>{u.role}</p>
                    </div>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, fontWeight: 800, flexShrink: 0,
                      padding: "2px 7px", borderRadius: 4,
                      background: CLEARANCE_COLORS[u.clearance] + "18",
                      color: CLEARANCE_COLORS[u.clearance],
                      border: `1px solid ${CLEARANCE_COLORS[u.clearance]}35`,
                    }}>
                      L{u.clearance}
                    </span>
                  </button>
                ))}
              </div>

              <div className="anim-in delay-6" style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(99,160,251,0.06)" }}>
                <p style={{ fontSize: 11, color: "#4A4D60", textAlign: "center", lineHeight: 1.7 }}>
                  Unauthorised access is prohibited.<br />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#404458" }}>
                    SIAPS v2.4.1 · UNIS / Norwegian Polar Institute
                  </span>
                </p>
              </div>
            </>

          ) : (
            /* ── MFA step ──────────────────────────────────────────────── */
            <>
              {/* User identity card */}
              <div className="anim-in delay-0" style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", marginBottom: 28,
                background: "rgba(0,200,236,0.05)",
                border: "1px solid rgba(99,160,251,0.15)",
                borderRadius: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 9,
                  background: `linear-gradient(135deg, ${pending?.color}cc, ${pending?.color}77)`,
                  color: "white", fontSize: 11, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: `0 0 14px ${pending?.color}40`,
                }}>
                  {pending?.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#DDE2FA" }}>{pending?.name}</p>
                  <p style={{ fontSize: 11, color: "#636678", marginTop: 2 }}>{pending?.role}</p>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: 800,
                  padding: "3px 8px", borderRadius: 5,
                  background: (CLEARANCE_COLORS[pending?.clearance ?? 2]) + "18",
                  color: CLEARANCE_COLORS[pending?.clearance ?? 2],
                  border: `1px solid ${CLEARANCE_COLORS[pending?.clearance ?? 2]}35`,
                  flexShrink: 0,
                }}>
                  L{pending?.clearance}
                </span>
              </div>

              <div className="anim-in delay-1" style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#E8EEF8", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.1 }}>
                  Verify identity
                </h2>
                <p style={{ fontSize: 13, color: "#636678", lineHeight: 1.6 }}>
                  Clearance {pending?.clearance} requires two-factor authentication. Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              {error && (
                <div className="anim-scale-in" style={{
                  display: "flex", gap: 9, alignItems: "flex-start",
                  background: "rgba(255,56,96,0.08)", border: "1px solid rgba(255,56,96,0.22)",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                }}>
                  <AlertCircle size={14} style={{ color: "#FF3860", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#FF3860" }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleMfa}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#636678", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                  Authenticator code
                </label>

                {/* 6 digit boxes */}
                <div
                  className="anim-in delay-2"
                  style={{ display: "flex", gap: 8, marginBottom: 8, cursor: "text" }}
                  onClick={() => document.getElementById("mfa-hidden")?.focus()}
                >
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} style={{
                      flex: 1, height: 56,
                      border: mfaCode.length === idx
                        ? "2px solid #7CB9FB"
                        : mfaCode[idx]
                          ? "1px solid rgba(129,140,248,0.28)"
                          : "1px solid rgba(0,200,236,0.1)",
                      borderRadius: 10,
                      background: mfaCode[idx]
                        ? "rgba(129,140,248,0.08)"
                        : "rgba(0,200,236,0.02)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 22, fontWeight: 700, color: "#A5B4FC",
                      boxShadow: mfaCode.length === idx ? "0 0 0 3px rgba(129,140,248,0.14)" : "none",
                      transition: "border-color 0.14s ease, background 0.14s ease, box-shadow 0.14s ease",
                    }}>
                      {mfaCode[idx] ? "•" : ""}
                    </div>
                  ))}
                </div>

                <input
                  id="mfa-hidden"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={mfaCode}
                  onChange={e => {
                    haptic("light");
                    setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  autoFocus
                  required
                  style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
                />

                <p style={{ fontSize: 11, color: "#4A4D60", marginBottom: 24 }}>
                  Demo: enter any 6 digits to continue
                </p>

                <div className="anim-in delay-3">
                  <button
                    type="submit"
                    disabled={loading || mfaCode.length !== 6}
                    className="btn-press"
                    style={{
                      width: "100%", padding: "13px 16px", marginBottom: 10,
                      background: mfaCode.length === 6 && !loading
                        ? "linear-gradient(135deg, #7CB9FB 0%, #0088B0 100%)"
                        : "rgba(129,140,248,0.08)",
                      color: mfaCode.length === 6 && !loading ? "white" : "#545868",
                      border: "none", borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                      cursor: mfaCode.length === 6 && !loading ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: mfaCode.length === 6 && !loading ? "0 4px 20px rgba(0,200,236,0.28)" : "none",
                      transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
                    }}
                  >
                    {loading ? <LoadingRing /> : <><span>Verify &amp; enter</span><ArrowRight size={15} /></>}
                  </button>

                  <button
                    type="button"
                    onClick={() => { haptic("light"); setPhase("credentials"); setError(""); setMfaCode(""); }}
                    className="btn-press"
                    style={{
                      width: "100%", padding: "11px",
                      background: "none",
                      border: "1px solid rgba(129,140,248,0.14)",
                      borderRadius: 10, fontSize: 13, color: "#636678",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      transition: "border-color 0.14s ease, color 0.14s ease",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,200,236,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#A5B4FC"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(129,140,248,0.14)"; (e.currentTarget as HTMLButtonElement).style.color = "#636678"; }}
                  >
                    ← Back to sign in
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingRing() {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.25)",
      borderTopColor: "white",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}
