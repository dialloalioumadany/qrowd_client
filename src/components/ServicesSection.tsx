import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useInView } from '@/hooks/useInView';

const OFFWHITE = '#f2f1ec';
const LIME = '#cde877';
const BG = '#183028';

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

const steps = [
  {
    num: '01',
    label: 'Explorez',
    title: 'Découvrez des causes qui comptent',
    desc: 'Parcourez des dizaines de campagnes vérifiées dans des domaines variés : éducation, santé, environnement, droits humains...',
    img: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=800&auto=format&fit=crop',
  },
  {
    num: '02',
    label: 'Choisissez',
    title: 'Sélectionnez votre cause',
    desc: 'Chaque campagne est certifiée par nos équipes. Lisez les rapports d\'audit, les objectifs et l\'historique de l\'ONG avant de décider.',
    img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format&fit=crop',
  },
  {
    num: '03',
    label: 'Donnez',
    title: 'Faites un don en toute sécurité',
    desc: 'Paiement 100% sécurisé via Stripe. Montant libre ou prédéfini. Reçu fiscal automatique. Zéro frais cachés pour le donateur.',
    img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop',
  },
  {
    num: '04',
    label: 'Suivez',
    title: 'Mesurez votre impact dans le temps',
    desc: 'Recevez des mises à jour régulières de l\'ONG : photos de terrain, rapports d\'avancement, et bilan final 6 mois après la clôture.',
    img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop',
  },
  {
    num: '05',
    label: 'Partagez',
    title: 'Amplifiez l\'impact en partageant',
    desc: 'Chaque partage génère en moyenne 3 dons supplémentaires. Devenez ambassadeur de la cause et multipliez son rayonnement.',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
  },
];

