import { Activity, AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";
import { equipmentHealth } from "../data/mockData";
import { Card, CardHeader, HealthBar, StatCard, PageHeader } from "../components/ui";

const CAT_COLORS: Record<string, string> = {
  Solar:         "bg-amber-50 text-amber-700 border-amber-200",
  Wind:          "bg-sky-50 text-sky-700 border-sky-200",
  Battery:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  Generator:     "bg-orange-50 text-orange-700 border-orange-200",
  HVAC:          "bg-purple-50 text-purple-700 border-purple-200",
  Sensors:       "bg-teal-50 text-teal-700 border-teal-200",
  Communication: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function EquipmentHealth() {
  const avgHealth = Math.round(equipmentHealth.reduce((a, b) => a + b.health, 0) / equipmentHealth.length);
  const warnings  = equipmentHealth.filter((e) => e.status === "warning").length;
  const predicted = equipmentHealth.filter((e) => e.predictedFailure).length;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Equipment Health"
        subtitle="All monitored systems · anomaly detection · AI-driven predictive analysis"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Fleet Health Score"   value={`${avgHealth}%`}               sub="Average across all equipment" color={avgHealth >= 90 ? "#10b981" : "#f59e0b"} />
        <StatCard label="Equipment Monitored" value={equipmentHealth.length}          sub="Active monitoring" />
        <StatCard label="Active Warnings"     value={warnings}                        sub="Require attention" color={warnings > 0 ? "#f59e0b" : "#10b981"} />
        <StatCard label="Predicted Issues"    value={predicted}                       sub="AI failure forecast" color={predicted > 0 ? "#f97316" : "#10b981"} />
      </div>

      {/* Predicted failures callout */}
      {predicted > 0 && (
        <Card className="border-orange-200">
          <div className="px-5 py-3.5 bg-orange-50 border-b border-orange-200 rounded-t-xl flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-600" />
            <p className="text-sm font-bold text-orange-800">AI Failure Predictions — Schedule Maintenance</p>
          </div>
          <div className="p-4 space-y-2.5">
            {equipmentHealth.filter((e) => e.predictedFailure).map((eq) => (
              <div key={eq.id} className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <Wrench size={14} className="text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{eq.name}</p>
                  <p className="text-xs text-orange-700 mt-0.5 font-medium">{eq.predictedFailure}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{eq.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">Schedule before</p>
                  <p className="text-xs font-mono font-bold text-slate-800">{eq.nextMaintenance}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Equipment table */}
      <Card>
        <CardHeader title="Equipment Registry" subtitle="Complete fleet with health scores and maintenance status" icon={<Activity size={14} />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                {["Equipment", "Category", "Health", "Status", "Anomalies", "Next Maintenance", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipmentHealth.map((eq) => (
                <tr key={eq.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 whitespace-nowrap">{eq.name}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${CAT_COLORS[eq.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {eq.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-20">
                        <HealthBar value={eq.health} showValue={false} />
                      </div>
                      <span className={`text-xs font-mono font-bold ${eq.health >= 90 ? "text-emerald-600" : eq.health >= 75 ? "text-amber-600" : "text-red-600"}`}>
                        {eq.health}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {eq.status === "normal"
                      ? <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle size={11} /> Normal</span>
                      : <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><AlertTriangle size={11} /> Warning</span>
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    {eq.anomalies > 0
                      ? <span className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded px-2 py-0.5">{eq.anomalies} detected</span>
                      : <span className="text-xs text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 font-mono whitespace-nowrap">{eq.nextMaintenance}</td>
                  <td className="px-4 py-3.5 text-xs max-w-[220px]">
                    {eq.predictedFailure
                      ? <span className="text-orange-600 font-semibold">⚠ {eq.predictedFailure}</span>
                      : <span className="text-slate-400">{eq.detail}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
