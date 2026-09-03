import { User, Bot, Bell, Shield, ChevronRight } from "lucide-react";
import { Card, CardHeader, PageHeader } from "../components/ui";
import { useState } from "react";

const users = [
  { name: "Johan Andersen",  role: "Station Commander",  level: 3, initials: "JA", lastLogin: "Today 08:12" },
  { name: "Maria Kovalenko", role: "Systems Engineer",   level: 2, initials: "MK", lastLogin: "Today 07:45" },
  { name: "Erik Haugen",     role: "Energy Technician",  level: 2, initials: "EH", lastLogin: "Yesterday 18:30" },
  { name: "Anya Petrov",     role: "Research Scientist", level: 1, initials: "AP", lastLogin: "Today 09:10" },
];

const policies = [
  { label: "L1 Autonomous load optimization",         desc: "AI adjusts flexible loads, heating schedules, MPPT parameters",                   on: true },
  { label: "L1 Battery charge/discharge optimization", desc: "AI manages charging curves within operator SOC limits",                            on: true },
  { label: "L1 Renewable tracking adjustments",        desc: "AI adjusts pitch, yaw, and inverter parameters autonomously",                      on: true },
  { label: "Require L2 approval for generator start",  desc: "Generator start always requires single authorized operator approval",              on: true },
  { label: "Require L3 for emergency load shedding",   desc: "Tier 1 load shedding requires two-person authorization",                          on: true },
  { label: "AI weather-based pre-positioning",         desc: "AI can request pre-storm actions up to 48h in advance for operator approval",      on: true },
];

const thresholds = [
  { param: "Battery SOC warning",        value: "30%",    desc: "Alert when SOC drops below" },
  { param: "Battery SOC critical",       value: "20%",    desc: "Emergency protocol trigger" },
  { param: "Auto generator start",       value: "20% SOC", desc: "Generator start threshold" },
  { param: "Turbine cut-out speed",      value: "25 m/s", desc: "Auto-feathering wind speed" },
  { param: "Battery temp warning",       value: "35°C / 5°C", desc: "High / low thermal alert" },
  { param: "Renewable share alert",      value: "< 20%",  desc: "When renewable share falls critically" },
];

export default function Settings() {
  const [toggles, setToggles] = useState<boolean[]>(policies.map((p) => p.on));

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Settings & User Roles"
        subtitle="System configuration · user authorization · AI autonomy policy · alert thresholds"
      />

      {/* User management */}
      <Card>
        <CardHeader title="User Management" subtitle="Authorization levels for the approval workflow" icon={<User size={14} />} />
        <div className="p-4 space-y-2">
          {users.map((u) => (
            <div key={u.name} className="flex items-center gap-4 px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                {u.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{u.role}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  u.level === 3 ? "bg-red-50 text-red-700" :
                  u.level === 2 ? "bg-amber-50 text-amber-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  Level {u.level} Auth
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Last login: {u.lastLogin}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI autonomy policy */}
      <Card>
        <CardHeader title="AI Autonomy Policy" subtitle="Control what AI can execute without human approval" icon={<Bot size={14} />} />
        <div className="p-4 space-y-2">
          {policies.map((p, i) => (
            <div key={p.label} className="flex items-start gap-4 px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{p.desc}</p>
              </div>
              <button
                onClick={() => {
                  const next = [...toggles];
                  next[i] = !next[i];
                  setToggles(next);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 mt-0.5 ${
                  toggles[i] ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    toggles[i] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Alert thresholds */}
      <Card>
        <CardHeader title="Alert Thresholds" subtitle="Configurable safety and operational limits" icon={<Bell size={14} />} />
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
          {thresholds.map((t) => (
            <div key={t.param} className="flex items-center justify-between px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">{t.param}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
              </div>
              <span className="text-sm font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-lg ml-4 shrink-0">
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
