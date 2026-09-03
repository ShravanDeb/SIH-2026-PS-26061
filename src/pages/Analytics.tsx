import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, StatCard, PageHeader } from "../components/ui";

const monthlyData = [
  { month: "Sep",  solar: 1840, wind: 4200, gen: 620,  consumption: 6200, renewable: 97 },
  { month: "Oct",  solar: 1200, wind: 5100, gen: 820,  consumption: 6540, renewable: 87 },
  { month: "Nov",  solar: 320,  wind: 5800, gen: 1240, consumption: 6840, renewable: 82 },
  { month: "Dec",  solar: 40,   wind: 6100, gen: 1640, consumption: 7100, renewable: 77 },
  { month: "Jan",  solar: 60,   wind: 5900, gen: 1520, consumption: 6980, renewable: 78 },
  { month: "Feb",  solar: 480,  wind: 5400, gen: 940,  consumption: 6620, renewable: 86 },
  { month: "Mar",  solar: 1640, wind: 4800, gen: 440,  consumption: 6400, renewable: 93 },
];

const batteryData = [
  { week: "W38", avgSoc: 72, cycles: 4,  health: 96.5 },
  { week: "W39", avgSoc: 75, cycles: 5,  health: 96.4 },
  { week: "W40", avgSoc: 69, cycles: 6,  health: 96.3 },
  { week: "W42", avgSoc: 78, cycles: 4,  health: 96.2 },
  { week: "W43", avgSoc: 74, cycles: 5,  health: 96.1 },
  { week: "W44", avgSoc: 71, cycles: 7,  health: 96.0 },
  { week: "W45", avgSoc: 78, cycles: 4,  health: 96.0 },
];

const aiDecisionData = [
  { month: "Sep", autonomous: 842, approved: 38, rejected: 6 },
  { month: "Oct", autonomous: 901, approved: 44, rejected: 8 },
  { month: "Nov", autonomous: 978, approved: 51, rejected: 11 },
  { month: "Dec", autonomous: 1020, approved: 58, rejected: 9 },
  { month: "Jan", autonomous: 995, approved: 52, rejected: 7 },
  { month: "Feb", autonomous: 890, approved: 47, rejected: 10 },
  { month: "Mar", autonomous: 847, approved: 39, rejected: 5 },
];

const CS = { fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" };

export default function Analytics() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-5">
      <PageHeader
        title="Historical Analytics"
        subtitle="7-month operational history — generation, consumption, battery, renewables, AI decisions"
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Avg Renewable Share"    value="89.4%"     sub="Sep 2024 – Mar 2025"        color="#10b981" />
        <StatCard label="Total Generation"       value="41,020"    unit="kWh"   sub="7-month period"               />
        <StatCard label="Generator Usage"        value="7,220"     unit="kWh"   sub="10.6% of total"               />
        <StatCard label="Avg Daily Consumption"  value="218"       unit="kWh/d" sub="All loads combined"            />
      </div>

      {/* Monthly stacked generation */}
      <Card>
        <CardHeader title="Monthly Generation by Source" subtitle="kWh · Solar / Wind / Generator — stacked" />
        <div className="px-4 pt-4 pb-3">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={CS} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="solar" stackId="a" fill="#fbbf24" name="Solar (kWh)"     radius={[0,0,0,0]} />
              <Bar dataKey="wind"  stackId="a" fill="#38bdf8" name="Wind (kWh)"                         />
              <Bar dataKey="gen"   stackId="a" fill="#94a3b8" name="Generator (kWh)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Renewable % + Gen vs cons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Renewable Share Trend" subtitle="Monthly % · target ≥ 80%" />
          <div className="px-4 pt-3 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CS} formatter={(v: any) => [`${v}%`, "Renewable"]} />
                <Line type="monotone" dataKey="renewable" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Renewable %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Generation vs. Consumption" subtitle="kWh monthly comparison" />
          <div className="px-4 pt-3 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData.map(d => ({ ...d, gen_total: d.solar + d.wind + d.gen }))} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGen"  x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aCons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f87171" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CS} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="gen_total"   stroke="#0ea5e9" fill="url(#aGen)"  strokeWidth={2}   name="Generation (kWh)" dot={false} />
                <Area type="monotone" dataKey="consumption" stroke="#f87171" fill="url(#aCons)" strokeWidth={1.5} name="Consumption (kWh)" dot={false} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Battery + AI decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Battery Avg SOC by Week" subtitle="% · 7-week rolling" />
          <div className="px-4 pt-3 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={batteryData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CS} formatter={(v: any) => [`${v}%`]} />
                <Bar dataKey="avgSoc" fill="#10b981" radius={[3, 3, 0, 0]} name="Avg SOC %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="AI Decisions by Month" subtitle="Autonomous · Approved · Rejected" />
          <div className="px-4 pt-3 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={aiDecisionData} margin={{ left: -22, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CS} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="autonomous" fill="#0ea5e9" radius={[2,2,0,0]} name="Autonomous" />
                <Bar dataKey="approved"   fill="#10b981" radius={[2,2,0,0]} name="Approved" />
                <Bar dataKey="rejected"   fill="#f87171" radius={[2,2,0,0]} name="Rejected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
