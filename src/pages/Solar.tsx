import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Sun, AlertTriangle } from "lucide-react";
import { powerData, generateTimeSeriesData } from "../data/mockData";
import { Card, CardHeader, HealthBar, StatusBadge, StatCard, StatRow, PageHeader } from "../components/ui";

const timeData = generateTimeSeriesData(24);

export default function Solar() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Solar Generation"
        subtitle="Array A + B · 96 × 500 Wp panels · 48 kWp installed · Dual-axis tracking"
        badge={<StatusBadge status="normal" label="Operating" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Current Output"     value={powerData.solar.output} unit="kW" sub="38% capacity utilization"  color="#f59e0b" />
        <StatCard label="Installed Capacity" value={powerData.solar.capacity} unit="kWp" sub="96 × 500 Wp panels"       />
        <StatCard label="Irradiance"         value={powerData.solar.irradiance} unit="W/m²" sub="Pyranometer · calibrated" />
        <StatCard label="Today's Generation" value="124" unit="kWh" sub="Forecast: 310 kWh · blizzard Friday" />
      </div>

      <Card>
        <CardHeader title="Solar Output — 24 Hours" subtitle="kW · actual measured generation" icon={<Sun size={14} />} />
        <div className="px-4 pt-4 pb-3">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="solG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="solar" stroke="#f59e0b" fill="url(#solG)" strokeWidth={2.5} name="Solar (kW)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Array A */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Array A — South Face</p>
              <p className="text-xs text-slate-400 mt-0.5">48 × 500 Wp · Tilt 35° · Azimuth 180°</p>
            </div>
            <StatusBadge status="normal" />
          </div>
          <div className="p-5 space-y-4">
            <HealthBar value={97} label="Array Health" />
            <HealthBar value={98} label="Panel Availability (47/48)" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Output",     v: "9.8 kW" },
                { l: "Efficiency", v: "18.7%" },
                { l: "Soiling",    v: "−2.1%" },
                { l: "Last Clean", v: "2025-02-28" },
              ].map((i) => (
                <div key={i.l} className="bg-slate-50 rounded-lg px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{i.l}</p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Array B */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Array B — East/West Face</p>
              <p className="text-xs text-slate-400 mt-0.5">48 × 500 Wp · Bifacial · S/N: ARB-2022</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="normal" />
              <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                <AlertTriangle size={11} />1 panel degraded
              </span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <HealthBar value={91} label="Array Health" />
            <HealthBar value={97} label="Panel Availability (47/48)" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Output",       v: "8.6 kW" },
                { l: "Efficiency",   v: "17.9%" },
                { l: "Panel B-14",   v: "−18% output" },
                { l: "Action",       v: "Monitor" },
              ].map((i) => (
                <div key={i.l} className={`rounded-lg px-3 py-2.5 ${i.l === "Panel B-14" ? "bg-amber-50" : "bg-slate-50"}`}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{i.l}</p>
                  <p className={`text-sm font-mono font-bold mt-0.5 ${i.l === "Panel B-14" ? "text-amber-700" : "text-slate-900"}`}>{i.v}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
