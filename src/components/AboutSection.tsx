import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from '@/hooks/useInView';

const OFFWHITE = '#f2f1ec';
const LIME = '#cde877';
const BG = '#183028';

/* ── Masked line reveal ── */
function LineReveal({ children, delay = 0, inView }: { children: React.ReactNode; delay?: number; inView: boolean }) {
  return (
    <div style={{ overflow: 'hidden', display: 'block' }}>
      <motion.div
        animate={inView ? { y: 0 } : { y: '105%' }}
        transition={{ duration: 1.05, delay, ease: [0.76, 0, 0.24, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

const values = [
  {
    num: '01',
    title: 'Transparence',
    body: '89% des fonds collectés sont reversés directement aux ONG partenaires, vérifiés et certifiés par nos équipes.',
    highlight: '89%',
  },
  {
    num: '02',
    title: 'Impact réel',
    body: 'Chaque campagne est sélectionnée après un audit terrain rigoureux. Nous ne publions que des causes dont l\'impact est mesurable.',
    highlight: '100%',
  },
  {
    num: '03',
    title: 'Confiance',
    body: 'Nos donateurs reçoivent un rapport de résultats 6 mois après chaque campagne close. Zéro frais cachés.',
    highlight: '4.8★',
  },
];

export default function AboutSection() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const { ref: manifestoRef, inView: manifestoInView } = useInView(0.12);
  const { ref: valuesRef, inView: valuesInView } = useInView(0.15);
  const { ref: closingRef, inView: closingInView } = useInView(0.2);

  return (
    <section style={{ backgroundColor: OFFWHITE }} className="overflow-hidden">

      {/* ── 01: Section label + Manifesto ── */}
      <div ref={manifestoRef} className="px-10 pt-24 pb-20">
        {/* Label row */}
        <motion.div
          className="flex items-center gap-4 mb-16"
          animate={manifestoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-[11px] font-bold tracking-[0.3em] text-[#999] uppercase">02 — À propos</span>
          <div className="flex-1 h-px bg-[#ccc]" />
        </motion.div>

        {/* Massive manifesto */}
        <h2
          className="font-medium leading-[1.05] text-[#1a1a1a]"
          style={{ fontSize: 'clamp(36px, 5.5vw, 80px)', maxWidth: '1200px' }}
        >
          <LineReveal delay={0.05} inView={manifestoInView}>
            Nous croyons que{' '}
            <em className="font-['Cormorant_Garamond'] italic not-italic" style={{ color: BG }}>
              chaque cause
            </em>{' '}
            mérite
          </LineReveal>
          <LineReveal delay={0.15} inView={manifestoInView}>
            d'être entendue — et que{' '}
            <em className="font-['Cormorant_Garamond'] italic" style={{ color: BG }}>
              chaque don
            </em>
          </LineReveal>
          <LineReveal delay={0.25} inView={manifestoInView}>
            peut transformer une vie pour toujours.
          </LineReveal>
        </h2>
      </div>

      {/* ── 02: Full-width cinematic image with parallax ── */}
      <div
        ref={imgRef}
        className="relative w-full overflow-hidden"
        style={{ height: '70vh' }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000&auto=format&fit=crop"
          alt="Impact Qrowd"
          className="w-full h-full object-cover"
          style={{ y: imgY, scale: 1.12 }}
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/15" />

        {/* Caption overlay */}
        <motion.div
          className="absolute bottom-8 right-10 text-right"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-[12px] font-semibold tracking-[0.2em] text-white/60 uppercase mb-1">
            Mission terrain
          </p>
          <p className="text-[15px] font-medium text-white/90">
            Burkina Faso, 2024 — Projet Lumières du Sahel
          </p>
        </motion.div>
      </div>

      {/* ── 03: Values grid ── */}
      <div ref={valuesRef} className="px-10 pt-0">
        <div className="divide-y divide-[#e0e0da]">
          {values.map((v, i) => (
            <motion.div
              key={v.num}
              className="grid grid-cols-[80px_1fr_1fr_200px] gap-10 items-center py-12 group"
              animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Number */}
              <span className="text-[13px] font-bold tracking-[0.2em] text-[#bbb]">{v.num}</span>

              {/* Title */}
              <h3
                className="text-[32px] font-medium text-[#1a1a1a] group-hover:italic transition-all duration-300"
                style={{ fontFamily: 'inherit' }}
              >
                {v.title}
              </h3>

              {/* Body */}
              <p className="text-[15px] leading-[1.7] text-[#666] max-w-[420px]">
                {v.body}
              </p>

              {/* Highlight stat */}
              <div className="text-right">
                <span
                  className="text-[48px] font-bold leading-none"
                  style={{ color: BG }}
                >
                  {v.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 04: Closing statement + CTA ── */}
      <div
        ref={closingRef}
        className="px-10 py-28 grid grid-cols-2 gap-20 items-end"
        style={{ backgroundColor: BG }}
      >
        {/* Left: large closing line */}
        <div>
          <h2
            className="font-medium leading-[1.1] text-[#f2f1ec]"
            style={{ fontSize: 'clamp(32px, 4vw, 58px)' }}
          >
            <LineReveal delay={0} inView={closingInView}>Fondée en 2023,</LineReveal>
            <LineReveal delay={0.1} inView={closingInView}>
              Qrowd a déjà permis de{' '}
            </LineReveal>
            <LineReveal delay={0.18} inView={closingInView}>
              <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>
                financer 340 causes
              </em>
            </LineReveal>
            <LineReveal delay={0.26} inView={closingInView}>
              à travers 28 pays.
            </LineReveal>
          </h2>
        </div>

        {/* Right: CTA + quick facts */}
        <motion.div
          className="flex flex-col gap-8"
          animate={closingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <p className="text-[17px] leading-[1.7] text-[#f2f1ec]/60 max-w-[440px]">
            Qrowd est une plateforme de financement participatif dédiée aux ONG et associations humanitaires. Notre mission : rendre le don simple, transparent, et impactant.
          </p>
          <div className="flex gap-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-bold tracking-[0.15em] transition-all"
              style={{ backgroundColor: LIME, color: BG }}
            >
              NOTRE HISTOIRE →
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.04 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-bold tracking-[0.15em] border border-white/20 text-[#f2f1ec] transition-all hover:border-[#cde877] hover:text-[#cde877]"
            >
              NOS ONG PARTENAIRES
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
