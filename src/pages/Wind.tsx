import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Wind as WindIcon, AlertTriangle } from "lucide-react";
import { powerData, weatherData, generateTimeSeriesData } from "../data/mockData";
import { Card, HealthBar, StatusBadge, StatCard, PageHeader } from "../components/ui";

const timeData = generateTimeSeriesData(24);

export default function Wind() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Wind Generation"
        subtitle="Turbines T-1 and T-2 · Enercon E-33 · 30 kW each · 60 kW total capacity"
        badge={<StatusBadge status="warning" label="T-2 Advisory" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Current Output"     value={powerData.wind.output} unit="kW"  sub="52% capacity utilization"   color="#38bdf8" />
        <StatCard label="Installed Capacity" value={powerData.wind.capacity} unit="kW" sub="2 × 30 kW turbines"          />
        <StatCard label="Wind Speed"         value={weatherData.windSpeed} unit="m/s"  sub={`${weatherData.windDirection} · Gusts ${weatherData.windGust} m/s`} />
        <StatCard label="Today's Generation" value="248" unit="kWh"         sub="Forecast: 620 kWh/day"                 />
      </div>

      <Card>
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <p className="text-sm font-semibold text-slate-800">Wind Output — 24 Hours</p>
              <p className="text-xs text-slate-400 mt-0.5">kW · measured at inverter · auto-feathering at 25 m/s</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <AlertTriangle size={12} />
              Wind advisory: gusts 28 m/s expected 14:00
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="windG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="wind" stroke="#38bdf8" fill="url(#windG)" strokeWidth={2.5} name="Wind (kW)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* T-1 */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Turbine T-1</p>
              <p className="text-xs text-slate-400 mt-0.5">S/N: TW1-2021-001 · Hub height 30m</p>
            </div>
            <StatusBadge status="normal" />
          </div>
          <div className="p-5 space-y-4">
            <HealthBar value={98} label="Health Score" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Output",       v: "16.1 kW" },
                { l: "Rotor RPM",    v: "142 rpm" },
                { l: "Vibration",    v: "0.21 mm/s" },
                { l: "Bearing temp", v: "42°C" },
                { l: "Pitch angle",  v: "12.4°" },
                { l: "Yaw offset",   v: "1.2°" },
              ].map((i) => (
                <div key={i.l} className="bg-slate-50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{i.l}</p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* T-2 */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Turbine T-2</p>
              <p className="text-xs text-slate-400 mt-0.5">S/N: TW2-2021-002 · Hub height 30m</p>
            </div>
            <StatusBadge status="warning" />
          </div>
          <div className="p-5 space-y-4">
            <HealthBar value={89} label="Health Score" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Output",       v: "15.1 kW",    warn: false },
                { l: "Rotor RPM",    v: "138 rpm",    warn: false },
                { l: "Vibration",    v: "0.87 mm/s ⚠", warn: true },
                { l: "Bearing temp", v: "51°C ⚠",     warn: true },
                { l: "Pitch angle",  v: "12.1°",      warn: false },
                { l: "Predicted",    v: "~45d bearing", warn: true },
              ].map((i) => (
                <div key={i.l} className={`rounded-lg px-3 py-2.5 ${i.warn ? "bg-amber-50" : "bg-slate-50"}`}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{i.l}</p>
                  <p className={`text-sm font-mono font-bold mt-0.5 ${i.warn ? "text-amber-700" : "text-slate-900"}`}>{i.v}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 leading-relaxed">
              <span className="font-bold">AI Recommendation:</span> Schedule gearbox bearing inspection within 35 days. Current power output unaffected. Risk escalates if vibration exceeds 1.0 mm/s. Confidence: 89%.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
