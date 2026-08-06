import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ThreeDViewer from '../components/ThreeDViewer';
import { getPdfReportUrl } from '../services/api';

const METHOD_INFO = {
  'Storage Tank': {
    icon: '🛢️', color: 'ocean',
    badge: 'bg-ocean-500/10 border-ocean-500/30 text-ocean-300',
    glow: 'shadow-[0_0_32px_rgba(8,145,178,0.2)]',
  },
  'Recharge Pit': {
    icon: '⛏️', color: 'aqua',
    badge: 'bg-aqua-500/10 border-aqua-500/30 text-aqua-300',
    glow: 'shadow-[0_0_32px_rgba(13,148,136,0.2)]',
  },
  'Recharge Well': {
    icon: '🕳️', color: 'yellow',
    badge: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    glow: 'shadow-[0_0_32px_rgba(202,138,4,0.2)]',
  },
  'Recharge Trench': {
    icon: '🌿', color: 'emerald',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    glow: 'shadow-[0_0_32px_rgba(5,150,105,0.2)]',
  },
  'Storage Tank + Recharge Pit': {
    icon: '🔄', color: 'purple',
    badge: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    glow: 'shadow-[0_0_32px_rgba(124,58,237,0.2)]',
  },
};

// CRT Typewriter component
function CRTTypewriter({ lines, speed = 18 }) {
  const [displayed, setDisplayed] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed([]);
    setLineIdx(0);
    setCharIdx(0);
    setDone(false);
  }, [lines]);

  useEffect(() => {
    if (done || !lines.length) return;

    if (lineIdx >= lines.length) {
      setDone(true);
      return;
    }

    const currentLine = lines[lineIdx];

    if (charIdx === 0) {
      setDisplayed((prev) => [...prev, { type: currentLine.type, text: '' }]);
    }

    if (charIdx < currentLine.text.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => {
          const updated = [...prev];
          updated[lineIdx] = { ...updated[lineIdx], text: currentLine.text.slice(0, charIdx + 1) };
          return updated;
        });
        setCharIdx((c) => c + 1);
      }, currentLine.type === 'blank' ? 0 : speed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      }, currentLine.type === 'blank' ? 50 : 80);
      return () => clearTimeout(timer);
    }
  }, [lineIdx, charIdx, lines, done, speed]);

  return (
    <div className="crt-output">
      <div className="crt-text space-y-0.5">
        {displayed.map((line, i) => {
          if (line.type === 'blank') return <div key={i} className="h-2" />;
          if (line.type === 'prompt') return (
            <div key={i} className="flex gap-2">
              <span className="crt-prompt flex-shrink-0">AQUAHARVEST &gt;</span>
              <span className="text-green-300">{line.text}</span>
            </div>
          );
          if (line.type === 'header') return (
            <div key={i} className="crt-highlight font-bold">{line.text}</div>
          );
          if (line.type === 'result') return (
            <div key={i} className="text-yellow-300 font-semibold">{line.text}</div>
          );
          if (line.type === 'info') return (
            <div key={i} className="text-slate-400 text-xs">{line.text}</div>
          );
          return <div key={i} className="text-green-200">{line.text}</div>;
        })}
        {!done && <span className="crt-cursor" />}
        {done && <div className="flex gap-2 mt-1"><span className="crt-prompt">AQUAHARVEST &gt;</span><span className="text-green-300">Analysis complete. <span className="crt-cursor" /></span></div>}
      </div>
    </div>
  );
}

function buildCRTLines(recommendation, reason, result, confidence, assessment) {
  return [
    { type: 'prompt', text: 'Initializing AquaHarvest Assessment Engine v2.0...' },
    { type: 'blank', text: '' },
    { type: 'info', text: `[SYSTEM] Loading Random Forest model... OK` },
    { type: 'info', text: `[SYSTEM] Processing ${assessment?.district || 'site'} data...` },
    { type: 'info', text: `[SYSTEM] Analyzing ${assessment?.roof_area || (parseFloat(assessment?.roof_length||0)*parseFloat(assessment?.roof_width||0)).toFixed(1)} m² roof catchment...` },
    { type: 'blank', text: '' },
    { type: 'header', text: `══════════════════════════════════════` },
    { type: 'header', text: ` RECOMMENDATION RESULT` },
    { type: 'header', text: `══════════════════════════════════════` },
    { type: 'blank', text: '' },
    { type: 'result', text: `► RECOMMENDED METHOD: ${recommendation}` },
    { type: 'result', text: `► CONFIDENCE SCORE:   ${confidence ? (confidence * 100).toFixed(1) + '%' : 'N/A'}` },
    { type: 'blank', text: '' },
    { type: 'header', text: `─── REASONING ───` },
    { type: 'default', text: reason },
    { type: 'blank', text: '' },
    { type: 'header', text: `─── ENGINEERING SUMMARY ───` },
    { type: 'default', text: `Water Harvest Potential : ${result?.water_potential ? result.water_potential.toLocaleString() + ' L/year' : '—'}` },
    { type: 'default', text: `Tank Capacity           : ${result?.tank_capacity ? result.tank_capacity + ' m³' : '—'}` },
    { type: 'default', text: `Recharge Pit Size       : ${result?.pit_length ? `${result.pit_length} × ${result.pit_width} × ${result.pit_depth} m` : '—'}` },
    { type: 'default', text: `Estimated Cost          : ₹${result?.estimated_cost ? result.estimated_cost.toLocaleString() : '—'}` },
    { type: 'blank', text: '' },
  ];
}

