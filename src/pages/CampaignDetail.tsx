import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Users, Clock, Target } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useNavigate } from 'react-router-dom';

const BG = '#183028';
const LIME = '#cde877';
const OFFWHITE = '#f2f1ec';

/* ── Masked line reveal ── */
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


interface Campaign {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  heroImg: string;
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  ngoName: string;
  ngoCountry: string;
  description: string[];
  quote: string;
  quoteAuthor: string;
  breakdown: { label: string; pct: number }[];
  gallery: string[];
}

interface CampaignDetailProps {
  campaign: Campaign;
}

const RELATED = [
  { img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=600&auto=format&fit=crop', category: 'Eau & Alimentation', title: 'Puits et systèmes d\'irrigation au Mali', raised: 14200, goal: 25000 },
  { img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600&auto=format&fit=crop', category: 'Droits humains', title: 'Centre juridique pour femmes victimes', raised: 8900, goal: 20000 },
  { img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop', category: 'Santé', title: 'Vaccinations dans les zones de conflit', raised: 31500, goal: 45000 },
];

export default function CampaignDetail({ campaign }: CampaignDetailProps) {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [donationAmount, setDonationAmount] = useState(50);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const pct = Math.round((campaign.raised / campaign.goal) * 100);
  const { ref: bodyRef, inView: bodyInView } = useInView(0.1);
  const { ref: quoteRef, inView: quoteInView } = useInView(0.2);
  const { ref: breakRef, inView: breakInView } = useInView(0.15);
  const { ref: relRef, inView: relInView } = useInView(0.1);

  return (
    <div style={{ backgroundColor: OFFWHITE, minHeight: '100vh' }}>

      {/* ── Full-bleed Parallax Hero ── */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: '100vh' }}>
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img src={campaign.heroImg} alt={campaign.title} className="w-full h-full object-cover scale-110" />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/75" />

        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-[13px] font-semibold tracking-[0.12em]">RETOUR</span>
        </motion.button>

        {/* Category + brand */}
        <motion.div
          className="absolute top-8 right-10 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div
            className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(205,232,119,0.18)', color: LIME, backdropFilter: 'blur(8px)', border: '1px solid rgba(205,232,119,0.3)' }}
          >
            {campaign.category}
          </div>
        </motion.div>

        {/* Hero content bottom */}
        <motion.div className="absolute bottom-0 left-0 right-0 px-10 pb-14" style={{ opacity: heroOpacity }}>
          <motion.h1
            className="text-white leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(48px, 6.5vw, 100px)' }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <span className="font-medium block">{campaign.title.split(' ').slice(0, 3).join(' ')}</span>
            <em className="font-['Cormorant_Garamond'] italic font-normal block" style={{ color: LIME }}>
              {campaign.title.split(' ').slice(3).join(' ')}
            </em>
          </motion.h1>
          <motion.p
            className="text-white/60 text-[16px] font-medium max-w-[480px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
          >
            {campaign.subtitle}
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="absolute right-10 bottom-14 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 rotate-90 mb-3">SCROLL</span>
            <div className="w-px h-12 bg-white/20 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 right-0 bg-white"
                animate={{ y: ['0%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ height: '40%' }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Funding strip ── */}
      <section style={{ backgroundColor: BG }} className="px-10 py-12">
        {/* Full-width progress bar */}
        <div className="relative w-full h-[3px] bg-white/10 mb-10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: LIME }}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        <div className="grid grid-cols-4 gap-0 items-center">
          {/* Raised */}
          <div className="border-r border-white/10 pr-8">
            <div className="text-[42px] font-bold leading-none mb-2 tabular-nums" style={{ color: LIME }}>
              {campaign.raised.toLocaleString('fr-FR')}€
            </div>
            <p className="text-[13px] text-[#f2f1ec]/50 tracking-wide">collectés sur {campaign.goal.toLocaleString('fr-FR')}€</p>
          </div>

          {/* Donors */}
          <div className="border-r border-white/10 px-8 flex items-center gap-3">
            <Users size={22} className="text-[#f2f1ec]/30 shrink-0" />
            <div>
              <div className="text-[32px] font-bold leading-none mb-1 text-[#f2f1ec]">{campaign.donors.toLocaleString('fr-FR')}</div>
              <p className="text-[13px] text-[#f2f1ec]/50">donateurs</p>
            </div>
          </div>

          {/* Days left */}
          <div className="border-r border-white/10 px-8 flex items-center gap-3">
            <Clock size={22} className="text-[#f2f1ec]/30 shrink-0" />
            <div>
              <div className="text-[32px] font-bold leading-none mb-1 text-[#f2f1ec]">{campaign.daysLeft}</div>
              <p className="text-[13px] text-[#f2f1ec]/50">jours restants</p>
            </div>
          </div>

          {/* CTA */}
          <div className="pl-8 flex flex-col gap-3">
            <div className="flex gap-2 mb-2">
              {[25, 50, 100, 250].map((a) => (
                <button
                  key={a}
                  onClick={() => setDonationAmount(a)}
                  className="flex-1 py-2 rounded-full text-[12px] font-bold transition-all"
                  style={donationAmount === a
                    ? { backgroundColor: LIME, color: BG }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', color: '#f2f1ec' }}
                >
                  {a}€
                </button>
              ))}
            </div>
            <button
              className="w-full py-4 rounded-full text-[13px] font-bold tracking-[0.15em] flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              style={{ backgroundColor: LIME, color: BG }}
            >
              FAIRE UN DON — {donationAmount}€ <ArrowUpRight size={15} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Campaign body ── */}
      <section ref={bodyRef} className="px-10 py-24 grid grid-cols-[1fr_380px] gap-20" style={{ backgroundColor: OFFWHITE }}>
        {/* Left: Description */}
        <div>
          <div className="mb-8">
            <LineReveal delay={0} inView={bodyInView}>
              <h2 className="text-[#1a1a1a] font-medium leading-[1.1]" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
                Pourquoi cette campagne{' '}
                <em className="font-['Cormorant_Garamond'] italic">est essentielle.</em>
              </h2>
            </LineReveal>
          </div>
          {campaign.description.map((para, i) => (
            <motion.p
              key={i}
              className="text-[17px] leading-[1.75] text-[#444] mb-6"
              animate={bodyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.1 }}
            >
              {para}
            </motion.p>
          ))}
        </div>

        {/* Right: Info card */}
        <motion.div
          className="sticky top-28 self-start"
          animate={bodyInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="rounded-sm overflow-hidden" style={{ backgroundColor: BG }}>
            <div className="p-8">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6" style={{ color: LIME }}>
                À propos de l'ONG
              </p>
              <h3 className="text-[22px] font-semibold text-[#f2f1ec] mb-2">{campaign.ngoName}</h3>
              <p className="text-[14px] text-[#f2f1ec]/50 mb-8 flex items-center gap-2">
                <Target size={14} /> {campaign.ngoCountry}
              </p>
              <div className="w-full h-px bg-white/10 mb-8" />
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#f2f1ec]/50">Vérifiée par Qrowd</span>
                  <span className="font-bold" style={{ color: LIME }}>✓ Certifiée</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#f2f1ec]/50">Fonds reversés</span>
                  <span className="font-bold text-[#f2f1ec]">100%</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#f2f1ec]/50">Campagnes passées</span>
                  <span className="font-bold text-[#f2f1ec]">4 réussies</span>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <button className="w-full py-4 rounded-full text-[13px] font-bold tracking-[0.12em] text-[#f2f1ec] border border-white/20 hover:border-[#cde877] hover:text-[#cde877] transition-all">
                VOIR L'ONG <ArrowUpRight size={13} strokeWidth={3} className="inline ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Editorial quote ── */}
      <section ref={quoteRef} className="px-10 py-24" style={{ backgroundColor: '#f5f4ef' }}>
        <div className="max-w-[900px] mx-auto text-center">
          <motion.div
            animate={quoteInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.8 }}
            className="w-16 h-[2px] mx-auto mb-12"
            style={{ backgroundColor: LIME }}
          />
          <h2 className="text-[#1a1a1a] leading-[1.2] mb-8" style={{ fontSize: 'clamp(28px, 3.5vw, 52px)' }}>
            <LineReveal delay={0.1} inView={quoteInView}>
              <em className="font-['Cormorant_Garamond'] italic font-normal">"{campaign.quote}"</em>
            </LineReveal>
          </h2>
          <motion.p
            className="text-[14px] font-semibold tracking-[0.2em] uppercase text-[#888]"
            animate={quoteInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            — {campaign.quoteAuthor}
          </motion.p>
        </div>
      </section>

      {/* ── Funds breakdown ── */}
      <section ref={breakRef} className="px-10 py-24" style={{ backgroundColor: OFFWHITE }}>
        <div className="grid grid-cols-2 gap-20 items-center">
          <div>
            <LineReveal delay={0} inView={breakInView}>
              <h2 className="text-[#1a1a1a] font-medium leading-[1.1] mb-12" style={{ fontSize: 'clamp(28px, 3.5vw, 50px)' }}>
                Comment les fonds <em className="font-['Cormorant_Garamond'] italic">sont utilisés.</em>
              </h2>
            </LineReveal>
            <div className="flex flex-col gap-6">
              {campaign.breakdown.map((item, i) => (
                <motion.div
                  key={item.label}
                  animate={breakInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[15px] font-medium text-[#333]">{item.label}</span>
                    <span className="text-[15px] font-bold" style={{ color: BG }}>{item.pct}%</span>
                  </div>
                  <div className="w-full h-[2px] bg-[#e0e0db] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: i === 0 ? LIME : i === 1 ? BG : '#aac96a' }}
                      initial={{ width: 0 }}
                      animate={breakInView ? { width: `${item.pct}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Gallery 2-col */}
          <div className="grid grid-cols-2 gap-3" style={{ height: '480px' }}>
            {campaign.gallery.slice(0, 4).map((img, i) => (
              <motion.div
                key={i}
                className="overflow-hidden rounded-sm"
                style={{ height: i % 2 === 0 ? '55%' : '45%', alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' }}
                animate={breakInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.1 }}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1.2s]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related campaigns ── */}
      <section ref={relRef} style={{ backgroundColor: BG }} className="px-10 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-[#f2f1ec] font-medium" style={{ fontSize: 'clamp(24px, 3vw, 42px)' }}>
            <LineReveal delay={0} inView={relInView}>Autres causes à <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>soutenir</em></LineReveal>
          </h2>
          <motion.a
            href="#"
            className="text-[13px] font-semibold text-[#f2f1ec]/50 hover:text-[#cde877] transition-colors"
            animate={relInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            Toutes les campagnes →
          </motion.a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {RELATED.map((c, i) => (
            <motion.div
              key={i}
              className="group relative overflow-hidden rounded-sm cursor-pointer"
              style={{ height: '320px' }}
              animate={relInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.9, delay: i * 0.1 }}
            >
              <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(205,232,119,0.2)', color: LIME, border: '1px solid rgba(205,232,119,0.3)' }}>
                  {c.category}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white text-[17px] font-medium leading-snug mb-3">{c.title}</h3>
                <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${Math.round((c.raised / c.goal) * 100)}%`, backgroundColor: LIME }} />
                </div>
                <div className="flex justify-between text-[12px]">
                  <span style={{ color: LIME }} className="font-bold">{c.raised.toLocaleString('fr-FR')}€</span>
                  <span className="text-white/40">/ {c.goal.toLocaleString('fr-FR')}€</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Fixed donation CTA ── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 px-10 py-5 flex items-center justify-between border-t border-white/5"
        style={{ backgroundColor: 'rgba(24,48,40,0.95)', backdropFilter: 'blur(20px)' }}
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div>
          <p className="text-[#f2f1ec]/50 text-[12px] tracking-wide mb-1">Campagne en cours</p>
          <p className="text-[#f2f1ec] font-semibold text-[16px]">{campaign.title}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[13px] text-[#f2f1ec]/50">{pct}% atteint</div>
            <div className="text-[20px] font-bold" style={{ color: LIME }}>{campaign.raised.toLocaleString('fr-FR')}€</div>
          </div>
          <button
            className="flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-bold tracking-[0.15em] hover:brightness-110 transition-all"
            style={{ backgroundColor: LIME, color: BG }}
          >
            FAIRE UN DON <ArrowUpRight size={15} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
