import { Sun, Wind, Battery, Flame, Zap, Cloud, ArrowDown, CheckCircle, AlertTriangle } from "lucide-react";
import { powerData, weatherData } from "../data/mockData";
import { Card, CardHeader, HealthBar, StatRow, PageHeader } from "../components/ui";

type BlockStatus = "ok" | "warn" | "off";

function SystemBlock({
  title, icon, status, metrics, accentColor, wide,
}: {
  title: string; icon: React.ReactNode; status: BlockStatus;
  metrics: { label: string; value: string; warn?: boolean }[];
  accentColor: string; wide?: boolean;
}) {
  const borderClass =
    status === "ok"   ? "border-slate-200" :
    status === "warn" ? "border-amber-300 bg-amber-50/50" :
    "border-slate-200 opacity-60";

  return (
    <div className={`bg-white border-2 rounded-xl p-4 ${borderClass} ${wide ? "col-span-2" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accentColor + "18" }}>
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{title}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${
          status === "ok" ? "text-emerald-600" : status === "warn" ? "text-amber-600" : "text-slate-400"
        }`}>
          {status === "ok" ? <CheckCircle size={12} /> : status === "warn" ? <AlertTriangle size={12} /> : null}
          {status === "ok" ? "Normal" : status === "warn" ? "Warning" : "Standby"}
        </div>
      </div>
      {/* Metrics */}
      <div className="space-y-0">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
            <span className="text-xs text-slate-400">{m.label}</span>
            <span className={`text-xs font-mono font-semibold ${m.warn ? "text-amber-600" : "text-slate-800"}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="w-px h-4 bg-slate-200" />
      <ArrowDown size={16} className="text-slate-400" />
      <span className="text-[10px] text-slate-400 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded">{label}</span>
      <div className="w-px h-4 bg-slate-200" />
    </div>
  );
}

export default function DigitalTwin() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Digital Twin"
        subtitle="Real-time synchronized system model — station state updated every 10 seconds"
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
            <CheckCircle size={12} />
            Live · 99.1% accuracy
          </div>
        }
      />

      <Card>
        <CardHeader title="Station System Model" subtitle="Generation → Storage → Distribution → Environment" icon={<Zap size={14} />} />
        <div className="p-6">
          {/* Tier 1: Generation */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Generation</p>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <SystemBlock
              title="Solar Arrays"
              icon={<Sun size={16} />}
              status="ok"
              accentColor="#f59e0b"
              metrics={[
                { label: "Output",     value: `${powerData.solar.output} kW` },
                { label: "Capacity",   value: `${powerData.solar.capacity} kW` },
                { label: "Irradiance", value: `${powerData.solar.irradiance} W/m²` },
                { label: "Health",     value: "94%" },
              ]}
            />
            <SystemBlock
              title="Wind Turbines"
              icon={<Wind size={16} />}
              status="warn"
              accentColor="#38bdf8"
              metrics={[
                { label: "Output",    value: `${powerData.wind.output} kW` },
                { label: "Wind",      value: `${weatherData.windSpeed} m/s` },
                { label: "T-1 health", value: "98%" },
                { label: "T-2 health", value: "89% ⚠", warn: true },
              ]}
            />
            <SystemBlock
              title="Generator G-1"
              icon={<Flame size={16} />}
              status="off"
              accentColor="#94a3b8"
              metrics={[
                { label: "State",  value: "Cold standby" },
                { label: "Fuel",   value: `${powerData.generator.fuel}%` },
                { label: "Health", value: "94%" },
                { label: "Start",  value: "~45s" },
              ]}
            />
          </div>

          <FlowArrow label="49.6 kW total generation" />

          {/* Tier 2: Storage */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Storage</p>
          <div className="max-w-sm mx-auto mb-2">
            <SystemBlock
              title="Battery Bank (Racks 1–4)"
              icon={<Battery size={16} />}
              status="ok"
              accentColor="#10b981"
              metrics={[
                { label: "SOC",       value: `${powerData.battery.soc}%` },
                { label: "Available", value: `${powerData.battery.remaining} kWh` },
                { label: "Runtime",   value: `${powerData.battery.runtime}h` },
                { label: "Health",    value: `${powerData.battery.health}%` },
                { label: "Status",    value: "Charging +2.3 kW" },
              ]}
            />
          </div>

          <FlowArrow label="47.3 kW to station loads" />

          {/* Tier 3: Loads */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Station Loads</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[
              { name: "Life-Support",    kw: "12.8", color: "#ef4444" },
              { name: "Scientific",      kw: "11.4", color: "#8b5cf6" },
              { name: "Heating/HVAC",    kw: "9.6",  color: "#f97316" },
              { name: "Communication",   kw: "2.1",  color: "#0ea5e9" },
              { name: "Computing",       kw: "5.8",  color: "#06b6d4" },
              { name: "Appliances",      kw: "3.9",  color: "#64748b" },
              { name: "Flexible Loads",  kw: "1.7",  color: "#94a3b8" },
            ].map((l) => (
              <div key={l.name} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ background: l.color }} />
                <p className="text-[11px] font-semibold text-slate-700 leading-tight">{l.name}</p>
                <p className="text-sm font-bold font-mono text-slate-900 mt-1">{l.kw} <span className="text-[10px] font-normal text-slate-400">kW</span></p>
              </div>
            ))}
          </div>

          {/* Tier 4: Environment */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Environment</p>
            <div className="max-w-lg mx-auto">
              <SystemBlock
                title="Meteorological Station"
                icon={<Cloud size={16} />}
                status="ok"
                accentColor="#64748b"
                metrics={[
                  { label: "Temperature",  value: `${weatherData.temperature}°C (feels ${weatherData.feelsLike}°C)` },
                  { label: "Wind",         value: `${weatherData.windSpeed} m/s ${weatherData.windDirection} · Gusts ${weatherData.windGust} m/s` },
                  { label: "Irradiance",   value: `${weatherData.solarRadiation} W/m²` },
                  { label: "Visibility",   value: `${weatherData.visibility} km` },
                  { label: "Forecast",     value: "⚠ Blizzard Fri–Sat — pre-storm actions pending approval", warn: true },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Sync status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Data Latency",      value: "< 2s",    ok: true },
          { label: "Sensor Coverage",   value: "97.4%",   ok: true },
          { label: "Model Accuracy",    value: "99.1%",   ok: true },
          { label: "Last Full Sync",    value: "09:42:07", ok: true },
        ].map((m) => (
          <Card key={m.label} className="px-4 py-3">
            <p className="text-xs text-slate-500">{m.label}</p>
            <p className="text-base font-bold font-mono text-slate-900 mt-1">{m.value}</p>
            <CheckCircle size={12} className="text-emerald-500 mt-1.5" />
          </Card>
        ))}
      </div>
    </div>
  );
}
