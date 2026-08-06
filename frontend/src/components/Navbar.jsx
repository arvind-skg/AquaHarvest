import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/assessment', label: 'New Assessment', icon: '⊕' },
  { to: '/history', label: 'History', icon: '◷' },
  { to: '/about', label: 'About', icon: 'ℹ' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(2,6,16,0.92)] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-aqua-500 to-ocean-500 shadow-[0_0_16px_rgba(20,184,166,0.5)] group-hover:shadow-[0_0_24px_rgba(20,184,166,0.7)] transition-all duration-300">
              <span className="text-lg">🌧</span>
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                Aqua<span className="gradient-text">Harvest</span>
              </span>

            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'text-aqua-400 bg-aqua-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  {label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-aqua-400 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/assessment"
              className="hidden sm:flex btn-primary py-2 px-4 text-sm"
            >
              <span>+</span> New Assessment
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/[0.06] bg-[rgba(2,6,16,0.95)] backdrop-blur-xl"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {navLinks.map(({ to, label, icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === to
                        ? 'bg-aqua-500/10 text-aqua-400'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span>{icon}</span> {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-[56px]" />
    </>
  );
}
