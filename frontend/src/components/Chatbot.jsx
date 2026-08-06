import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Extended rule-based knowledge base
const KB = {
  // Exact matches
  "what is rainwater harvesting": "Rainwater harvesting (RWH) is the collection, storage, and utilization of rainwater from rooftops and other surfaces. It reduces stormwater runoff, replenishes groundwater, and provides a supplementary water supply.",
  "how is tank size calculated": "Tank capacity = (Occupants × 135 L/day × 30 days) ÷ 1000 m³. We use 135 L/person/day as per IS standards, sized for 30 dry days of storage.",
  "why soil type matters": "Soil type determines infiltration rate. Sandy soil (high permeability) = Recharge Pit/Well. Clayey soil (low permeability) = Storage Tank or Trench. Loamy is intermediate.",
  "what is recharge pit": "A Recharge Pit is a shallow excavation (2–4 m deep) filled with gravel/boulders. Harvested rainwater percolates through it into the aquifer, replenishing groundwater.",
  "what is recharge well": "A Recharge Well is a borehole (5–30 m deep) that channels harvested water directly into a confined aquifer. Best when open space is limited or water table is deep.",
  "what is recharge trench": "A Recharge Trench is a long, narrow excavation (0.5–1 m wide, 1–3 m deep) backfilled with gravel. Ideal for sloped land with moderate rainfall and permeable soil.",
  "how much water can be saved": "Annual Harvest (L) = Roof Area (m²) × Annual Rainfall (mm) × Runoff Coefficient. For a 100 m² roof with 800 mm rain and 0.85 runoff: 100 × 800 × 0.85 = 68,000 L/year!",
  "explain my recommendation": "Your recommendation is based on 10 parameters: roof area, roof type, roof material, building type, annual rainfall, soil type, groundwater depth, open space, occupants, and budget — analyzed by our Random Forest ML model.",
  "what is runoff coefficient": "The runoff coefficient (0–1) represents water that actually flows off the roof. Concrete: 0.85, Metal: 0.90, Tile: 0.75. The rest is absorbed or lost to evaporation.",
  "what is artificial recharge": "Artificial recharge (AR) is the process of augmenting natural groundwater replenishment through engineered structures like pits, wells, and trenches that direct surface water into aquifers.",
  "cost estimate": "Costs vary: Storage Tank (₹15,000–₹80,000), Recharge Pit (₹12,000–₹40,000), Recharge Well (₹45,000–₹80,000), Recharge Trench (₹10,000–₹30,000). Hybrid systems cost more but maximize benefits.",
  "help": "I can answer questions about:\n• Rainwater harvesting basics\n• How is tank size calculated\n• Why soil type matters\n• What is recharge pit/well/trench\n• Runoff coefficient\n• Cost estimates\n• How much water can be saved",
};

// Keyword matching for flexible queries
const KEYWORD_MAP = [
  { keywords: ['tank', 'storage', 'size', 'capacity', 'calculate', 'calc'], key: "how is tank size calculated" },
  { keywords: ['soil', 'why soil', 'clay', 'sandy', 'loam'], key: "why soil type matters" },
  { keywords: ['recharge pit', 'pit'], key: "what is recharge pit" },
  { keywords: ['recharge well', 'well', 'borewell', 'borehole'], key: "what is recharge well" },
  { keywords: ['trench'], key: "what is recharge trench" },
  { keywords: ['runoff', 'coefficient'], key: "what is runoff coefficient" },
  { keywords: ['artificial recharge', 'groundwater recharge', 'aquifer'], key: "what is artificial recharge" },
  { keywords: ['cost', 'price', 'budget', 'expensive', 'cheap'], key: "cost estimate" },
  { keywords: ['water save', 'how much water', 'save', 'harvest'], key: "how much water can be saved" },
  { keywords: ['recommend', 'why recommended', 'explain', 'how does it work'], key: "explain my recommendation" },
  { keywords: ['help', 'what can you', 'what do you know'], key: "help" },
  { keywords: ['rainwater', 'what is rtrwh', 'harvesting'], key: "what is rainwater harvesting" },
];

function findAnswer(input) {
  const lower = input.toLowerCase().trim();
  if (KB[lower]) return KB[lower];
  for (const { keywords, key } of KEYWORD_MAP) {
    if (keywords.some((k) => lower.includes(k))) return KB[key];
  }
  return "I'm not sure about that. Try asking about: tank size, soil type, recharge pit, cost estimates, or type 'help' to see all topics.";
}

// CRT typewriter for chatbot
function TypingMessage({ text }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono text-xs">
      {displayed}
      {!done && <span className="crt-cursor ml-0.5" />}
    </span>
  );
}

const QUICK_PROMPTS = [
  'How is tank size calculated?',
  'Why soil type matters?',
  'What is recharge pit?',
  'How much water can be saved?',
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I\'m AquaAssist 🌧\nAsk me anything about rainwater harvesting, calculations, or your assessment. Type "help" to see all topics.',
      animate: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed, animate: false }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = findAnswer(trimmed);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, animate: true }]);
      setTyping(false);
    }, 500 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-aqua-600 to-ocean-600 shadow-[0_8px_24px_rgba(13,148,136,0.5)] flex items-center justify-center text-2xl transition-all duration-300 border border-white/10"
        aria-label="Toggle AquaAssist chatbot"
        id="chatbot-toggle"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {open ? '✕' : '🌧'}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#020610] animate-pulse-slow" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] flex flex-col rounded-2xl border border-aqua-500/20 bg-[rgba(6,12,24,0.95)] backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aqua-500 to-ocean-500 flex items-center justify-center text-sm shadow-[0_0_12px_rgba(20,184,166,0.4)]">
                  🌧
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AquaAssist</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-slow inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-aqua-600/80 to-ocean-600/80 text-white rounded-br-sm'
                        : 'bg-white/[0.06] text-slate-200 rounded-bl-sm border border-white/[0.08]'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.animate ? (
                      <TypingMessage text={msg.text} />
                    ) : (
                      <span className={msg.role === 'assistant' ? 'font-mono text-xs' : 'text-sm'}>{msg.text}</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.06] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-aqua-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 pt-2 flex gap-1.5 flex-wrap border-t border-white/[0.04]">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-aqua-500/10 text-aqua-400 border border-aqua-500/20 hover:bg-aqua-500/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field text-sm"
                placeholder="Ask AquaAssist..."
                id="chatbot-input"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="btn-primary px-3 py-2 text-sm flex-shrink-0 disabled:opacity-40"
                id="chatbot-send"
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
