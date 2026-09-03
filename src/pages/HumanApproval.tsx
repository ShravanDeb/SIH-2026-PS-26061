import {
  AlertTriangle, CheckCircle, XCircle, Clock, User, Users, Shield,
  Lock, Terminal, X,
} from "lucide-react";
import { approvalQueue } from "../data/mockData";
import { Card, CardHeader, LevelBadge, PageHeader } from "../components/ui";
import { useState } from "react";

const DANGER_ACTIONS = new Set(["Emergency Station Shutdown", "Disconnect Battery", "Disable AI Autonomy"]);

type LogEntry = { action: string; time: string; status: "executed" | "cancelled" };

function PinModal({ action, onConfirm, onCancel }: { action: string; onConfirm: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const isDanger = DANGER_ACTIONS.has(action);

  const submit = () => {
    if (pin.length < 4) { setError("PIN must be at least 4 digits."); return; }
    if (pin !== "1234") { setError("Incorrect PIN. Access denied."); setPin(""); return; }
    setConfirming(true);
    setTimeout(onConfirm, 600);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, width: 360, padding: "28px 28px 24px", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: isDanger ? "var(--red-bg)" : "var(--blue-bg)", border: `1px solid ${isDanger ? "var(--red-border)" : "var(--blue-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={14} style={{ color: isDanger ? "var(--red)" : "var(--blue)" }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Operator PIN Required</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>Manual override authorization</p>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}><X size={16} /></button>
        </div>

        <div style={{ background: isDanger ? "var(--red-bg)" : "var(--amber-bg)", border: `1px solid ${isDanger ? "var(--red-border)" : "var(--amber-border)"}`, borderRadius: 8, padding: "10px 12px", marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: isDanger ? "var(--red)" : "var(--amber)", marginBottom: 3 }}>{isDanger ? "⚠ CRITICAL ACTION" : "Manual Override"}</p>
          <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{action}</p>
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Enter Operator PIN
        </label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          autoFocus
          placeholder="••••"
          style={{
            width: "100%", boxSizing: "border-box",
            fontFamily: "JetBrains Mono, monospace", fontSize: 22, letterSpacing: "0.3em",
            textAlign: "center", padding: "10px 14px",
            background: "var(--surface-2)", border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
            borderRadius: 8, color: "var(--text-1)", outline: "none",
          }}
        />
        {error && <p style={{ fontSize: 11, color: "var(--red)", marginTop: 6 }}>{error}</p>}
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, textAlign: "center" }}>Demo PIN: 1234</p>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-2)", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={confirming}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: isDanger ? "var(--red)" : "var(--blue)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", opacity: confirming ? 0.7 : 1 }}
          >
            {confirming ? "Executing…" : "Authorize"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HumanApproval() {
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected" | "delayed">>({});
  const [pendingOverride, setPendingOverride] = useState<string | null>(null);
  const [overrideLog, setOverrideLog] = useState<LogEntry[]>([]);

  const decide = (id: string, d: "approved" | "rejected" | "delayed") =>
    setDecisions((prev) => ({ ...prev, [id]: d }));

  const executeOverride = () => {
    if (!pendingOverride) return;
    const entry: LogEntry = {
      action: pendingOverride,
      time: new Date().toUTCString().split(" ").slice(1, 5).join(" "),
      status: "executed",
    };
    setOverrideLog(prev => [entry, ...prev]);
    setPendingOverride(null);
  };

  const cancelOverride = () => {
    if (pendingOverride) {
      setOverrideLog(prev => [{ action: pendingOverride, time: new Date().toUTCString().split(" ").slice(1, 5).join(" "), status: "cancelled" }, ...prev]);
    }
    setPendingOverride(null);
  };

  return (
    <>
    {pendingOverride && (
      <PinModal
        action={pendingOverride}
        onConfirm={executeOverride}
        onCancel={cancelOverride}
      />
    )}
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Human Approval System"
        subtitle="AI cannot bypass mandatory human authorization — all Level 2+ actions require explicit operator approval"
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-700">
            <AlertTriangle size={12} />
            {approvalQueue.length} pending
          </div>
        }
      />

      {/* Policy overview */}
      <div className="bg-slate-900 rounded-xl p-5">
        <p className="text-sm font-bold text-white mb-3">Authorization Policy</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <User size={14} />, label: "Level 2 — Single Approval", desc: "Any authorized operator. Action executes immediately upon approval.", color: "bg-amber-500/10 border-amber-500/20 text-amber-300" },
            { icon: <Users size={14} />, label: "Level 3 — Two-Person Auth", desc: "Two independent authorized persons required. Cannot be waived under any circumstances.", color: "bg-red-500/10 border-red-500/20 text-red-300" },
            { icon: <Shield size={14} />, label: "Level 4 — Emergency Procedure", desc: "Pre-authorized procedure. Activates automatically when trigger condition is met.", color: "bg-purple-500/10 border-purple-500/20 text-purple-300" },
          ].map((p) => (
            <div key={p.label} className={`border rounded-xl p-3.5 ${p.color}`}>
              <div className="flex items-center gap-2 mb-1.5">{p.icon}<span className="text-xs font-bold">{p.label}</span></div>
              <p className="text-xs opacity-75 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Approval queue */}
      <div className="space-y-4">
        {approvalQueue.map((item) => {
          const d = decisions[item.id];
          const isApproved = d === "approved";
          const isRejected = d === "rejected";
          const isDelayed  = d === "delayed";
          const isDone     = isApproved || isRejected || isDelayed;

          return (
            <Card key={item.id} className={isApproved ? "border-emerald-300 bg-emerald-50/30" : isRejected ? "border-red-200" : isDelayed ? "border-slate-200" : "border-amber-200"}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <LevelBadge level={item.level} />
                    <span className="text-xs text-slate-500 font-mono">Requested {item.requestedAt} · Required by {item.requiredBy}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.action}</h3>
                </div>
                {isApproved && <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-semibold shrink-0 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5"><CheckCircle size={14} />Approved</div>}
                {isRejected && <div className="flex items-center gap-1.5 text-red-600 text-sm font-semibold shrink-0 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5"><XCircle size={14} />Rejected</div>}
                {isDelayed  && <div className="flex items-center gap-1.5 text-slate-600 text-sm font-semibold shrink-0 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5"><Clock size={14} />Delayed 1h</div>}
              </div>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Reasoning</p>
                    <div className="bg-slate-50 rounded-xl p-4"><p className="text-[13px] text-slate-700 leading-relaxed">{item.ai_reasoning}</p></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Risk Assessment</p>
                    <div className="bg-slate-50 rounded-xl p-4"><p className="text-[13px] text-slate-700 leading-relaxed">{item.risk}</p></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Result</p>
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4"><p className="text-[13px] text-sky-800 leading-relaxed font-medium">{item.expectedResult}</p></div>
                  </div>
                  {!isDone ? (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Decision</p>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => decide(item.id, "approved")} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"><CheckCircle size={14} />Approve</button>
                        <button onClick={() => decide(item.id, "delayed")}  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"><Clock size={14} />Delay 1 hour</button>
                        <button onClick={() => decide(item.id, "rejected")} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"><XCircle size={14} />Reject</button>
                      </div>
                      {item.level === 3 && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <Users size={13} /><span className="font-semibold">Second authorization required</span><span className="text-red-500">— pending second authorized person</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`rounded-xl p-4 text-sm font-medium ${isApproved ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : isRejected ? "bg-red-50 text-red-800 border border-red-200" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                      {isApproved && "✓ Action authorized. AI will execute per approved parameters. Logged to decision record."}
                      {isRejected && "✗ Action rejected. AI will not execute. Logged with operator ID. AI will generate alternative recommendations."}
                      {isDelayed  && "⏸ Action delayed 1 hour. AI will re-present for decision at 10:42 UTC."}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Manual Override Panel ──────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Manual Override"
          subtitle="Direct operator control — bypasses AI recommendations. PIN required. All actions are immutably logged."
          icon={<Lock size={14} />}
        />
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Start Generator",            danger: false },
              { label: "Stop Generator",             danger: false },
              { label: "Disconnect Battery",         danger: true  },
              { label: "Force Load Shed Tier 1",     danger: false },
              { label: "Override Turbine Feathering",danger: false },
              { label: "Emergency Station Shutdown", danger: true  },
              { label: "Disable AI Autonomy",        danger: true  },
              { label: "Restore Default Mode",       danger: false },
            ].map(({ label, danger }) => (
              <button
                key={label}
                onClick={() => setPendingOverride(label)}
                className={`text-xs text-left px-3.5 py-2.5 rounded-lg font-medium leading-snug transition-all ${
                  danger
                    ? "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                    : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {danger && <span style={{ marginRight: 4 }}>⚠</span>}{label}
              </button>
            ))}
          </div>

          {/* Override log */}
          {overrideLog.length > 0 && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Terminal size={12} style={{ color: "var(--text-3)" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Override Log (this session)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {overrideLog.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "JetBrains Mono, monospace", fontSize: 11, padding: "6px 10px", borderRadius: 6, background: e.status === "executed" ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${e.status === "executed" ? "var(--green-border)" : "var(--border)"}` }}>
                    <span style={{ color: e.status === "executed" ? "var(--green)" : "var(--text-3)" }}>{e.status === "executed" ? "✓ EXEC" : "✗ CANCEL"}</span>
                    <span style={{ flex: 1, color: "var(--text-1)", fontWeight: 600 }}>{e.action}</span>
                    <span style={{ color: "var(--text-3)" }}>{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 14, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: "var(--text-2)" }}>Note:</span> Manual overrides require operator PIN confirmation and are subject to post-event review. All actions are immutably logged with timestamp and operator ID.
          </p>

          {/* Override log */}
          {overrideLog.length > 0 && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Terminal size={12} style={{ color: "var(--text-3)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Override Log</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {overrideLog.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "JetBrains Mono, monospace", fontSize: 11, padding: "6px 10px", borderRadius: 6, background: e.status === "executed" ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${e.status === "executed" ? "var(--green-border)" : "var(--border)"}` }}>
                    <span style={{ color: e.status === "executed" ? "var(--green)" : "var(--text-3)" }}>{e.status === "executed" ? "✓ EXEC" : "✗ CANCEL"}</span>
                    <span style={{ flex: 1, color: "var(--text-1)", fontWeight: 600 }}>{e.action}</span>
                    <span style={{ color: "var(--text-3)" }}>{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

    </div>
    </>
  );
}
