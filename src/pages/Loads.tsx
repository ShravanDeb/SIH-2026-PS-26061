import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap } from "lucide-react";
import { loadsData } from "../data/mockData";
import { Card, CardHeader } from "../components/ui";

export default function Loads() {
  const total = loadsData.reduce((a, b) => a + b.value, 0);
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Station Loads</h1>
        <p className="text-sm text-slate-500 mt-0.5">All electrical consumers by category and priority</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Total Consumption", value: `${total.toFixed(1)} kW`, sub: "All categories" },
          { label: "Critical Loads", value: `${loadsData.filter((_,i)=>i<2).reduce((a,b)=>a+b.value,0).toFixed(1)} kW`, sub: "Life support + Science" },
          { label: "Flexible Loads", value: `${loadsData[6].value} kW`, sub: "Deferrable on AI request" },
        ].map((m) => (
          <Card key={m.label} className="px-4 py-3">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{m.label}</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Load Distribution" subtitle="By category" icon={<Zap size={14} />} />
          <div className="p-4 flex items-center gap-4">
            <PieChart width={140} height={140}>
              <Pie data={loadsData} cx={65} cy={65} innerRadius={38} outerRadius={65} dataKey="value" strokeWidth={0}>
                {loadsData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-1.5">
              {loadsData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-600 flex-1">{d.name}</span>
                  <span className="text-xs font-mono font-semibold text-slate-800">{d.value} kW</span>
                  <span className="text-xs text-slate-400">{((d.value / total) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Load by Priority" subtitle="Higher priority = cannot be shed" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={loadsData} layout="vertical" margin={{ left: 8, right: 20, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} width={110} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v: any) => [`${v} kW`]} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {loadsData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Load detail table */}
      <Card>
        <CardHeader title="Load Detail" subtitle="All consumers with shed priority" />
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Priority</th>
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Category</th>
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Power</th>
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Share</th>
              <th className="px-4 py-2.5 text-left text-slate-500 font-semibold">Shedding</th>
            </tr>
          </thead>
          <tbody>
            {loadsData.map((d, i) => (
              <tr key={d.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-500">P{i}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="font-semibold text-slate-800">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-800">{d.value} kW</td>
                <td className="px-4 py-3 font-mono text-slate-600">{((d.value / total) * 100).toFixed(1)}%</td>
                <td className="px-4 py-3">
                  {i === 0 ? (
                    <span className="text-red-600 font-semibold">Never shed</span>
                  ) : i <= 2 ? (
                    <span className="text-amber-600 font-semibold">Emergency only (L4)</span>
                  ) : i <= 4 ? (
                    <span className="text-slate-600">L3 approval required</span>
                  ) : (
                    <span className="text-green-600">AI may reduce (L1)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
