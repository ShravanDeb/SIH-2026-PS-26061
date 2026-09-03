import React from "react";
import { GitBranch, Bot, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardHeader, StatCard, PageHeader } from "../components/ui";

const logs = [
  { id:"l1",  time:"09:42:03", type:"sensor",         actor:"system",   action:"Weather station data sync complete",                            detail:"14 sensors · latency 1.2s",                                                     outcome:"ok" },
  { id:"l2",  time:"09:41:58", type:"recommendation", actor:"AI",       action:"Generated recommendation: Pre-position generator to warm-standby", detail:"Confidence 84% · Level 2 approval required · Reason: blizzard forecast",      outcome:"pending" },
  { id:"l3",  time:"09:38:12", type:"recommendation", actor:"AI",       action:"Generated recommendation: Delay non-critical heating 40 min",   detail:"Confidence 91% · Level 1 awaiting operator acknowledgment",                    outcome:"pending" },
  { id:"l4",  time:"09:31:44", type:"approval",       actor:"operator", action:"Approved: Charge battery to 90% SOC",                           detail:"Operator: J. Andersen · Auth code: JA-2847 · Execution authorized",             outcome:"approved" },
  { id:"l5",  time:"09:12:07", type:"autonomous",     actor:"AI",       action:"Initiated battery pre-storm charging cycle (L1 autonomous)",     detail:"Target SOC 90% by 11:30 · +2.3 kW charge rate initiated",                     outcome:"ok" },
  { id:"l6",  time:"09:08:55", type:"recommendation", actor:"AI",       action:"Generated recommendation: Reduce scientific instrument heating",  detail:"Confidence 88% · Level 1 · Reduction to 65%",                                 outcome:"approved" },
  { id:"l7",  time:"08:55:32", type:"autonomous",     actor:"AI",       action:"Applied load reduction: Science instrument heating → 65%",       detail:"Operator-approved · saves 1.8 kW continuously",                                outcome:"ok" },
  { id:"l8",  time:"08:47:21", type:"alert",          actor:"system",   action:"ALERT: Wind Turbine T-2 vibration anomaly detected",             detail:"Gearbox bearing 0.87 mm/s RMS (threshold 0.80) · monitoring initiated",       outcome:"warn" },
  { id:"l9",  time:"08:30:14", type:"rejection",      actor:"operator", action:"Rejected: Suspend satellite data upload",                        detail:"Operator: M. Kovalenko · Reason: Science data continuity priority",            outcome:"rejected" },
  { id:"l10", time:"07:22:45", type:"alert",          actor:"system",   action:"INFO: AED battery replacement overdue 3 days",                   detail:"Device functional · replacement scheduled resupply March 28",                  outcome:"info" },
  { id:"l11", time:"06:15:00", type:"autonomous",     actor:"AI",       action:"Morning optimization: HVAC pre-heat schedule adjusted",          detail:"Level 1 · overnight wind surplus used for thermal pre-conditioning",          outcome:"ok" },
  { id:"l12", time:"00:00:00", type:"system",         actor:"system",   action:"Daily health report: 9 subsystems · 2 advisories carried forward · 0 faults",  detail:"43 AI decisions · 4 operator interventions · uptime 127d 14h",               outcome:"ok" },
];

const TYPE_CFG: Record<string, { cls: string; label: string }> = {
  recommendation: { cls: "bg-sky-50 text-sky-700 border-sky-200",      label: "Recommendation" },
  autonomous:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Autonomous" },
  approval:       { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approval" },
  rejection:      { cls: "bg-red-50 text-red-700 border-red-200",       label: "Rejection" },
  alert:          { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Alert" },
  sensor:         { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Sensor" },
  system:         { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "System" },
};

const OUTCOME_EL: Record<string, React.ReactElement> = {
  ok:       <CheckCircle size={13} className="text-emerald-500" />,
  approved: <CheckCircle size={13} className="text-emerald-500" />,
  rejected: <XCircle    size={13} className="text-red-500" />,
  warn:     <span className="text-amber-500 text-sm">⚠</span>,
  pending:  <Clock      size={13} className="text-amber-500" />,
  info:     <span className="text-sky-400 text-sm">ℹ</span>,
};

export default function Logs() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Events & Decision Log"
        subtitle="Immutable audit trail — all AI decisions, operator actions, system events · append-only"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Events Today"    value="847"  sub="All event types"                 />
        <StatCard label="AI Decisions"    value="839"  sub="Autonomous + recommendations"    color="#0ea5e9" />
        <StatCard label="Operator Actions" value="4"   sub="Approvals / rejections"          color="#10b981" />
        <StatCard label="Alerts"          value="5"    sub="2 unacknowledged"                color="#f59e0b" />
      </div>

      <Card>
        <CardHeader title="Event Log — Today" subtitle="Most recent first · UTC timestamps" icon={<GitBranch size={14} />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                {["Time", "Actor", "Type", "Action / Description", "Detail", "Outcome"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const tc = TYPE_CFG[l.type];
                return (
                  <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{l.time}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {l.actor === "AI"       ? <Bot  size={12} className="text-sky-500" />    :
                         l.actor === "operator" ? <User size={12} className="text-emerald-500" /> :
                         <div className="w-3 h-3 rounded-full bg-slate-300" />}
                        <span className="text-xs font-semibold text-slate-700 capitalize">{l.actor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {tc && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${tc.cls}`}>
                          {tc.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800 max-w-xs">{l.action}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">{l.detail}</td>
                    <td className="px-4 py-3">
                      {OUTCOME_EL[l.outcome] || <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
