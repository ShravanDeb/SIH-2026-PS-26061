import { Flame, CheckCircle } from "lucide-react";
import { powerData } from "../data/mockData";
import { Card, CardHeader, HealthBar, StatusBadge } from "../components/ui";

export default function Generator() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Diesel Generator</h1>
        <p className="text-sm text-slate-500 mt-0.5">Caterpillar C4.4 · 80 kW · Emergency + peak-demand backup</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Current Output", value: "0 kW", sub: "Generator in standby", color: "text-slate-400" },
          { label: "Fuel Level", value: `${powerData.generator.fuel}%`, sub: "≈ 1,044 L · ~312h runtime", color: "text-slate-800" },
          { label: "Total Runtime", value: "1,247h", sub: "Oil change due in 253h", color: "text-slate-800" },
          { label: "Health Score", value: "94%", sub: "Last service: 2025-02-20", color: "text-green-600" },
        ].map((m) => (
          <Card key={m.label} className="px-4 py-3">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Generator Status" icon={<Flame size={14} />} />
          <div className="p-4 space-y-3">
            <StatusBadge status="standby" label="Standby — Ready" />
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Engine state</span>
                <span className="font-mono font-semibold text-slate-800">Cold standby</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start readiness</span>
                <span className="text-green-600 font-semibold">Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Warm-start time</span>
                <span className="font-mono font-semibold text-slate-800">~45 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auto-start trigger</span>
                <span className="font-mono font-semibold text-slate-800">SOC &lt; 20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transfer time</span>
                <span className="font-mono font-semibold text-slate-800">&lt; 60ms (ATS)</span>
              </div>
            </div>
            <HealthBar value={94} label="Engine Health" />
            <HealthBar value={87} label="Fuel Level" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Maintenance Schedule" />
          <div className="p-4 space-y-2">
            {[
              { task: "Oil Change", due: "500h cycle · due in 253h", status: "ok" },
              { task: "Air Filter Replacement", due: "2025-05-20", status: "ok" },
              { task: "Coolant Check", due: "2025-04-01", status: "ok" },
              { task: "Fuel System Inspection", due: "Annual · 2025-09-15", status: "ok" },
              { task: "Load Bank Test", due: "2025-03-28 (scheduled)", status: "scheduled" },
              { task: "Full Service", due: "2025-05-20", status: "ok" },
            ].map((t) => (
              <div key={t.task} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-lg">
                <CheckCircle size={13} className={t.status === "scheduled" ? "text-sky-500" : "text-green-500"} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{t.task}</p>
                  <p className="text-xs text-slate-500">{t.due}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI forecast */}
      <Card className="border-sky-200 bg-sky-50">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-sky-700 mb-1">AI Energy Forecast — Generator Requirement</p>
          <p className="text-sm text-sky-800">
            Based on blizzard forecast (Fri 06:00 – Sat 18:00), generator start probability is{" "}
            <strong>84%</strong> if battery SOC pre-storm target (90%) is achieved. Warm-standby pre-positioning
            recommended (see Approval queue). Without pre-positioning, cold-start latency is 45s — acceptable for
            non-critical loads, not recommended for life-support continuity.
          </p>
        </div>
      </Card>
    </div>
  );
}
