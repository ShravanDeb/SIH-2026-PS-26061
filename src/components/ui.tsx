import React, { ReactNode } from "react";
import {
  AlertTriangle, CheckCircle, XCircle, Info,
  TrendingUp, TrendingDown,
} from "lucide-react";

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", interactive = false }: { children: ReactNode; className?: string; interactive?: boolean }) {
  return (
    <div
      className={`rounded-lg overflow-hidden ${interactive ? "card-hover" : ""} ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title, subtitle, action, icon, accent,
}: {
  title: string; subtitle?: string; action?: ReactNode;
  icon?: ReactNode; accent?: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span style={{ color: accent || "var(--text-3)" }} className="shrink-0">{icon}</span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-1)" }}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs mt-0.5 leading-tight" style={{ color: "var(--text-3)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 ml-3">{action}</div>}
    </div>
  );
}

// ─── KPI Card — large, precise numbers ───────────────────────────────────────
export function KpiCard({
  label, value, unit, sub, color, trend, delta, icon,
}: {
  label: string; value: string | number; unit?: string;
  sub?: string; color?: string; trend?: "up" | "down" | "flat";
  delta?: string; icon?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg px-5 py-5 flex flex-col gap-1 card-hover"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "default" }}
    >
      <div className="flex items-start justify-between mb-1">
        <p
          className="text-xs font-semibold uppercase tracking-widest leading-none"
          style={{ color: "var(--text-3)" }}
        >
          {label}
        </p>
        {icon && <span style={{ color: "var(--text-3)" }}>{icon}</span>}
      </div>
      <div className="flex items-end gap-1.5">
        <span
          className="mono font-bold leading-none"
          style={{ fontSize: 32, color: color || "var(--text-1)", letterSpacing: "-0.02em" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="mono font-medium mb-1"
            style={{ fontSize: 13, color: "var(--text-3)" }}
          >
            {unit}
          </span>
        )}
        {trend && (
          <span className={`mb-1 ml-1 ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400"}`}>
            {trend === "up"   ? <TrendingUp size={14} /> :
             trend === "down" ? <TrendingDown size={14} /> : null}
          </span>
        )}
      </div>
      {sub && (
        <p className="text-xs leading-snug mt-0.5" style={{ color: "var(--text-3)" }}>{sub}</p>
      )}
    </div>
  );
}

// Legacy compat
export function StatCard({ label, value, unit, sub, color, trend, icon }: {
  label: string; value: string | number; unit?: string; sub?: string;
  color?: string; trend?: "up" | "down" | "flat"; icon?: ReactNode;
}) {
  return <KpiCard label={label} value={value} unit={unit} sub={sub} color={color} trend={trend} icon={icon} />;
}
export function MetricCard({ label, value, unit, sub, statusColor }: {
  label: string; value: string | number; unit?: string; sub?: string; statusColor?: string; large?: boolean;
}) {
  return <KpiCard label={label} value={value} unit={unit} sub={sub} color={statusColor} />;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const BADGE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  normal:      { bg: "var(--green-bg)",  text: "var(--green)",  border: "var(--green-border)",  dot: "var(--green)"  },
  warning:     { bg: "var(--amber-bg)",  text: "var(--amber)",  border: "var(--amber-border)",  dot: "var(--amber)"  },
  error:       { bg: "var(--red-bg)",    text: "var(--red)",    border: "var(--red-border)",     dot: "var(--red)"    },
  info:        { bg: "var(--blue-bg)",   text: "var(--blue)",   border: "var(--blue-border)",    dot: "var(--blue)"   },
  standby:     { bg: "var(--surface-2)", text: "var(--text-2)", border: "var(--border)",         dot: "var(--text-3)" },
  charging:    { bg: "var(--blue-bg)",   text: "var(--blue)",   border: "var(--blue-border)",    dot: "var(--blue)"   },
  discharging: { bg: "var(--amber-bg)",  text: "var(--amber)",  border: "var(--amber-border)",   dot: "var(--amber)"  },
};
const BADGE_LABELS: Record<string, string> = {
  normal: "Normal", warning: "Warning", error: "Fault", info: "Info",
  standby: "Standby", charging: "Charging", discharging: "Discharging",
};

