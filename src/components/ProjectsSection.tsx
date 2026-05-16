import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useNavigate } from 'react-router-dom';
import { CAMPAIGNS } from '@/App';

const BG = '#183028';
const LIME = '#cde877';

/* ── Scroll-triggered campaign card ── */
function CampaignCard({
  img, category, title, raised, goal,
  delay = 0, style = {}, className = '',
  onClick,
}: {
  img: string; category: string; title: string;
  raised: number; goal: number; delay?: number;
  style?: React.CSSProperties; className?: string;
  onClick?: () => void;
}) {
  const { ref, inView } = useInView(0.15);
  const pct = Math.round((raised / goal) * 100);

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      className={`relative overflow-hidden rounded-sm group cursor-pointer ${className}`}
      style={style}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 48, scale: 0.97 }}
      transition={{ duration: 1.1, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <img
        src={img}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-500" />

      {/* Category pill */}
      <div
        className="absolute top-5 left-5 text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full"
        style={{ backgroundColor: 'rgba(205,232,119,0.18)', color: LIME, backdropFilter: 'blur(8px)', border: '1px solid rgba(205,232,119,0.3)' }}
      >
        {category}
      </div>

      {/* Hover CTA */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/90">VOIR LA CAMPAGNE →</span>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
        <h3 className="text-[20px] font-medium text-white leading-tight mb-3">{title}</h3>
        <div className="relative w-full h-[2px] bg-white/20 mb-2 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: LIME }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : { width: 0 }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-bold" style={{ color: LIME }}>
            {raised.toLocaleString('fr-FR')}€ collectés
          </span>
          <span className="text-[12px] text-white/50">objectif {goal.toLocaleString('fr-FR')}€</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Line reveal ── */
function LineReveal({ children, delay = 0, inView }: { children: React.ReactNode; delay?: number; inView: boolean }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        animate={inView ? { y: 0 } : { y: '105%' }}
        transition={{ duration: 1, delay, ease: [0.76, 0, 0.24, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

const marqueeWords = ['Éduquer', 'Soigner', 'Nourrir', 'Protéger', 'Reconstruire', 'Financer', 'Inspirer', 'Unir'];

interface ProjectsSectionProps {
  onCampaignClick: (id: string) => void;
}

export default function ProjectsSection({ onCampaignClick }: ProjectsSectionProps) {
  const navigate = useNavigate();
  const { ref: ctaRef, inView: ctaInView } = useInView(0.2);

  return (
    <section style={{ backgroundColor: BG }} className="pb-0">

      {/* ── Section header ── */}
      <div className="px-10 pt-20 pb-12 flex justify-between items-end">
        <motion.p
          className="text-[11px] font-bold tracking-[0.28em] uppercase"
          style={{ color: LIME }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          (Campagnes en cours)
        </motion.p>
        <motion.button
          onClick={() => navigate('/discover')}
          className="text-[13px] font-semibold text-[#f2f1ec]/60 hover:text-[#cde877] transition-colors tracking-wide bg-transparent border-none cursor-pointer"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Voir toutes les campagnes →
        </motion.button>
      </div>

      {/* ── Campaign grid : 1 grand à gauche + 2 empilés à droite ── */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-1.5 px-6">
        <CampaignCard
          img={CAMPAIGNS[0].heroImg}
          category={CAMPAIGNS[0].category}
          title={CAMPAIGNS[0].title}
          raised={CAMPAIGNS[0].raised}
          goal={CAMPAIGNS[0].goal}
          delay={0}
          style={{ height: '620px' }}
          onClick={() => onCampaignClick(CAMPAIGNS[0].id)}
        />
        <div className="flex flex-col gap-1.5" style={{ height: '620px' }}>
          <CampaignCard
            img={CAMPAIGNS[1].heroImg}
            category={CAMPAIGNS[1].category}
            title={CAMPAIGNS[1].title}
            raised={CAMPAIGNS[1].raised}
            goal={CAMPAIGNS[1].goal}
            delay={0.12}
            style={{ flex: 1 }}
            onClick={() => onCampaignClick(CAMPAIGNS[1].id)}
          />
          <CampaignCard
            img={CAMPAIGNS[2].heroImg}
            category={CAMPAIGNS[2].category}
            title={CAMPAIGNS[2].title}
            raised={CAMPAIGNS[2].raised}
            goal={CAMPAIGNS[2].goal}
            delay={0.22}
            style={{ flex: 1 }}
            onClick={() => onCampaignClick(CAMPAIGNS[2].id)}
          />
        </div>
      </div>

      {/* ── CTA row ── */}
      <div className="grid grid-cols-2 gap-1.5 px-6 mt-1.5">

        {/* Impact stats panel */}
        <motion.div
          className="rounded-sm px-10 py-12 flex flex-col justify-between"
          style={{ backgroundColor: '#0f2118', minHeight: '280px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase text-[#f2f1ec]/40 mb-6">
            Votre impact, en chiffres
          </p>
          <div className="flex gap-12">
            {[
              { n: '89%', label: 'des fonds reversés directement aux ONG' },
              { n: '4.8★', label: 'note moyenne des donateurs' },
              { n: '72h', label: 'délai moyen de validation' },
            ].map((s) => (
              <div key={s.n} className="flex flex-col gap-2">
                <span className="text-[36px] font-bold leading-none" style={{ color: LIME }}>{s.n}</span>
                <span className="text-[12px] text-[#f2f1ec]/50 leading-tight max-w-[120px]">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* "More campaigns" CTA */}
        <div
          ref={ctaRef}
          className="flex flex-col justify-end px-10 py-12 rounded-sm"
          style={{ backgroundColor: BG, minHeight: '280px' }}
        >
          <h2 className="font-medium leading-[1.1] tracking-tight text-[#f2f1ec]"
            style={{ fontSize: 'clamp(32px, 3.8vw, 56px)' }}>
            <LineReveal delay={0} inView={ctaInView}>Envie de Soutenir</LineReveal>
            <LineReveal delay={0.1} inView={ctaInView}>
              <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>Plus de Causes</em>
            </LineReveal>
            <LineReveal delay={0.18} inView={ctaInView}>qui Changent le Monde ?</LineReveal>
          </h2>
          <motion.button
            animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => navigate('/discover')}
            className="mt-8 w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:bg-[#cde877] hover:border-[#cde877] hover:text-[#183028]"
            style={{ borderColor: LIME, color: LIME }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Marquee ── */}
      <div className="overflow-hidden mt-6" style={{ backgroundColor: BG }}>
        <div
          className="animate-marquee flex whitespace-nowrap"
          style={{ fontSize: 'clamp(72px, 12vw, 175px)', fontWeight: 700, color: LIME, lineHeight: 0.95, letterSpacing: '-0.03em' }}
        >
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span key={i} className="px-12 shrink-0">
              {i % 2 === 1
                ? <em className="font-['Cormorant_Garamond'] italic font-normal">{word}</em>
                : word}
              <span style={{ fontSize: '0.3em', verticalAlign: 'middle', margin: '0 0.5em', opacity: 0.4 }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
