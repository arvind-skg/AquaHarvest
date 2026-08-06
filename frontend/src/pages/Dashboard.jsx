import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { getAssessments } from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// Method colors/icons
const METHOD_CONFIG = {
  'Storage Tank': { color: 'ocean', icon: '🛢️', bg: 'bg-ocean-500/10 border-ocean-500/20 text-ocean-400' },
  'Recharge Pit': { color: 'aqua', icon: '⛏️', bg: 'bg-aqua-500/10 border-aqua-500/20 text-aqua-400' },
  'Recharge Well': { color: 'yellow', icon: '🕳️', bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
  'Recharge Trench': { color: 'green', icon: '🌿', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  'Storage Tank + Recharge Pit': { color: 'purple', icon: '🔄', bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
};

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState([20.5937, 78.9629]);
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onSelect?.({ lat: e.latlng.lat.toFixed(5), lng: e.latlng.lng.toFixed(5) });
    },
  });
  return (
    <Marker position={position}>
      <Popup>
        <div className="text-slate-800 text-xs font-medium">
          📍 {position[0].toFixed(4)}°N, {position[1].toFixed(4)}°E
        </div>
      </Popup>
    </Marker>
  );
}

const FLOW_STEPS = [
  { icon: '📋', label: 'Fill Assessment Form', desc: 'Property, roof & environment details' },
  { icon: '🤖', label: 'AI Analyzes Site', desc: 'Random Forest ML model predicts best method' },
  { icon: '📐', label: 'Engineering Calculations', desc: 'Tank size, pit dims, cost — IS standard formulas' },
  { icon: '📄', label: 'Download PDF Report', desc: 'Complete assessment report ready to share' },
];

export default function Dashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapPin, setMapPin] = useState(null);

  useEffect(() => {
    getAssessments()
      .then(({ data }) => setAssessments(data))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, []);

  const totalWaterPotential = assessments.reduce((sum, a) => {
    const wp = a.result?.water_potential || 0;
    return sum + wp;
  }, 0);

  const stats = [
    {
      label: 'Total Assessments',
      value: loading ? '—' : assessments.length,
      sub: 'Site evaluations completed',
      icon: '📊',
      color: 'from-aqua-500/20 to-aqua-700/10 border-aqua-500/20',
    },
    {
      label: 'Water Potential',
      value: loading ? '—' : totalWaterPotential >= 1000000
        ? `${(totalWaterPotential / 1000000).toFixed(1)}M L`
        : `${(totalWaterPotential / 1000).toFixed(0)}K L`,
      sub: 'Annual harvest potential',
      icon: '💧',
      color: 'from-ocean-500/20 to-ocean-700/10 border-ocean-500/20',
    },
    {
      label: 'AI Recommendations',
      value: '5',
      sub: 'Harvesting methods in model',
      icon: '🤖',
      color: 'from-purple-500/20 to-purple-700/10 border-purple-500/20',
    },
    {
      label: 'Avg Confidence',
      value: loading ? '—' : (() => {
        const withConf = assessments.filter((a) => a.result?.confidence_score > 0);
        if (!withConf.length) return 'N/A';
        const avg = withConf.reduce((s, a) => s + a.result.confidence_score, 0) / withConf.length;
        return `${(avg * 100).toFixed(0)}%`;
      })(),
      sub: 'ML model confidence',
      icon: '🎯',
      color: 'from-emerald-500/20 to-emerald-700/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Hero Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-3xl glass-teal p-8"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-aqua-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-ocean-500/8 to-transparent rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <motion.div variants={fadeUp} className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono font-medium tracking-[0.3em] text-aqua-400 uppercase bg-aqua-500/10 px-3 py-1 rounded-full border border-aqua-500/20">
                  AI-Assisted Rainwater Assessment
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                🌧 <span className="gradient-text text-glow-teal">AquaHarvest</span>
              </h1>
              <p className="mt-3 text-slate-300 text-base max-w-2xl leading-relaxed">
                AI-assisted on-spot assessment of Rooftop Rainwater Harvesting & Artificial Recharge potential.
                Get engineering-grade recommendations in seconds.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:items-end">
              <Link to="/assessment" className="btn-primary whitespace-nowrap" id="new-assessment-btn">
                <span className="text-lg">+</span> New Assessment
              </Link>
              <Link to="/history" className="btn-ghost whitespace-nowrap">
                View History →
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className={`stat-card hover-card rounded-2xl bg-gradient-to-br ${s.color} border p-5`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{s.icon}</span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">{s.label}</p>
                <p className="text-[11px] text-slate-500 mt-1">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid: Flow Steps + Map */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Assessment Flow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">How It Works</h2>
              <span className="text-xs font-mono text-aqua-400 bg-aqua-500/10 px-2 py-1 rounded-lg">4 steps</span>
            </div>
            <div className="space-y-4">
              {FLOW_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-aqua-500/20 to-ocean-500/10 border border-aqua-500/20 flex items-center justify-center text-xl transition-all group-hover:scale-110 group-hover:border-aqua-500/40">
                    {step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-aqua-400">0{i + 1}</span>
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="absolute left-[29px] mt-10 h-4 w-px bg-aqua-500/20" />
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/assessment"
              className="btn-primary w-full justify-center mt-2"
              id="dashboard-start-btn"
            >
              Start Assessment
            </Link>
          </motion.div>

          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">📍 Site Map</h2>
              {mapPin && (
                <div className="text-[10px] font-mono text-aqua-400 bg-aqua-500/10 px-2 py-1 rounded-lg">
                  {mapPin.lat}°N, {mapPin.lng}°E
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">Click on the map to mark your site location</p>
            <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                />
                <LocationMarker onSelect={setMapPin} />
              </MapContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Assessments */}
        {!loading && assessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Recent Assessments</h2>
              <Link to="/history" className="btn-ghost text-xs py-1.5 px-3">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {assessments.slice(0, 5).map((a) => {
                const method = a.result?.recommended_method || 'Pending';
                const cfg = METHOD_CONFIG[method] || METHOD_CONFIG['Storage Tank'];
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-aqua-500/10 border border-aqua-500/20 flex items-center justify-center text-sm flex-shrink-0">
                        {cfg.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{a.building_name}</p>
                        <p className="text-xs text-slate-500">{a.district} · {a.owner_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`method-badge border ${cfg.bg} text-xs`}>
                        {method}
                      </span>
                      {a.result?.water_potential && (
                        <span className="text-xs text-slate-500 hidden sm:block">
                          {(a.result.water_potential / 1000).toFixed(0)}K L/yr
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && assessments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-3xl p-12 text-center"
          >
            <div className="text-5xl mb-4 animate-float inline-block">🌧</div>
            <p className="text-slate-300 font-medium">No assessments yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">Create your first assessment to see results here</p>
            <Link to="/assessment" className="btn-primary inline-flex">
              Create First Assessment
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
