import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Cloud, Wind, Thermometer, Zap } from "lucide-react";
import { weatherData, generateTimeSeriesData } from "../data/mockData";
import { Card, CardHeader, StatCard, PageHeader } from "../components/ui";

const timeData = generateTimeSeriesData(24);

export default function Weather() {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <PageHeader
        title="Weather"
        subtitle="Meteorological station · Longyearbyen NWP · 14-sensor array · Updated 09:00 UTC"
      />

      {/* Alert banner */}
      {weatherData.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-3.5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Weather Advisory</p>
            <p className="text-sm text-amber-700 mt-0.5">{weatherData.alerts[0].message}</p>
          </div>
        </div>
      )}

      {/* Current conditions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Temperature"     value={`${weatherData.temperature}°C`} sub={`Feels ${weatherData.feelsLike}°C · ${weatherData.condition}`}   />
        <StatCard label="Wind"            value={`${weatherData.windSpeed} m/s`} sub={`${weatherData.windDirection} · Gusts ${weatherData.windGust} m/s`} />
        <StatCard label="Solar Radiation" value={`${weatherData.solarRadiation}`} unit="W/m²" sub="Pyranometer · direct + diffuse"                          />
        <StatCard label="Visibility"      value={`${weatherData.visibility} km`} sub={`Snow depth ${weatherData.snowDepth} cm · Humidity ${weatherData.humidity}%`} />
      </div>

      {/* 5-day forecast */}
      <Card>
        <CardHeader title="5-Day Forecast" subtitle="NWP model · hourly resolution · AI energy impact analysis" icon={<Cloud size={14} />} />
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2 mb-4">
            {weatherData.forecast.map((f) => {
              const blizzard = f.condition.toLowerCase().includes("blizzard");
              const snow     = f.condition.toLowerCase().includes("snow");
              return (
                <div
                  key={f.day}
                  className={`rounded-xl px-3 py-4 text-center border ${
                    blizzard ? "bg-red-50 border-red-200" :
                    snow     ? "bg-orange-50 border-orange-200" :
                    f.condition === "Overcast" ? "bg-slate-100 border-slate-200" :
                    "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-700">{f.day}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">{f.condition}</p>
                  <div className="flex justify-center gap-1.5 mt-2">
                    <span className="text-base font-bold font-mono text-slate-800">{f.high}°</span>
                    <span className="text-base font-mono text-slate-400">{f.low}°</span>
                  </div>
                  <p className="text-xs text-sky-600 mt-1">↑ {f.wind} m/s</p>
                  <p className="text-xs text-amber-600 mt-0.5">{f.solar} W/m²</p>
                  {blizzard && <p className="text-[10px] text-red-600 font-bold mt-1.5 bg-red-100 rounded px-1">BLIZZARD</p>}
                </div>
              );
            })}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-red-700 mb-1">AI Energy Impact — Blizzard Forecast Fri–Sat</p>
            <p className="text-xs text-red-600 leading-relaxed">
              Friday 06:00 – Saturday 18:00: solar generation drops to &lt;5% (irradiance &lt;20 W/m²). Wind uncertain — auto-feathering likely above 25 m/s. Battery pre-charge to 90% SOC and generator warm-standby pre-positioning are approved or pending approval. See AI Recommendations for full pre-storm plan.
            </p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: "Wind Speed — 24 Hours", key: "windSpeed", color: "#38bdf8", unit: "m/s", xform: (d: any) => ({ ...d, windSpeed: +(d.wind * 0.28).toFixed(1) }) },
          { title: "Solar Irradiance — 24 Hours", key: "irradiance", color: "#f59e0b", unit: "W/m²", xform: (d: any) => ({ ...d, irradiance: Math.round(d.solar * 17) }) },
        ].map(({ title, key, color, unit, xform }) => (
          <Card key={title}>
            <CardHeader title={title} subtitle={unit} />
            <div className="px-4 pt-3 pb-4">
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={timeData.map(xform)} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`g_${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Area type="monotone" dataKey={key} stroke={color} fill={`url(#g_${key})`} strokeWidth={2} name={unit} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
