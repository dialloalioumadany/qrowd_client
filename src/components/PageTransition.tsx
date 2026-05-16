import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'idle' | 'in' | 'out';

interface PageTransitionProps {
  phase: Phase;
}

/**
 * Two-panel curtain transition:
 *  "in"  → panels slide UP covering the screen
 *  "out" → panels slide UP off screen, revealing the new page
 */
export default function PageTransition({ phase }: PageTransitionProps) {
  const EASE_IN  = [0.76, 0, 0.24, 1] as const;
  const EASE_OUT = [0.76, 0, 0.24, 1] as const;
  const DUR = 0.65;

  // Panel 1 — dark green (leads)
  const panel1Variants = {
    idle:  { y: '101%' },
    in:    { y: 0,      transition: { duration: DUR, ease: EASE_IN,  delay: 0    } },
    out:   { y: '-101%',transition: { duration: DUR, ease: EASE_OUT, delay: 0.08 } },
  };

  // Panel 2 — lime (follows, slightly delayed)
  const panel2Variants = {
    idle:  { y: '101%' },
    in:    { y: 0,      transition: { duration: DUR, ease: EASE_IN,  delay: 0.08 } },
    out:   { y: '-101%',transition: { duration: DUR, ease: EASE_OUT, delay: 0    } },
  };

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none overflow-hidden">
      {/* Panel 2 — lime, behind */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: '#cde877' }}
        variants={panel2Variants}
        animate={phase}
        initial="idle"
      />
      {/* Panel 1 — dark green, in front */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: '#183028' }}
        variants={panel1Variants}
        animate={phase}
        initial="idle"
      >
        {/* Brand shown during cover */}
        <AnimatePresence>
          {phase === 'in' && (
            <motion.span
              className="text-[32px] font-bold tracking-tight"
              style={{ color: '#cde877' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              Qrowd
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
