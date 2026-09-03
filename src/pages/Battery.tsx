import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Battery as BatteryIcon, TrendingUp, Cpu } from "lucide-react";
import { generateTimeSeriesData } from "../data/mockData";
import { Card, CardHeader, HealthBar, StatusBadge, StatCard, StatRow, PageHeader } from "../components/ui";
import { useLiveStationTelemetry } from "../services/stationApi";

const timeData = generateTimeSeriesData(24);

export default function Battery() {
  const { power, isBackendConnected } = useLiveStationTelemetry();
  const b = power.battery;
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Battery Storage"
        subtitle="Rack 1–4 · LiFePO₄ · 400 kWh nominal · BMS v3.2 · Bharati Antarctic Station"
        badge={<StatusBadge status={b.status as any} label={`${b.status.toUpperCase()} (${power.netBalance >= 0 ? "+" : ""}${power.netBalance.toFixed(1)} kW)`} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="State of Charge" value={`${b.soc}%`}        sub={`${b.remaining} kWh available (${b.status})`} color="#10b981" trend="up"  />
        <StatCard label="Est. Runtime"    value={`${b.runtime}h`}    sub={`At current ${power.totalConsumption.toFixed(1)} kW consumption`} />
        <StatCard label="Battery Health"  value={`${b.health}%`}     sub="Cell degradation nominal (4%)" color="#10b981" />
        <StatCard label="Temperature"     value={`${b.temperature}°C`} sub="Core thermal envelope: 15–25°C" />
      </div>

      {/* SOC history */}
      <Card>
        <CardHeader
          title="SOC History — 24 Hours"
          subtitle="State of charge % with reference lines for critical and target thresholds"
          icon={<BatteryIcon size={14} />}
          action={
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp size={12} />
              Charging to 90% target
            </div>
          }
        />
        <div className="px-4 pt-4 pb-3">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={timeData} margin={{ left: -22, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="socG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`, "SOC"]} />
              <ReferenceLine y={20} stroke="#fca5a5" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "Critical 20%", fontSize: 9, fill: "#ef4444", position: "insideTopRight" }} />
              <ReferenceLine y={90} stroke="#6ee7b7" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "Target 90%",   fontSize: 9, fill: "#059669", position: "insideTopRight" }} />
              <Area type="monotone" dataKey="battery" stroke="#10b981" fill="url(#socG)" strokeWidth={2.5} name="SOC %" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Parameters + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Electrical Parameters" subtitle="Real-time BMS measurements" />
          <div className="p-5 grid grid-cols-2 gap-3">
            {[
              { l: "Pack Voltage",     v: `${b.voltage} V`,       sub: "Nominal 51.2 V" },
              { l: "Charge Current",   v: `${Math.abs(b.current)} A`, sub: "Incoming (charging)" },
              { l: "Charge Power",     v: `${Math.abs(b.power).toFixed(1)} kW`, sub: "0.006C rate — optimal" },
              { l: "Nominal Capacity", v: `${b.capacity} kWh`,    sub: "Design spec" },
              { l: "Cell Balance",     v: "±12 mV",               sub: "Within ±20 mV spec" },
              { l: "Cycle Count",      v: "847 cycles",           sub: "LiFePO₄ lifetime ~4000" },
            ].map((p) => (
              <div key={p.l} className="bg-slate-50 rounded-xl px-3.5 py-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{p.l}</p>
                <p className="text-base font-bold font-mono text-slate-900 mt-0.5">{p.v}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{p.sub}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Health & Degradation Analysis" />
          <div className="p-5 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-2">
              <p className="text-xs font-bold text-emerald-700 mb-1">AI Charging Forecast</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Pre-storm charging cycle active. Target: 90% SOC by 11:30 UTC. At current +2.3 kW charge rate,
                remaining charge time ≈ 2h 10min. Projected autonomous runtime at 90% SOC: 19.8h.
              </p>
            </div>
            <HealthBar value={b.health} label="Overall Health" />
            <HealthBar value={100 - b.degradation} label="Capacity Retention" />
            <HealthBar value={98} label="Cell Balance Score" />
            <HealthBar value={94} label="Thermal Management" />
            <div className="pt-1 space-y-0">
              <StatRow label="Degradation rate"     value="0.4% / 100 cycles" />
              <StatRow label="Projected 5yr capacity" value="82% retained" />
              <StatRow label="Next BMS service"     value="2025-06-01" />
            </div>
          </div>
        </Card>
      </div>

      {/* Rack status */}
      <Card>
        <CardHeader title="Individual Rack Status" subtitle="4 × 100 kWh racks · balanced configuration" />
        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { rack: 1, health: 96, temp: 18.2, cells: 180, voltage: 54.1 },
            { rack: 2, health: 97, temp: 18.6, cells: 180, voltage: 54.3 },
            { rack: 3, health: 95, temp: 18.1, cells: 180, voltage: 54.0 },
            { rack: 4, health: 96, temp: 18.7, cells: 180, voltage: 54.2 },
          ].map((r) => (
            <div key={r.rack} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-700">Rack {r.rack}</p>
                <span className="text-xs font-semibold text-emerald-600">{r.health}%</span>
              </div>
              <HealthBar value={r.health} />
              <div className="mt-3 space-y-0">
                <StatRow label="Temperature" value={`${r.temp}°C`} />
                <StatRow label="Voltage"     value={`${r.voltage} V`} />
                <StatRow label="Cells"       value={`${r.cells} · OK`} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