function CalcCard({ icon, label, value, sub, color = 'aqua' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl bg-${color}-500/5 border border-${color}-500/20 p-4 hover-card`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-bold text-${color}-400 mt-0.5 break-all`}>{value}</p>
          {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass rounded-3xl p-12 max-w-md mx-4">
          <div className="text-5xl mb-4">🌧</div>
          <h2 className="text-xl font-semibold text-white mb-2">No Results Found</h2>
          <p className="text-slate-400 text-sm mb-6">Complete an assessment first to see your results.</p>
          <Link to="/assessment" className="btn-primary inline-flex">Start Assessment</Link>
        </div>
      </div>
    );
  }

  const { id, recommended_method, confidence_score, recommendation_reason, result, assessment } = data;
  const cfg = METHOD_INFO[recommended_method] || METHOD_INFO['Storage Tank'];
  const crtLines = buildCRTLines(recommended_method, recommendation_reason, result, confidence_score, assessment);
  const pdfUrl = id ? getPdfReportUrl(id) : null;

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs font-mono text-aqua-400 uppercase tracking-[0.25em] mb-1">Assessment Result</p>
            <h1 className="text-3xl font-bold text-white">AI Analysis Complete</h1>
            {assessment && (
              <p className="text-slate-400 text-sm mt-1">
                {assessment.building_name} · {assessment.district} · {assessment.owner_name}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm py-2.5">
                📄 Download PDF Report
              </a>
            )}
            <Link to="/assessment" className="btn-ghost text-sm py-2.5">+ New Assessment</Link>
            <Link to="/" className="btn-ghost text-sm py-2.5">← Dashboard</Link>
          </div>
        </motion.div>

        {/* Recommendation Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`glass rounded-3xl p-6 ${cfg.glow} border border-white/[0.06]`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-4xl flex-shrink-0">
                {cfg.icon}
              </div>
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Recommended Method</p>
                <h2 className={`text-2xl font-bold text-white`}>{recommended_method}</h2>
                {confidence_score > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 max-w-[160px] h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-aqua-500 to-ocean-400 rounded-full transition-all duration-1000"
                        style={{ width: `${confidence_score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-aqua-400 font-medium">{(confidence_score * 100).toFixed(0)}% confidence</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`method-badge border text-sm px-4 py-2 ${cfg.badge}`}>
              {cfg.icon} {recommended_method}
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* CRT Output */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow" />
              AI Terminal Output
            </h3>
            <CRTTypewriter lines={crtLines} speed={12} />
          </motion.div>

          {/* 3D Viewer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse-slow" />
              3D Flow Visualization
            </h3>
            <ThreeDViewer recommendation={recommended_method} />
          </motion.div>
        </div>

        {/* Engineering Calculations */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            📐 Engineering Calculations
            <span className="text-xs font-mono text-slate-500 font-normal ml-2">IS 15797 Standards</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <CalcCard
              icon="🏠" label="Roof Catchment Area"
              value={`${result?.roof_area ?? '—'} m²`}
              sub="Length × Width"
              color="aqua"
            />
            <CalcCard
              icon="💧" label="Annual Water Potential"
              value={result?.water_potential ? `${(result.water_potential / 1000).toFixed(1)}K L` : '—'}
              sub={`${result?.water_potential?.toLocaleString()} L/year`}
              color="ocean"
            />
            <CalcCard
              icon="🛢️" label="Tank Capacity"
              value={`${result?.tank_capacity ?? '—'} m³`}
              sub="135 L/person × 30 days"
              color="aqua"
            />
            <CalcCard
              icon="⛏️" label="Pit Dimensions"
              value={result?.pit_length ? `${result.pit_length} × ${result.pit_width} m` : '—'}
              sub={`Depth: ${result?.pit_depth ?? '—'} m`}
              color="emerald"
            />
            <CalcCard
              icon="💰" label="Estimated Cost"
              value={result?.estimated_cost ? `₹${result.estimated_cost.toLocaleString()}` : '—'}
              sub={result?.within_budget ? '✓ Within budget' : '⚠ Exceeds budget'}
              color={result?.within_budget ? 'aqua' : 'orange'}
            />
            <CalcCard
              icon="📉" label="Runoff Coefficient"
              value={result?.runoff_coefficient ?? '—'}
              sub="Based on roof material"
              color="slate"
            />
            <CalcCard
              icon="👥" label="Daily Water Demand"
              value={result?.daily_demand_litres ? `${result.daily_demand_litres} L` : '—'}
              sub="Occupants × 135 L/day"
              color="purple"
            />
            <CalcCard
              icon="📈" label="Annual Cost Saving"
              value={result?.annual_savings_inr ? `₹${result.annual_savings_inr.toLocaleString()}` : '—'}
              sub="At ₹5/1000L water rate"
              color="yellow"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
