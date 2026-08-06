import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAssessments } from '../services/api';
import { getPdfReportUrl } from '../services/api';

const METHOD_BADGE = {
  'Storage Tank':               'bg-ocean-500/10 border-ocean-500/20 text-ocean-400',
  'Recharge Pit':               'bg-aqua-500/10 border-aqua-500/20 text-aqua-400',
  'Recharge Well':              'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  'Recharge Trench':            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'Storage Tank + Recharge Pit':'bg-purple-500/10 border-purple-500/20 text-purple-400',
};

const METHOD_ICON = {
  'Storage Tank': '🛢️',
  'Recharge Pit': '⛏️',
  'Recharge Well': '🕳️',
  'Recharge Trench': '🌿',
  'Storage Tank + Recharge Pit': '🔄',
};

export default function History() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');

  useEffect(() => {
    getAssessments()
      .then(({ data }) => setAssessments(data))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, []);

  const methods = ['All', ...new Set(assessments.map((a) => a.result?.recommended_method).filter(Boolean))];

  const filtered = assessments.filter((a) => {
    const matchSearch =
      !search ||
      a.building_name.toLowerCase().includes(search.toLowerCase()) ||
      a.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      a.district.toLowerCase().includes(search.toLowerCase());
    const matchMethod =
      filterMethod === 'All' || a.result?.recommended_method === filterMethod;
    return matchSearch && matchMethod;
  });

  const totalWater = assessments.reduce((s, a) => s + (a.result?.water_potential || 0), 0);
  const totalCost  = assessments.reduce((s, a) => s + (a.result?.estimated_cost  || 0), 0);

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-mono text-aqua-400 uppercase tracking-[0.25em] mb-1">Assessment History</p>
            <h1 className="text-3xl font-bold text-white">All Assessments</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading ? 'Loading...' : `${assessments.length} site${assessments.length !== 1 ? 's' : ''} evaluated`}
            </p>
          </div>
          <Link to="/assessment" className="btn-primary self-start sm:self-auto">
            + New Assessment
          </Link>
        </motion.div>

        {/* Summary Stats */}
        {!loading && assessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: 'Total Sites', value: assessments.length, icon: '📊' },
              { label: 'Total Water Potential', value: totalWater >= 1_000_000 ? `${(totalWater/1_000_000).toFixed(1)}M L` : `${(totalWater/1000).toFixed(0)}K L`, icon: '💧' },
              { label: 'Avg Project Cost', value: assessments.length ? `₹${(totalCost/assessments.length).toLocaleString(undefined, {maximumFractionDigits: 0})}` : '—', icon: '💰' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by building, owner or district..."
            className="input-field max-w-sm"
            id="history-search"
          />
          <div className="flex gap-2 flex-wrap">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                  filterMethod === m
                    ? 'bg-aqua-500/20 border-aqua-500/40 text-aqua-300'
                    : 'border-white/[0.08] text-slate-500 hover:border-white/20 hover:text-slate-300'
                }`}
              >
                {METHOD_ICON[m] || '⊞'} {m}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Table */}
        {loading ? (
          <div className="glass rounded-3xl p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer-box h-14 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4 animate-float inline-block">🌧</div>
            <p className="text-slate-300 font-medium">
              {search || filterMethod !== 'All' ? 'No matching assessments' : 'No assessments yet'}
            </p>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              {search ? 'Try a different search term' : 'Create your first site assessment'}
            </p>
            <Link to="/assessment" className="btn-primary inline-flex">
              Create Assessment
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl overflow-hidden"
          >
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/[0.06] text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
              <span>Building</span>
              <span>Owner / District</span>
              <span>Roof Area</span>
              <span>Method</span>
              <span>Water Potential</span>
              <span>Est. Cost</span>
              <span>PDF</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {filtered.map((a, idx) => {
                const method = a.result?.recommended_method || 'Pending';
                const badge = METHOD_BADGE[method] || 'bg-slate-500/10 border-slate-500/20 text-slate-400';
                const roofArea = a.result ? null : (a.roof_length * a.roof_width).toFixed(0);

                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="lg:grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr_1fr_auto] gap-4 px-6 py-4 flex flex-col hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Building */}
                    <div>
                      <p className="text-sm font-medium text-white truncate">{a.building_name}</p>
                      <p className="text-[10px] text-slate-600 font-mono">#{a.id}</p>
                    </div>
                    {/* Owner / District */}
                    <div>
                      <p className="text-sm text-slate-300 truncate">{a.owner_name}</p>
                      <p className="text-xs text-slate-500">{a.district}</p>
                    </div>
                    {/* Roof Area */}
                    <div className="flex items-center">
                      <span className="text-sm text-slate-300">
                        {a.result?.water_potential
                          ? `${(a.result.water_potential / (a.rainfall * 0.8)).toFixed(0)} m²`
                          : `${(a.roof_length * a.roof_width).toFixed(0)} m²`}
                      </span>
                    </div>
                    {/* Method */}
                    <div className="flex items-center">
                      <span className={`method-badge border text-xs ${badge}`}>
                        {METHOD_ICON[method] || '?'} {method}
                      </span>
                    </div>
                    {/* Water Potential */}
                    <div className="flex items-center">
                      <span className="text-sm text-slate-300">
                        {a.result?.water_potential
                          ? `${(a.result.water_potential / 1000).toFixed(0)}K L`
                          : '—'}
                      </span>
                    </div>
                    {/* Cost */}
                    <div className="flex items-center">
                      <span className="text-sm text-slate-300">
                        {a.result?.estimated_cost
                          ? `₹${a.result.estimated_cost.toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                    {/* PDF */}
                    <div className="flex items-center">
                      {a.result ? (
                        <a
                          href={getPdfReportUrl(a.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-xl bg-aqua-500/10 border border-aqua-500/20 text-aqua-400 hover:bg-aqua-500/20 transition-colors whitespace-nowrap"
                        >
                          📄 PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