export function StatusBadge({ status, label }: {
  status: "normal"|"warning"|"error"|"info"|"standby"|"charging"|"discharging";
  label?: string;
}) {
  const b = BADGE[status] || BADGE.normal;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold"
      style={{ background: b.bg, color: b.text, border: `1px solid ${b.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: b.dot }} />
      {label || BADGE_LABELS[status]}
    </span>
  );
}

// ─── Level Badge ─────────────────────────────────────────────────────────────
const LEVELS = [
  { label: "L0 — Information",     bg: "var(--surface-2)", text: "var(--text-2)",  border: "var(--border)" },
  { label: "L1 — Autonomous",      bg: "var(--green-bg)",  text: "var(--green)",   border: "var(--green-border)" },
  { label: "L2 — Approval",        bg: "var(--amber-bg)",  text: "var(--amber)",   border: "var(--amber-border)" },
  { label: "L3 — Two-Person Auth", bg: "var(--red-bg)",    text: "var(--red)",     border: "var(--red-border)" },
  { label: "L4 — Emergency",       bg: "#F5F3FF",          text: "#6D28D9",        border: "#DDD6FE" },
];
export function LevelBadge({ level }: { level: number }) {
  const c = LEVELS[level] || LEVELS[0];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  );
}

// ─── Alert Item ───────────────────────────────────────────────────────────────
const A_ICON = {
  warning: <AlertTriangle size={13} className="shrink-0 mt-px" style={{ color: "var(--amber)" }} />,
  error:   <XCircle      size={13} className="shrink-0 mt-px" style={{ color: "var(--red)" }} />,
  info:    <Info         size={13} className="shrink-0 mt-px" style={{ color: "var(--blue)" }} />,
};
const A_ACCENT: Record<string, string> = {
  warning: "var(--amber)", error: "var(--red)", info: "var(--blue)",
};

export function AlertItem({
  severity, time, system, message, action, acknowledged,
}: {
  severity: "warning"|"error"|"info"; time: string; system: string;
  message: string; action?: string; acknowledged?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3.5 flex gap-3 ${acknowledged ? "opacity-50" : ""}`}
      style={{
        borderBottom: "1px solid var(--border)",
        borderLeft: `3px solid ${acknowledged ? "transparent" : A_ACCENT[severity]}`,
      }}
    >
      <div className="shrink-0 mt-0.5">{A_ICON[severity]}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-bold" style={{ color: "var(--text-1)" }}>{system}</span>
          <span className="mono text-xs" style={{ color: "var(--text-3)" }}>{time}</span>
          {acknowledged && <CheckCircle size={10} style={{ color: "var(--text-3)" }} />}
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{message}</p>
        {action && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>→ {action}</p>
        )}
      </div>
    </div>
  );
}

// ─── Health Bar ───────────────────────────────────────────────────────────────
export function HealthBar({
  value, label, showValue = true,
}: { value: number; label?: string; showValue?: boolean }) {
  const color =
    value >= 90 ? "var(--green)"  :
    value >= 75 ? "var(--amber)"  :
    value >= 50 ? "#EA580C"       :
    "var(--red)";
  const textColor =
    value >= 90 ? "var(--green)"  :
    value >= 75 ? "var(--amber)"  :
    "var(--red)";
  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs" style={{ color: "var(--text-2)" }}>{label}</span>
          {showValue && (
            <span className="mono text-xs font-semibold" style={{ color: textColor }}>{value}%</span>
          )}
        </div>
      )}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`, background: color,
            transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
export function StatRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div
      className="flex justify-between items-center py-1.5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="text-xs" style={{ color: "var(--text-3)" }}>{label}</span>
      <span
        className="mono text-xs font-semibold"
        style={{ color: warn ? "var(--amber)" : "var(--text-1)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({
  title, subtitle, badge, action,
}: {
  title: string; subtitle?: string; badge?: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1
            className="font-bold tracking-tight leading-tight"
            style={{ fontSize: 20, color: "var(--text-1)" }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-3)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-xs font-bold uppercase tracking-widest mb-3"
      style={{ color: "var(--text-3)" }}
    >
      {children}
    </p>
  );
}

// ─── Inline data pair ────────────────────────────────────────────────────────
export function DataPair({ label, value, unit, color }: {
  label: string; value: string | number; unit?: string; color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide font-medium" style={{ color: "var(--text-3)", fontSize: 10 }}>
        {label}
      </span>
      <span className="mono font-semibold" style={{ fontSize: 13, color: color || "var(--text-1)" }}>
        {value}{unit && <span style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}> {unit}</span>}
      </span>
    </div>
  );
}
