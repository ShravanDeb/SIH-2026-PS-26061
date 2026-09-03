import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Sun, Wind, Battery, Flame, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { powerData, loadsData, generateTimeSeriesData } from "../data/mockData";
import { Card, CardHeader, HealthBar, StatCard, StatRow } from "../components/ui";

const timeData = generateTimeSeriesData(24);

export default function EnergyManagement() {
  const surplus = (powerData.totalGeneration - powerData.totalConsumption).toFixed(1);
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Energy Management</h1>
          <p className="text-sm text-slate-500 mt-1">Complete power overview — real-time, historical, and forecast</p>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
          <TrendingUp size={12} />
          Surplus +{surplus} kW → battery charging
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Solar Output"    value={powerData.solar.output}     unit="kW" sub={`${powerData.solar.capacity} kW capacity · 38% util.`}    color="#f59e0b" />
        <StatCard label="Wind Output"     value={powerData.wind.output}      unit="kW" sub={`${powerData.wind.capacity} kW capacity · 52% util.`}     color="#38bdf8" />
        <StatCard label="Total Renewable" value={powerData.totalGeneration}  unit="kW" sub="100% renewable share — generator idle"                    color="#10b981" />
        <StatCard label="Net Balance"     value={`+${surplus}`}              unit="kW" sub="Surplus being stored in battery bank"                     color="#10b981" trend="up" />
      </div>

      {/* Power Flow */}
      <Card>
        <CardHeader title="Power Flow" subtitle="Real-time system topology — generation → storage → loads" icon={<Zap size={14} />} />
        <div className="p-6">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Sources column */}
            <div className="flex flex-col gap-2.5">
              {[
                { icon: Sun,   label: "Solar", value: powerData.solar.output,     color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
                { icon: Wind,  label: "Wind",  value: powerData.wind.output,      color: "#38bdf8", bg: "bg-sky-50",   border: "border-sky-200",   text: "text-sky-700" },
                { icon: Flame, label: "Gen",   value: powerData.generator.output, color: "#94a3b8", bg: "bg-slate-50", border: "border-slate-200",  text: "text-slate-500" },
              ].map(({ icon: Icon, label, value, color, bg, border, text }) => (
                <div key={label} className={`flex items-center gap-3 ${bg} border ${border} rounded-xl px-4 py-3 w-44`}>
                  <Icon size={16} style={{ color }} />
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={`text-lg font-bold font-mono ${text}`}>{value} <span className="text-xs font-normal">kW</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Arrow + total */}
            <div className="flex flex-col items-center gap-1">
              <div className="h-px w-10 bg-slate-200" />
              <ArrowRight size={18} className="text-slate-400" />
              <p className="text-xs font-mono text-slate-400">49.6 kW</p>
            </div>

            {/* Battery */}
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl px-6 py-5 text-center w-36">
              <Battery size={20} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-emerald-700">Battery</p>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-1">{powerData.battery.soc}%</p>
              <p className="text-xs text-emerald-600 mt-1">+2.3 kW charging</p>
              <p className="text-xs text-emerald-500 mt-0.5">{powerData.battery.remaining} kWh</p>
            </div>

            {/* Arrow + total */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight size={18} className="text-slate-400" />
              <p className="text-xs font-mono text-slate-400">47.3 kW</p>
            </div>

            {/* Loads */}
            <div className="flex flex-col gap-1.5">
              {loadsData.map((l) => (
                <div key={l.name} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-48">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                  <p className="text-xs text-slate-600 flex-1 truncate">{l.name}</p>
                  <p className="text-xs font-mono font-semibold text-slate-800">{l.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 24h charts */}
      <Card>
        <CardHeader title="24-Hour Generation & Consumption" subtitle="kW · actual measured values" />
        <div className="px-4 pt-4 pb-3">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={timeData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
              <defs>
                {[{ id: "as", c: "#f59e0b" }, { id: "aw", c: "#38bdf8" }, { id: "ac", c: "#ef4444" }].map(({ id, c }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="solar"       name="Solar (kW)"       stroke="#f59e0b" fill="url(#as)" strokeWidth={2}   dot={false} />
              <Area type="monotone" dataKey="wind"        name="Wind (kW)"        stroke="#38bdf8" fill="url(#aw)" strokeWidth={2}   dot={false} />
              <Area type="monotone" dataKey="consumption" name="Consumption (kW)" stroke="#ef4444" fill="url(#ac)" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Battery SOC + Net balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Battery SOC — 24 Hours" subtitle="State of charge %" />
          <div className="px-4 pt-3 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timeData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`, "SOC"]} />
                <ReferenceLine y={20} stroke="#fca5a5" strokeDasharray="4 2" />
                <ReferenceLine y={90} stroke="#86efac" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="battery" stroke="#10b981" strokeWidth={2} dot={false} name="SOC %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Net Energy Balance" subtitle="Generation minus consumption per hour (kW)" />
          <div className="px-4 pt-3 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={timeData.map((d) => ({ ...d, net: +(d.solar + d.wind - d.consumption).toFixed(1) }))}
                margin={{ left: -22, right: 8, top: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <ReferenceLine y={0} stroke="#cbd5e1" />
                <Bar dataKey="net" name="Net (kW)" radius={[2, 2, 0, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
