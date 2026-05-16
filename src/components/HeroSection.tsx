import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

const LIME = '#cde877';
const BG = '#183028';

/* ── Animated counting number ── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('fr-FR'));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, to, { duration: 2.2, delay: 1.4, ease: 'easeOut' });
    return controls.stop;
  }, [count, to]);

  return (
    <span>
      <motion.span ref={ref}>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

/* ── Masked line reveal ── */
function LineReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ overflow: 'hidden', display: 'block' }}>
      <motion.div
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay, ease: [0.76, 0, 0.24, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Fade up ── */
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

const stats = [
  { value: 42000, suffix: '€+', label: 'Collectés au total' },
  { value: 340, suffix: '+', label: 'Campagnes actives' },
  { value: 15000, suffix: '+', label: 'Donateurs engagés' },
  { value: 28, suffix: ' pays', label: 'Portée internationale' },
];

const categories = [
  'Éducation', 'Santé', 'Environnement', 'Humanitaire',
  'Droits humains', 'Eau & Alimentation', 'Femmes & Enfants',
  'Urgences', 'Culture & Arts', 'Agriculture',
];

interface HeroSectionProps {
  onLaunchClick?: () => void;
  isAuthenticated?: boolean;
}

export default function HeroSection({ onLaunchClick, isAuthenticated }: HeroSectionProps) {
  return (
    <section className="flex flex-col" style={{ backgroundColor: BG, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <header className="px-10 pt-8 pb-0 flex flex-col relative z-10">
        <div className="flex justify-between items-center pb-6">
          {/* Left label */}
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              className="text-[13px] font-semibold tracking-wide text-[#f2f1ec]"
              initial={{ y: '120%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
            >
              Plateforme de Financement Solidaire
            </motion.div>
          </div>

          {/* Center brand */}
          <div style={{ overflow: 'hidden' }} className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              className="text-[22px] tracking-tight"
              style={{ color: LIME }}
              initial={{ y: '120%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
            >
              <span className="font-medium">Qrowd</span>
            </motion.div>
          </div>

          {/* Right link */}
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              initial={{ y: '120%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              <button
                onClick={onLaunchClick}
                className="text-[13px] font-semibold flex items-center gap-1 text-[#f2f1ec] hover:opacity-60 transition-opacity cursor-pointer"
              >
                <span className="hidden sm:inline">{isAuthenticated ? 'Accéder à mon compte' : 'Lancer une campagne'}</span>
                <span className="sm:hidden">{isAuthenticated ? 'Mon compte' : 'Lancer'}</span>
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Separator */}
        <motion.div
          className="w-full h-px bg-white/10"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
        />
      </header>

      {/* ── Giant Headline ── */}
      <div className="flex-1 flex flex-col justify-between px-8 pt-14 pb-0">
        <h1
          className="text-center leading-[0.97] tracking-tight select-none"
          style={{ color: LIME }}
        >
          <span className="block">
            <LineReveal delay={0.55}>
              <span className="font-medium" style={{ fontSize: 'clamp(52px, 7.5vw, 118px)' }}>
                Chaque Don —{' '}
              </span>
              <em
                className="font-['Cormorant_Garamond'] italic"
                style={{ fontSize: 'clamp(60px, 8.5vw, 130px)', fontWeight: 500 }}
              >
                Une Vie
              </em>
            </LineReveal>
          </span>
          <span className="block">
            <LineReveal delay={0.72}>
              <span className="font-medium" style={{ fontSize: 'clamp(52px, 7.5vw, 118px)' }}>
                Transformée Pour Toujours.
              </span>
            </LineReveal>
          </span>
        </h1>

        {/* ── Impact Stats Strip ── */}
        <div className="mt-16">
          {/* Top separator */}
          <motion.div
            className="w-full h-px bg-white/10 mb-10"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.0, ease: [0.76, 0, 0.24, 1] }}
          />

          <div className="grid grid-cols-4 gap-0 pb-12">
            {stats.map((stat, i) => (
              <FadeUp key={stat.label} delay={1.1 + i * 0.08}>
                <div
                  className="flex flex-col px-8 py-2"
                  style={{
                    borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <span
                    className="font-bold leading-none mb-3 tabular-nums"
                    style={{ color: LIME, fontSize: 'clamp(36px, 4vw, 62px)', letterSpacing: '-0.03em' }}
                  >
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-[13px] font-medium text-[#f2f1ec]/50 tracking-wide uppercase">
                    {stat.label}
                  </span>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ── Category Ticker ── */}
          <motion.div
            className="overflow-hidden border-t border-white/10 py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <div
              className="animate-marquee flex whitespace-nowrap items-center gap-10"
              style={{ animationDuration: '22s' }}
            >
              {[...categories, ...categories].map((cat, i) => (
                <span
                  key={i}
                  className="flex items-center gap-10 text-[13px] font-semibold tracking-[0.18em] uppercase shrink-0"
                  style={{ color: 'rgba(242,241,236,0.45)' }}
                >
                  {cat}
                  <span style={{ color: LIME, fontSize: '6px' }}>◆</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