export default function ServicesSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  const { ref: headRef, inView: headInView } = useInView(0.15);
  const { ref: stepsRef, inView: stepsInView } = useInView(0.1);
  const { ref: ctaRef, inView: ctaInView } = useInView(0.2);
  const { ref: footRef, inView: footInView } = useInView(0.15);

  return (
    <>
      {/* ── Process section ── */}
      <section style={{ backgroundColor: OFFWHITE }}>

        {/* Label row */}
        <div className="px-10 pt-20 pb-14">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-bold tracking-[0.3em] text-[#999] uppercase">03 — Comment ça marche</span>
            <div className="flex-1 h-px bg-[#ccc]" />
          </motion.div>
        </div>

        {/* 2-col layout: sticky heading + steps list */}
        <div ref={stepsRef} className="grid grid-cols-[1fr_1.2fr] gap-0 px-10 pb-28 items-start">

          {/* Left: sticky heading + floating image */}
          <div className="sticky top-28 pr-16">
            <div ref={headRef}>
              <h2
                className="font-medium leading-[1.05] text-[#1a1a1a] mb-12"
                style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}
              >
                <LineReveal delay={0} inView={headInView}>Comment</LineReveal>
                <LineReveal delay={0.1} inView={headInView}>
                  <em className="font-['Cormorant_Garamond'] italic" style={{ color: BG }}>fonctionne</em>
                </LineReveal>
                <LineReveal delay={0.2} inView={headInView}>Qrowd ?</LineReveal>
              </h2>
            </div>

            {/* Floating image on hover */}
            <div className="relative overflow-hidden rounded-sm" style={{ height: '340px' }}>
              <AnimatePresence mode="wait">
                {hovered !== null && (
                  <motion.img
                    key={hovered}
                    src={steps[hovered].img}
                    alt={steps[hovered].title}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                )}
              </AnimatePresence>

              {/* Default state — no hover */}
              {hovered === null && (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ backgroundColor: '#eeeee8' }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: BG }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </motion.div>
                  <span className="text-[12px] font-semibold tracking-[0.2em] text-[#999] uppercase">Survolez une étape</span>
                </div>
              )}

              {/* Step label overlay */}
              <AnimatePresence>
                {hovered !== null && (
                  <motion.div
                    className="absolute top-5 left-5 flex items-center gap-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full"
                      style={{ backgroundColor: 'rgba(205,232,119,0.25)', color: LIME, backdropFilter: 'blur(8px)', border: '1px solid rgba(205,232,119,0.4)' }}
                    >
                      Étape {steps[hovered].num}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: process steps list */}
          <div className="divide-y divide-[#ddd]">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                animate={stepsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group py-8 cursor-default"
              >
                <div className="flex items-start gap-6">
                  {/* Number */}
                  <span
                    className="text-[12px] font-bold tracking-[0.2em] mt-1 shrink-0 transition-colors duration-300"
                    style={{ color: hovered === i ? LIME : '#bbb' }}
                  >
                    {step.num}
                  </span>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-[26px] font-medium text-[#1a1a1a] leading-tight transition-all duration-300"
                        style={{ fontStyle: hovered === i ? 'italic' : 'normal' }}
                      >
                        {step.title}
                      </h3>
                      <motion.span
                        className="text-[22px] font-light text-[#1a1a1a]"
                        animate={{ opacity: hovered === i ? 1 : 0, x: hovered === i ? 0 : -10 }}
                        transition={{ duration: 0.25 }}
                      >
                        →
                      </motion.span>
                    </div>

                    {/* Description — slides in on hover */}
                    <motion.div
                      animate={hovered === i
                        ? { height: 'auto', opacity: 1, marginTop: 8 }
                        : { height: 0, opacity: 0, marginTop: 0 }
                      }
                      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="text-[15px] text-[#666] leading-[1.7] max-w-[520px]">
                        {step.desc}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA row */}
            <motion.div
              ref={ctaRef}
              className="pt-10"
              animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-[13px] font-bold tracking-[0.15em] transition-all"
                style={{ backgroundColor: BG, color: LIME }}
              >
                LANCER UNE CAMPAGNE
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Full-bleed campaign CTA ── */}
      <section className="relative overflow-hidden" style={{ height: '60vh' }}>
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop"
          alt="Ensemble"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(24,48,40,0.72)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <motion.h2
            className="font-medium text-white leading-[1.05] mb-8"
            style={{ fontSize: 'clamp(40px, 6vw, 90px)' }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          >
            Prêt à faire <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>la différence</em> ?
          </motion.h2>
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <a
              href="#"
              className="flex items-center gap-2 px-10 py-5 rounded-full text-[13px] font-bold tracking-[0.15em] hover:brightness-110 transition-all"
              style={{ backgroundColor: LIME, color: BG }}
            >
              FAIRE UN DON
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-10 py-5 rounded-full text-[13px] font-bold tracking-[0.15em] border border-white/30 text-white hover:border-[#cde877] hover:text-[#cde877] transition-all"
            >
              LANCER UNE CAMPAGNE
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer ref={footRef} style={{ backgroundColor: BG }} className="px-10 pt-20 pb-24">
        <div className="grid grid-cols-2 gap-16 items-start mb-16">
          <div>
            <h2
              className="font-medium leading-[1.1] text-[#f2f1ec] mb-12"
              style={{ fontSize: 'clamp(32px, 4vw, 58px)' }}
            >
              <LineReveal delay={0} inView={footInView}>Ensemble, finançons</LineReveal>
              <LineReveal delay={0.1} inView={footInView}>
                <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>le changement.</em>
              </LineReveal>
            </h2>
          </div>
          <motion.div
            className="flex flex-col gap-4 pt-4"
            animate={footInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <a href="mailto:dialloalioumadany@gmail.com" className="text-[18px] font-medium text-[#f2f1ec] hover:text-[#cde877] transition-colors">dialloalioumadany@gmail.com</a>
            <a href="tel:+22382111174" className="text-[18px] font-medium text-[#f2f1ec] hover:text-[#cde877] transition-colors">+223 82 11 11 74</a>
            <p className="text-[15px] text-[#f2f1ec]/50 mt-2">Bamako, Mali — Dakar, Sénégal</p>
          </motion.div>
        </div>

        <div className="w-full h-px bg-white/10 mb-10" />

        <motion.div
          className="flex justify-between items-end"
          animate={footInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col gap-2 text-[#f2f1ec]/40 text-[13px]">
            <span className="text-[20px] font-bold" style={{ color: LIME }}>Qrowd</span>
            <span>© 2026 — Plateforme de financement solidaire</span>
          </div>
          <nav className="flex gap-8">
            {['Accueil', 'Campagnes', 'Comment ça marche', 'À propos'].map((item) => (
              <a key={item} href="#" className="text-[14px] font-medium text-[#f2f1ec]/60 hover:text-[#cde877] transition-colors">
                {item}
              </a>
            ))}
          </nav>
          <a href="#" className="text-[14px] font-semibold text-[#f2f1ec]/60 hover:text-[#cde877] transition-colors flex items-center gap-1">
            LinkedIn
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </a>
        </motion.div>
      </footer>
    </>
  );
}
