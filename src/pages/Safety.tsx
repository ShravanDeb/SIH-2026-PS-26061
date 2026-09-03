import { Shield, CheckCircle, AlertTriangle, Radio, Users, Siren } from "lucide-react";
import { safetyData, alerts } from "../data/mockData";
import { Card, CardHeader, AlertItem, PageHeader, StatCard } from "../components/ui";

export default function Safety() {
  const normalCount = safetyData.criticalSystems.filter((s) => s.status === "normal").length;
  const warnCount   = safetyData.criticalSystems.filter((s) => s.status === "warning").length;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Safety & Emergency Systems"
        subtitle={`Cabin integrity · fire/gas detection · emergency comms · ${safetyData.occupancy} personnel on station`}
        badge={
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${warnCount > 0 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            {warnCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
            {normalCount}/{safetyData.criticalSystems.length} systems normal · {warnCount} advisory
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Emergency Status" value="None Active" sub="No emergency declared"       color="#10b981" />
        <StatCard label="Occupancy"        value={`${safetyData.occupancy} / ${safetyData.maxOccupancy}`} sub="Personnel on station" />
        <StatCard label="Systems Normal"   value={`${normalCount} / ${safetyData.criticalSystems.length}`} sub={`${warnCount} advisory`} color="#10b981" />
        <StatCard label="Active Alerts"    value={safetyData.activeAlerts} sub="Unacknowledged" color={safetyData.activeAlerts > 0 ? "#f59e0b" : "#10b981"} />
      </div>

      {/* Critical systems grid */}
      <Card>
        <CardHeader title="Critical Systems" subtitle="All life-safety and mission-critical infrastructure" icon={<Shield size={14} />} />
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {safetyData.criticalSystems.map((sys) => (
            <div
              key={sys.name}
              className={`flex items-start gap-3 rounded-xl px-4 py-3.5 ${
                sys.status === "normal" ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
              }`}
            >
              {sys.status === "normal"
                ? <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                : <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              }
              <div>
                <p className="text-sm font-semibold text-slate-800">{sys.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sys.detail}</p>
              </div>
              <div className="ml-auto">
                <span className={`text-[11px] font-bold ${sys.status === "normal" ? "text-emerald-600" : "text-amber-600"}`}>
                  {sys.status === "normal" ? "Normal" : "Advisory"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency procedures + Comms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Emergency Procedures" subtitle="Level 4 pre-authorized procedures" icon={<Shield size={14} />} />
          <div className="p-4 space-y-2">
            {[
              { name: "Battery Critical Load Shedding", trigger: "SOC < 15%",                      status: "Armed" },
              { name: "Turbine Emergency Shutdown",     trigger: "Wind > 30 m/s or vibration fault", status: "Armed" },
              { name: "Fire Response Protocol",         trigger: "Smoke/heat sensor trigger",         status: "Armed" },
              { name: "Generator Emergency Start",      trigger: "SOC < 20% & no renewables",         status: "Armed" },
              { name: "Station Evacuation Alert",       trigger: "Structural integrity alarm",         status: "Armed" },
              { name: "Iridium Emergency Beacon",       trigger: "Manual activation or EPIRB",         status: "Armed" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">Trigger: {p.trigger}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 shrink-0">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Communication Links" subtitle="All links active — emergency channels ready" icon={<Radio size={14} />} />
          <div className="p-4 space-y-2">
            {[
              { name: "VSAT Primary (Ku-band)", detail: "12.4 Mbps · 580ms latency · 98.7% uptime",        active: true },
              { name: "Iridium SBD Backup",    detail: "L-band · 0.1 kbps · 99.9% uptime",                active: true },
              { name: "HF Radio SSB",          detail: "14.225 MHz · SSB · Norwegian Coast Guard channel", active: true },
              { name: "AIS Class B Beacon",    detail: "156.8 MHz · broadcasting MMSI 259001234",          active: true },
              { name: "Emergency PLB",         detail: "406 MHz · Cospas-Sarsat EPIRB · ready",            active: true, standby: true },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.detail}</p>
                </div>
                <span className={`text-xs font-semibold shrink-0 ${c.standby ? "text-slate-500" : "text-emerald-600"}`}>
                  {c.standby ? "Standby" : "Active"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Safety alerts */}
      <Card>
        <CardHeader title="Safety-Relevant Alerts" subtitle="Recent events with safety implications" />
        <div>
          {alerts.filter((a) => ["warning", "error"].includes(a.severity)).map((a) => (
            <AlertItem key={a.id} {...a} />
          ))}
        </div>
      </Card>
    </div>
  );
}
