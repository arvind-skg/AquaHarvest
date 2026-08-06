import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🤖', title: 'Random Forest ML', desc: 'Our ML model trained on 5,000 synthetic records generated from engineering rules recommends the best harvesting method.', tag: 'Machine Learning' },
  { icon: '📐', title: 'Engineering Calculations', desc: 'All numbers — tank size, pit dimensions, cost — come from IS 15797 engineering formulas, not the AI model.', tag: 'IS Standard' },
  { icon: '🗺️', title: 'Interactive Map', desc: 'Click anywhere on the OpenStreetMap to tag your exact site location with latitude/longitude coordinates.', tag: 'GIS Ready' },
  { icon: '🔮', title: '3D Flow Visualization', desc: 'React Three Fiber renders an animated 3D model of the recommended harvesting system — rain to groundwater.', tag: 'Three.js' },
  { icon: '🤖', title: 'AquaAssist Chatbot', desc: 'Rule-based chatbot answers 14+ rainwater harvesting questions. Architecture is ready for Gemini/OpenAI integration.', tag: 'AI Ready' },
  { icon: '📄', title: 'PDF Report', desc: 'Download a professional A4 PDF report with all assessment details, AI recommendation, and calculation results.', tag: 'ReportLab' },
];

const METHODS = [
  { name: 'Storage Tank', when: 'Limited open space, high water demand', icon: '🛢️', color: 'ocean' },
  { name: 'Recharge Pit', when: 'Sandy/gravelly soil, good open space', icon: '⛏️', color: 'aqua' },
  { name: 'Recharge Well', when: 'Deep water table, minimal surface area', icon: '🕳️', color: 'yellow' },
  { name: 'Recharge Trench', when: 'Sloped land, moderate rainfall, loamy soil', icon: '🌿', color: 'emerald' },
  { name: 'Storage Tank + Recharge Pit', when: 'Large roof area, high rainfall, good space', icon: '🔄', color: 'purple' },
];

const STACK = [
  { layer: 'Frontend', items: ['React + Vite', 'Tailwind CSS', 'Framer Motion', 'React Three Fiber', 'React Leaflet'] },
  { layer: 'Backend', items: ['Python 3.11', 'Django 5.0', 'Django REST Framework', 'ReportLab'] },
  { layer: 'ML Engine', items: ['Scikit-learn', 'Random Forest Classifier', '5000 synthetic records', 'joblib model pickle'] },
  { layer: 'Database', items: ['SQLite (dev)', 'PostgreSQL (prod)'] },
];

export default function About() {
  return (
    <div className="min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="text-6xl mb-4 animate-float inline-block">🌧</div>
          <h1 className="text-4xl font-bold gradient-text text-glow-teal mb-3">AquaHarvest</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            AI-Assisted Rooftop Rainwater Harvesting & Artificial Recharge Assessment System
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-aqua-500/10 border border-aqua-500/20 text-aqua-400">AI-Assisted Assessment</span>
            <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-400">Open Source MVP</span>
          </div>
        </motion.div>

        {/* Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-teal rounded-3xl p-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">🎯 Problem Statement</h2>
          <p className="text-slate-300 leading-relaxed">
            India faces a severe water crisis, with groundwater depletion accelerating in urban and peri-urban areas.
            Rooftop rainwater harvesting (RTRWH) is a proven solution, but on-site assessment is complex —
            requiring knowledge of local rainfall patterns, soil types, building characteristics, and engineering calculations.
          </p>
          <p className="text-slate-300 leading-relaxed mt-3">
            AquaHarvest provides an <strong className="text-aqua-400">on-spot, instant assessment</strong> that combines
            AI-powered method recommendation with engineering-grade calculations, making RTRWH accessible to every building owner.
          </p>
        </motion.div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">✨ Key Features</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass hover-card rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-aqua-500/10 border border-aqua-500/20 text-aqua-400">{f.tag}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Harvesting Methods */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">🏗️ Harvesting Methods</h2>
          <div className="space-y-3">
            {METHODS.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 rounded-2xl glass hover-card"
              >
                <span className="text-3xl flex-shrink-0">{m.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Best when: {m.when}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">🛠️ Tech Stack</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STACK.map((s, i) => (
              <motion.div
                key={s.layer}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5"
              >
                <p className="text-xs font-mono text-aqua-400 uppercase tracking-wider mb-3">{s.layer}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1 h-1 bg-aqua-400 rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Formula Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="crt-output"
        >
          <div className="crt-text">
            <div className="crt-prompt">ENGINEERING FORMULAS (IS 15797)</div>
            <div className="h-2" />
            <div>Water Potential = Roof Area × Rainfall × Runoff Coefficient</div>
            <div>Tank Capacity   = (Occupants × 135 L/day × 30 days) ÷ 1000</div>
            <div>Pit Volume      = Water Potential × 10% ÷ 1000 m³</div>
            <div>Pit Dimensions  = √(Volume / Depth) for length & width</div>
            <div className="h-2" />
            <div className="crt-highlight">Runoff Coefficients: Concrete=0.85 | Metal=0.90 | Tile=0.75 | Asbestos=0.80</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
