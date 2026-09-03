import { Radio, Cpu, CheckCircle, AlertTriangle } from "lucide-react";
import { communicationData } from "../data/mockData";
import { Card, CardHeader, HealthBar } from "../components/ui";

export default function Communication() {
  const ec = communicationData.edgeComputing;
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Communication & Edge Computing</h1>
        <p className="text-sm text-slate-500 mt-0.5">All comm links · on-site edge processing · data sync status</p>
      </div>

      {/* Comm links */}
      <Card>
        <CardHeader title="Communication Links" subtitle="Active links and status" icon={<Radio size={14} />} />
        <div className="p-4 space-y-3">
          {communicationData.links.map((link) => (
            <div key={link.name} className="flex items-center gap-4 px-3 py-3 bg-slate-50 rounded-lg">
              <div className={`w-2.5 h-2.5 rounded-full ${link.status === "active" ? "bg-green-500" : "bg-slate-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{link.name}</p>
                <p className="text-xs text-slate-500">Uptime: {link.uptime}%</p>
              </div>
              {link.bandwidth !== null && (
                <div className="text-right">
                  <p className="text-xs font-mono font-semibold text-slate-800">{link.bandwidth} Mbps</p>
                  <p className="text-xs text-slate-500">Latency: {link.latency} ms</p>
                </div>
              )}
              <div>
                {link.status === "active" ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edge computing */}
      <Card>
        <CardHeader title="Edge Computing Node" subtitle="On-site AI inference and data processing" icon={<Cpu size={14} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { label: "CPU Load", value: `${ec.cpuLoad}%`, color: "text-slate-800" },
              { label: "Memory Used", value: `${ec.memoryUsed}%`, color: "text-slate-800" },
              { label: "Storage Used", value: `${ec.storageUsed}%`, color: "text-amber-600" },
              { label: "Pending Sync", value: ec.pendingSync, color: "text-slate-800" },
            ].map((m) => (
              <div key={m.label} className="bg-slate-50 rounded px-3 py-2.5">
                <p className="text-slate-500">{m.label}</p>
                <p className={`text-base font-bold font-mono mt-0.5 ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
          <HealthBar value={100 - ec.cpuLoad} label="CPU Headroom" />
          <HealthBar value={100 - ec.memoryUsed} label="Memory Headroom" />
          <HealthBar value={100 - ec.storageUsed} label="Storage Headroom" />
          <div className="text-xs text-slate-500">Last sync to cloud: {ec.lastSync}</div>
        </div>
      </Card>

      {/* Data flows */}
      <Card>
        <CardHeader title="Data Flows" subtitle="What data is being transmitted" />
        <div className="p-4 space-y-2">
          {[
            { name: "Weather telemetry", dest: "NMI Norway", freq: "Every 10 min", size: "~2 KB", status: "active" },
            { name: "Energy monitoring data", dest: "SIAPS Cloud", freq: "Every 1 min", size: "~8 KB", status: "active" },
            { name: "Scientific instrument data", dest: "Research archive", freq: "Every 6h", size: "~1.2 GB", status: "active" },
            { name: "AI decision logs", dest: "SIAPS Cloud", freq: "Continuous", size: "~50 KB/h", status: "active" },
            { name: "Safety telemetry", dest: "SIAPS + Iridium", freq: "Every 30 sec", size: "~0.5 KB", status: "active" },
            { name: "High-res sensor archive", dest: "Cloud storage", freq: "Daily", size: "~2.3 GB", status: "queued" },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${f.status === "active" ? "bg-green-500" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-500">→ {f.dest} · {f.freq}</p>
              </div>
              <p className="text-xs font-mono text-slate-600">{f.size}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
