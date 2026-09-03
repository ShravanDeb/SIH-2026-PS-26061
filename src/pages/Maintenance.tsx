import { Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { equipmentHealth } from "../data/mockData";
import { Card, CardHeader, HealthBar } from "../components/ui";

const maintenancePlan = [
  { id: "m1", equipment: "HVAC Air Filter", priority: "high", dueDate: "2025-04-04", dueIn: "22 days", type: "Replacement", estimatedTime: "2h", technicians: 1 },
  { id: "m2", equipment: "Generator Oil Change", priority: "medium", dueDate: "2025-04-22", dueIn: "~40 days (500h)", type: "Fluid service", estimatedTime: "4h", technicians: 1 },
  { id: "m3", equipment: "Wind Turbine T-2 Inspection", priority: "high", dueDate: "2025-04-18", dueIn: "~35 days", type: "Inspection + bearing", estimatedTime: "8h", technicians: 2 },
  { id: "m4", equipment: "Battery BMS Firmware Update", priority: "low", dueDate: "2025-06-01", dueIn: "~79 days", type: "Software update", estimatedTime: "1h", technicians: 1 },
  { id: "m5", equipment: "Generator Full Service", priority: "medium", dueDate: "2025-05-20", dueIn: "~67 days", type: "Full service", estimatedTime: "12h", technicians: 2 },
  { id: "m6", equipment: "Solar Array Cleaning — All", priority: "low", dueDate: "2025-05-01", dueIn: "~48 days", type: "Cleaning", estimatedTime: "6h", technicians: 2 },
];

const priorityColors: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function Maintenance() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Predictive Maintenance</h1>
        <p className="text-sm text-slate-500 mt-0.5">Next: HVAC filter Apr 4 · T-2 bearing inspection Apr 18 · {maintenancePlan.length} tasks queued</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Upcoming Tasks", value: maintenancePlan.length, sub: "Next 90 days", color: "text-slate-800" },
          { label: "High Priority", value: maintenancePlan.filter(m => m.priority === "high").length, sub: "Require attention soon", color: "text-red-600" },
          { label: "AI Detected Issues", value: 3, sub: "Equipment anomalies", color: "text-amber-600" },
          { label: "Prediction Accuracy", value: "94.2%", sub: "9 assets · 18-mo baseline", color: "text-green-600" },
        ].map((m) => (
          <Card key={m.label} className="px-4 py-3">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
          </Card>
        ))}
      </div>

      {/* Maintenance schedule */}
      <Card>
        <CardHeader title="Maintenance Schedule" subtitle="Next 90 days · AI-prioritized" icon={<Wrench size={14} />} />
        <div className="p-4 space-y-2">
          {maintenancePlan.map((m) => (
            <div key={m.id} className="flex items-start gap-3 px-3 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="mt-0.5">
                {m.priority === "high" ? (
                  <AlertTriangle size={14} className="text-red-500" />
                ) : m.priority === "medium" ? (
                  <Clock size={14} className="text-amber-500" />
                ) : (
                  <CheckCircle size={14} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-slate-800">{m.equipment}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${priorityColors[m.priority]}`}>
                    {m.priority.charAt(0).toUpperCase() + m.priority.slice(1)}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Type: {m.type}</span>
                  <span>Duration: {m.estimatedTime}</span>
                  <span>Technicians: {m.technicians}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono font-semibold text-slate-800">{m.dueDate}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.dueIn}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Health degradation projection */}
      <Card>
        <CardHeader title="Equipment Health Trends" subtitle="Current state with AI-projected 90-day outlook" />
        <div className="p-4 space-y-3">
          {equipmentHealth.filter(e => e.predictedFailure || e.status === "warning").map((eq) => (
            <div key={eq.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{eq.name}</span>
                <span className={`font-mono font-semibold ${eq.health >= 90 ? "text-green-600" : eq.health >= 75 ? "text-amber-600" : "text-red-600"}`}>
                  {eq.health}%
                </span>
              </div>
              <HealthBar value={eq.health} />
              {eq.predictedFailure && (
                <p className="text-xs text-orange-600 mt-1">⚠ Predicted: {eq.predictedFailure}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
