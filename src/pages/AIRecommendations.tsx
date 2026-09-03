import {
  Bot, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp,
  Info, Zap, Battery, Flame, ThermometerSun, ShieldCheck
} from "lucide-react";
import { aiRecommendations as defaultRecommendations } from "../data/mockData";
import { Card, CardHeader, LevelBadge, PageHeader, StatCard } from "../components/ui";
import { useState, useEffect } from "react";
import { fetchLiveRecommendations, submitRecommendationAction } from "../services/stationApi";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  load_shift:     { label: "Load Shift",      color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Zap },
  battery:        { label: "Battery",         color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: Battery },
  generator:      { label: "Generator",       color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Flame },
  load_reduction: { label: "Load Reduction",  color: "text-teal-700",   bg: "bg-teal-50 border-teal-200",     icon: ThermometerSun },
};

const LEVEL_DESCRIPTIONS = [
  { l: 0, title: "L0 — Information",      desc: "Sensor telemetry, weather syncs, scheduled health checks. Logged automatically." },
  { l: 1, title: "L1 — Autonomous",       desc: "Low-risk optimizations. AI executes without operator approval." },
  { l: 2, title: "L2 — Approval",         desc: "Moderate impact. Single authorized operator must approve." },
  { l: 3, title: "L3 — Two-Person Auth",  desc: "High impact. Two independent authorized persons required." },
  { l: 4, title: "L4 — Emergency",        desc: "Predefined emergency procedure. Activates on trigger condition." },
];

export default function AIRecommendations({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>(defaultRecommendations);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveRecommendations().then(data => {
      if (data && data.length) setRecommendations(data);
    });
    const interval = setInterval(() => {
      fetchLiveRecommendations().then(data => {
        if (data && data.length) setRecommendations(data);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (recId: string, decision: string) => {
    const res = await submitRecommendationAction(recId, decision, "1234");
    if (res.success) {
      setActionNotice(`Action '${decision.toUpperCase()}' dispatched and verified in SCADA audit log!`);
      setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: decision } : r));
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const pending  = recommendations.filter((r) => r.status === "awaiting_approval");
  const resolved = recommendations.filter((r) => r.status !== "awaiting_approval");

  const approved = recommendations.filter(r => r.status === "approved").length;
  const rejected = recommendations.filter(r => r.status === "rejected").length;
  const avgConf  = Math.round(recommendations.reduce((s, r) => s + r.confidence, 0) / (recommendations.length || 1));

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-5">
      <PageHeader
        title="AI Recommendations"
        subtitle={`Pre-storm planning active · ${recommendations.length} recommendations since 06:00 · ${pending.length} awaiting approval`}
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-lg text-xs font-semibold text-sky-700">
            <Bot size={12} />
            Active · 43 decisions today
          </div>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pending Approval"  value={pending.length}  sub="Require human decision" color={pending.length > 0 ? "#d97706" : "#10b981"} />
        <StatCard label="Approved Today"    value={approved}        sub="AI actions authorized" color="#10b981" />
        <StatCard label="Rejected Today"    value={rejected}        sub="Operator override" color={rejected > 0 ? "#ef4444" : "#64748b"} />
        <StatCard label="Avg Confidence"    value={`${avgConf}%`}   sub="Across all recommendations" color="#0ea5e9" />
      </div>

      {/* Approval framework */}
      <Card>
        <CardHeader title="Approval Level Framework" subtitle="How AI actions are authorized and controlled" icon={<Info size={14} />} />
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-2">
          {LEVEL_DESCRIPTIONS.map(({ l, title, desc }) => {
            const colors = [
              "border-slate-200 bg-slate-50",
              "border-emerald-200 bg-emerald-50",
              "border-amber-200 bg-amber-50",
              "border-red-200 bg-red-50",
              "border-purple-200 bg-purple-50",
            ];
            return (
              <div key={l} className={`border rounded-xl p-3 ${colors[l]}`}>
                <LevelBadge level={l} />
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-700">Awaiting Approval ({pending.length})</h2>
          </div>
          <div className="space-y-3">
            {pending.map((r) => {
              const cat = CATEGORY_CONFIG[r.category];
              const CatIcon = cat?.icon;
              const isOpen = expanded === r.id;
              return (
                <Card key={r.id} className="border-amber-200">
                  <button
                    className="w-full px-5 py-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <LevelBadge level={r.level} />
                          {cat && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${cat.bg} ${cat.color}`}>
                              <CatIcon size={10} />
                              {cat.label}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">{r.createdAt}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{r.title}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.reason}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Confidence</p>
                          <p className="text-lg font-bold font-mono text-slate-800">{r.confidence}%</p>
                        </div>
                        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-amber-100 px-5 pb-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{r.reason}</p>
                        </div>
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Impact</p>
                          <p className="text-xs text-sky-800 leading-relaxed font-medium">{r.impact}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Urgency</p>
                          <p className="text-xs text-slate-700 capitalize font-semibold">{r.urgency}</p>
                          <p className="text-xs text-slate-500 mt-1">Confidence: {r.confidence}%</p>
                        </div>
                      </div>
                      {actionNotice && (
                        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold flex items-center gap-2">
                          <ShieldCheck size={15} />
                          {actionNotice}
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAction(r.id, "approved")}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <CheckCircle size={13} />
                          Authorize (PIN: 1234)
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "delayed")}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Clock size={13} />
                          Delay 30 min
                        </button>
                        <button
                          onClick={() => handleAction(r.id, "rejected")}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All recommendations table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">All Recommendations Today</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-slate-500 font-semibold tracking-wide">Recommendation</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-semibold tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-semibold tracking-wide">Level</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-semibold tracking-wide">Confidence</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-semibold tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-slate-500 font-semibold tracking-wide">Time</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r) => {
                  const cat = CATEGORY_CONFIG[r.category];
                  return (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{r.title}</p>
                        <p className="text-slate-400 mt-0.5 leading-snug">{r.impact}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        {cat && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold ${cat.bg} ${cat.color}`}>
                            {cat.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5"><LevelBadge level={r.level} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full w-16">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${r.confidence}%` }} />
                          </div>
                          <span className="font-mono font-semibold text-slate-800">{r.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-semibold ${
                          r.status === "approved" ? "text-emerald-600" :
                          r.status === "rejected" ? "text-red-500" : "text-amber-600"
                        }`}>
                          {r.status === "approved" ? "✓ Approved" : r.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono">{r.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
