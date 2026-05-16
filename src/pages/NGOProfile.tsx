import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useNavigate } from 'react-router-dom';

const TABS = ['Campagnes', 'Notre mission', 'Équipe', 'Documents'];

const BG = '#183028';
const LIME = '#cde877';
const OFFWHITE = '#f2f1ec';

const CAMPAIGNS = [
  { title: 'École pour 500 enfants au Sahel', raised: 38400, goal: 55000, donors: 312, days: 18, img: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=700&auto=format&fit=crop' },
  { title: 'Kits scolaires pour 1 000 élèves', raised: 8900, goal: 15000, donors: 74, days: 44, img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop' },
  { title: 'Bibliothèques mobiles rurales', raised: 21000, goal: 21000, donors: 180, days: 0, img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=700&auto=format&fit=crop' },
];

const TEAM = [
  { name: 'Fatou Diallo', role: 'Directrice générale', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=500&auto=format&fit=crop' },
  { name: 'Mamadou Coulibaly', role: 'Directeur des opérations', img: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=500&auto=format&fit=crop' },
  { name: 'Aïssatou Traoré', role: 'Responsable programmes', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop' },
];

export default function NGOProfile() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bannerRef, offset: ['start start', 'end start'] });
  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const { ref: campsRef, inView: campsInView } = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: OFFWHITE }}>

      {/* ─── Navbar: transparent → solid ─── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center px-6 md:px-12"
        style={{ height: '64px' }}
        animate={scrolled
          ? { backgroundColor: 'rgba(242,241,236,0.95)', borderBottomColor: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(16px)' }
          : { backgroundColor: 'transparent', borderBottomColor: 'transparent', backdropFilter: 'none' }
        }
        transition={{ duration: 0.4 }}
        initial={false}
      >
        {/* left */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 transition-colors justify-self-start"
          style={{ color: scrolled ? '#1a1a1a' : 'rgba(255,255,255,0.8)' }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-[0.2em]">ACCUEIL</span>
        </button>

        {/* center */}
        <span className="text-[18px] font-bold transition-colors justify-self-center" style={{ color: scrolled ? BG : LIME }}>Qrowd</span>

        {/* right */}
        <div className="flex items-center gap-3 justify-self-end">
          <motion.button
            onClick={() => navigate('/campaign/create')}
            whileHover={{ scale: 1.04 }}
            className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] transition-all"
            style={scrolled
              ? { backgroundColor: BG, color: LIME }
              : { backgroundColor: 'rgba(205,232,119,0.2)', color: LIME, border: `1px solid ${LIME}40` }
            }
          >
            <Plus size={12} strokeWidth={3} /> Nouvelle campagne
          </motion.button>
        </div>
      </motion.header>

      {/* ─── Banner with parallax ─── */}
      <div ref={bannerRef} className="relative w-full overflow-hidden" style={{ height: '80vh' }}>
        <motion.img
          src="https://images.pexels.com/photos/33687179/pexels-photo-33687179.jpeg"
          alt="Lumières du Sahel"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: bannerY, scale: 1.15 }}
          initial={{ scale: 1.2 }} animate={{ scale: 1.15 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 30%, rgba(24,48,40,0.82) 100%)' }} />

        {/* Edit banner hint */}
        <motion.button
          className="absolute top-20 right-6 text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >Modifier</motion.button>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 md:pb-14">
          {/* Certified */}
          <motion.div className="flex items-center gap-1.5 mb-4"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            <CheckCircle size={11} style={{ color: LIME }} />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: LIME }}>Organisation certifiée Qrowd</span>
          </motion.div>

          {/* Name */}
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              className="text-white font-medium leading-[0.9]"
              style={{ fontSize: 'clamp(44px, 8.5vw, 120px)', fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ y: '105%' }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              Lumières du Sahel
            </motion.h1>
          </div>

          {/* Sub info */}
          <motion.div className="flex flex-wrap gap-4 md:gap-8 mt-5"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          >
            {[
              { label: 'Catégorie', value: 'Éducation & Enfance' },
              { label: 'Zones d\'action', value: 'Sénégal · Mali · Burkina Faso' },
              { label: 'Fondée en', value: '2021' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-0.5">{item.label}</p>
                <p className="text-[13px] md:text-[14px] font-medium text-white/80">{item.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── Identity bar ─── */}
      <div className="px-6 md:px-12" style={{ backgroundColor: OFFWHITE }}>
        {/* Logo pulled up: relative wrapper with negative top on logo */}
        <div style={{ position: 'relative', paddingTop: '0' }}>
          <motion.div
            className="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-[24px] font-bold border-4 shadow-2xl"
            style={{ backgroundColor: BG, color: LIME, borderColor: OFFWHITE, position: 'relative', top: '-28px', marginBottom: '-12px', display: 'inline-flex' }}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1, type: 'spring', stiffness: 160 }}
          >LS</motion.div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6 border-b border-[#e0e0da]">
          <div>
            <p className="text-[18px] md:text-[22px] font-bold text-[#1a1a1a] leading-tight">Lumières du Sahel</p>
            <p className="text-[12px] text-[#aaa] mt-0.5">ONG humanitaire · Éducation & Enfance</p>
          </div>
          <div className="flex gap-6 md:gap-10">
            {[{ n: '38 400€', l: 'Collectés' }, { n: '486', l: 'Donateurs' }, { n: '3', l: 'Campagnes' }].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-[22px] font-bold leading-none" style={{ color: BG }}>{s.n}</p>
                <p className="text-[11px] text-[#bbb] mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="py-6 text-[15px] leading-[1.85] text-[#666] max-w-3xl border-b border-[#e0e0da]">
          Association humanitaire fondée en 2021, dédiée à l'accès à l'éducation pour les enfants des zones rurales du Sahel.
        </p>
      </div>

      {/* ─── Sticky Tabs bar ─── */}
      <div className="sticky top-[64px] z-40 border-b border-[#e0e0da] flex overflow-x-auto no-scrollbar" style={{ backgroundColor: 'rgba(242,241,236,0.95)', backdropFilter: 'blur(12px)' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className="relative py-4 px-6 md:px-8 text-[12px] md:text-[13px] font-bold tracking-[0.1em] transition-colors shrink-0"
            style={{ color: activeTab === i ? '#1a1a1a' : '#bbb' }}
          >
            {tab}
            {activeTab === i && (
              <motion.div layoutId="ngo-tab-final"
                className="absolute bottom-0 left-6 right-6 md:left-8 md:right-8 h-[2px] rounded-full"
                style={{ backgroundColor: BG }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">

        {/* TAB 0: Campagnes */}
        {activeTab === 0 && (
          <motion.div key="camps" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div ref={campsRef} className="px-6 md:px-12 pt-16 pb-20">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-2">— Nos campagnes</p>
                  <h2 className="font-medium text-[#1a1a1a] leading-[1.0]" style={{ fontSize: 'clamp(28px, 4.5vw, 58px)' }}>
                    Financer{' '}<em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>le changement</em>
                  </h2>
                </div>
                <button className="hidden sm:flex items-center gap-1.5 px-6 py-3.5 rounded-full text-[12px] font-bold tracking-[0.12em] hover:scale-105 transition-all shrink-0"
                  style={{ backgroundColor: BG, color: LIME }}
                ><Plus size={13} strokeWidth={3} /> Créer</button>
              </div>

              {/* Campaign list — editorial horizontal layout */}
              <div className="flex flex-col divide-y divide-[#e0e0da]">
                {CAMPAIGNS.map((c, i) => {
                  const pct = Math.min(Math.round((c.raised / c.goal) * 100), 100);
                  return (
                    <motion.div key={c.title}
                      className="group py-7 md:py-9 flex flex-col sm:flex-row sm:items-center gap-5 cursor-pointer"
                      animate={campsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                    >
                      {/* Index */}
                      <span className="text-[13px] font-bold tracking-[0.2em] text-[#ddd] shrink-0 w-8">0{i + 1}</span>

                      {/* Image */}
                      <div className="w-full sm:w-24 md:w-32 h-36 sm:h-[72px] rounded-xl overflow-hidden shrink-0">
                        <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] md:text-[20px] font-medium text-[#1a1a1a] leading-snug mb-3 group-hover:italic transition-all duration-300">{c.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: '#e8e8e3' }}>
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: LIME }}
                              animate={campsInView ? { width: `${pct}%` } : { width: 0 }}
                              transition={{ duration: 1.2, delay: 0.3 + i * 0.12 }}
                            />
                          </div>
                          <span className="text-[12px] font-bold shrink-0" style={{ color: BG }}>{pct}%</span>
                        </div>
                      </div>

                      {/* Raised + status */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[20px] md:text-[24px] font-bold leading-none" style={{ color: BG }}>{c.raised.toLocaleString('fr-FR')}€</p>
                          <p className="text-[11px] text-[#bbb] mt-0.5">{c.donors} donateurs</p>
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full"
                          style={c.days === 0
                            ? { backgroundColor: '#e8e8e2', color: '#888' }
                            : { backgroundColor: `${LIME}25`, color: BG }
                          }
                        >{c.days === 0 ? 'Terminée' : `${c.days}j restants`}</span>
                      </div>

                      {/* Arrow */}
                      <span className="text-[22px] font-light text-[#ccc] group-hover:text-[#1a1a1a] group-hover:translate-x-1 transition-all duration-300 hidden md:block">→</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 1: Mission + Quote */}
        {activeTab === 1 && (
          <motion.div key="mission" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="border-t border-[#e0e0da]">

              {/* Mission Statement (Dark) */}
              <div className="px-6 md:px-12 py-24 md:py-32 flex flex-col md:flex-row gap-16 md:gap-24" style={{ backgroundColor: BG }}>
                <div className="md:w-1/3 shrink-0">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#f2f1ec]/40 mb-8">— NOTRE VISION</p>
                  <motion.p className="text-[16px] leading-[1.8] text-white/70 max-w-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Depuis 2021, nous refusons que la géographie dicte l'avenir d'un enfant. Nos équipes s'investissent au cœur des communautés rurales pour bâtir des infrastructures durables et former les esprits de demain.
                  </motion.p>
                </div>
                <div className="md:w-2/3">
                  <h2 className="font-medium text-[#f2f1ec] leading-[1.05]" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
                    <span className="block overflow-hidden"><motion.span className="block" initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}>Garantir à chaque enfant</motion.span></span>
                    <span className="block overflow-hidden"><motion.span className="block" initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}>un accès inconditionnel à</motion.span></span>
                    <span className="block overflow-hidden"><motion.span className="block" initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}><em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: LIME }}>l'éducation.</em></motion.span></span>
                  </h2>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4" style={{ backgroundColor: OFFWHITE }}>
                {[
                  { n: '1.2K', l: 'Élèves scolarisés', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop' },
                  { n: '89%', l: 'Fonds reversés', img: 'https://images.pexels.com/photos/22601440/pexels-photo-22601440.jpeg' },
                  { n: '3', l: 'Pays d\'action', img: 'https://images.pexels.com/photos/17453654/pexels-photo-17453654.jpeg' },
                  { n: '48', l: 'Écoles construites', img: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=600&auto=format&fit=crop' },
                ].map((s, i) => (
                  <motion.div key={s.n} className="relative h-64 md:h-80 flex flex-col justify-end p-8 border-b border-[#e0e0da] group overflow-hidden"
                    style={{ borderRight: i !== 3 ? '1px solid #e0e0da' : 'none', backgroundColor: s.img ? '#000' : 'transparent' }}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  >
                    {s.img && (
                      <img src={s.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000" />
                    )}
                    <div className="relative z-10">
                      <p className="text-[42px] md:text-[56px] font-bold leading-none mb-1" style={{ color: s.img ? LIME : BG }}>{s.n}</p>
                      <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: s.img ? '#fff' : '#888' }}>{s.l}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quote Section */}
              <div className="px-6 md:px-12 py-32 flex flex-col items-center text-center bg-[#fafaf6]">
                <motion.div className="w-12 h-[2px] mb-12" style={{ backgroundColor: LIME }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                <div className="overflow-hidden mb-10">
                  <motion.blockquote
                    className="text-[#1a1a1a] leading-[1.1] max-w-5xl mx-auto font-medium"
                    style={{ fontSize: 'clamp(28px, 5vw, 64px)' }}
                    initial={{ y: '100%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                  >
                    "<em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>Notre combat</em> n'est pas seulement de construire des murs, mais d'éveiller des consciences."
                  </motion.blockquote>
                </div>
                <motion.p className="text-[11px] font-bold tracking-[0.25em] text-[#999] uppercase"
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
                >
                  — Aminata Coulibaly, Directrice
                </motion.p>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: Team */}
        {activeTab === 2 && (
          <motion.div key="team" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="border-t border-[#e0e0da] pb-32">
              <div className="px-6 md:px-12 py-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#aaa] mb-6">— NOTRE ÉQUIPE</p>
                  <h2 className="font-medium text-[#1a1a1a] leading-tight" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                    Les architectes du <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>changement</em>
                  </h2>
                </div>
                <p className="text-[15px] text-[#666] max-w-sm leading-relaxed">
                  Une équipe multidisciplinaire unie par une conviction commune : l'impact durable nécessite une expertise locale et un engagement sans faille.
                </p>
              </div>

              <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {TEAM.map((m, i) => (
                  <motion.div key={m.name} className="group cursor-pointer"
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }}
                  >
                    <div className="w-full overflow-hidden mb-6" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/5', backgroundColor: '#eeeee8' }}>
                      <img src={m.img} alt={m.name} className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[1.2s] ease-[0.25,0.46,0.45,0.94]" />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-1">{m.name}</h3>
                        <p className="text-[13px] font-semibold tracking-wider uppercase" style={{ color: LIME }}>{m.role}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-[#ddd] flex items-center justify-center text-[#1a1a1a] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <ArrowLeft size={14} className="rotate-135" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: Documents */}
        {activeTab === 3 && (
          <motion.div key="docs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="border-t border-[#e0e0da]">
              <div className="px-6 md:px-12 py-24 md:py-32">
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#aaa] mb-6">— TRANSPARENCE</p>
                <h2 className="font-medium text-[#1a1a1a] leading-tight mb-16" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                  Documents <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>officiels</em>
                </h2>

                <div className="border-t-2 border-[#1a1a1a]">
                  {[
                    { title: 'Statuts officiels et Acte de constitution', date: 'Juin 2021', size: '2.4 MB' },
                    { title: 'Récépissé de déclaration gouvernemental', date: 'Juillet 2021', size: '1.1 MB' },
                    { title: 'Rapport d\'activités annuel - Édition 2023', date: 'Mars 2024', size: '5.8 MB' },
                    { title: 'Rapport financier audité 2023', date: 'Avril 2024', size: '3.2 MB' },
                    { title: 'Certification d\'impact Qrowd', date: 'Mai 2024', size: '0.8 MB', highlight: true },
                  ].map((doc, i) => (
                    <motion.a href="#" key={i}
                      className="group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-[#e0e0da] transition-colors hover:bg-[#fafaf6] px-4 -mx-4"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }}
                    >
                      <div className="flex items-center gap-6 mb-4 md:mb-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors"
                          style={{ backgroundColor: doc.highlight ? LIME : '#eeeee8', color: BG }}
                        >
                          {doc.highlight ? <CheckCircle size={18} /> : <span className="text-[10px] font-bold">PDF</span>}
                        </div>
                        <div>
                          <h3 className="text-[18px] md:text-[22px] font-medium text-[#1a1a1a] mb-1 group-hover:text-[#cde877] transition-colors">{doc.title}</h3>
                          <div className="flex items-center gap-4 text-[13px] text-[#888]">
                            <span>Mis à jour : {doc.date}</span>
                            <span className="w-1 h-1 rounded-full bg-[#ccc]" />
                            <span>{doc.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.1em] text-[#1a1a1a] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        TÉLÉCHARGER <ArrowLeft size={14} className="-rotate-90" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
