import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, ArrowDown, ArrowUp } from 'lucide-react';

const LIME = '#cde877';
const BG = '#183028';
const NAV_PILL = '#1e3a2e';

interface FixedBarProps {
  scrolled: boolean;
  onScrollClick?: () => void;
}

export default function FixedBar({ scrolled, onScrollClick }: FixedBarProps) {
  const [activeNav, setActiveNav] = useState('HOME');
  const navItems = ['HOME', 'SERVICES', 'WORK', 'ABOUT'];

  return (
    <motion.div
      className="fixed bottom-6 left-0 right-0 z-50 flex items-center justify-between px-6 pointer-events-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 1.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Left: SEND INQUIRY */}
      <button
        className="pointer-events-auto flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] px-7 py-4 rounded-full transition-all hover:scale-105 hover:brightness-110"
        style={{ backgroundColor: LIME, color: BG }}
      >
        SEND INQUIRY <ArrowUpRight size={14} strokeWidth={3} />
      </button>

      {/* Center: Nav pill */}
      <nav
        className="pointer-events-auto p-1.5 rounded-full flex items-center shadow-2xl"
        style={{ backgroundColor: NAV_PILL }}
      >
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            className="text-[10px] font-bold tracking-[0.15em] px-7 py-3.5 rounded-full transition-all duration-300"
            style={
              activeNav === item
                ? { backgroundColor: LIME, color: BG }
                : { color: '#f2f1ec' }
            }
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Right: scroll button only */}
      <div className="pointer-events-auto flex items-center">
        <motion.button
          onClick={onScrollClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-colors flex-shrink-0"
          style={{ backgroundColor: LIME, color: BG }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={scrolled ? 'up' : 'down'}
              initial={{ opacity: 0, y: scrolled ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: scrolled ? -6 : 6 }}
              transition={{ duration: 0.2 }}
            >
              {scrolled ? <ArrowUp size={20} strokeWidth={2.5} /> : <ArrowDown size={20} strokeWidth={2.5} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
