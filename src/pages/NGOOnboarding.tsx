import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BG = '#183028';
const LIME = '#cde877';
const OFFWHITE = '#f2f1ec';

const STEPS = [
  { num: 1, label: 'Identité visuelle' },
  { num: 2, label: 'Présentation' },
  { num: 3, label: 'Documents' },
  { num: 4, label: 'Réseaux sociaux' },
];

export default function NGOOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [docs, setDocs] = useState<string[]>([]);
  const bannerInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: BG }}>

      {/* ── Left panel: context ── */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 p-10 border-r border-white/[0.08]">
        {/* Top */}
        <div>
          <span className="text-[20px] font-bold" style={{ color: LIME }}>Qrowd</span>
        </div>

        {/* Steps nav */}
        <div className="flex flex-col gap-6">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/30">Configuration du profil ONG</p>
          {STEPS.map((s, i) => (
            <motion.button key={s.num} onClick={() => goTo(i)}
              className="flex items-center gap-4 text-left group"
              animate={{ opacity: i <= step ? 1 : 0.3 }} transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-all"
                style={i < step
                  ? { backgroundColor: LIME, color: BG }
                  : i === step
                    ? { backgroundColor: 'rgba(205,232,119,0.15)', color: LIME, border: `2px solid ${LIME}` }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '2px solid rgba(255,255,255,0.1)' }
                }
              >
                {i < step ? <CheckCircle size={14} /> : s.num}
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: i === step ? 'white' : 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Bottom */}
        <div>
          <button onClick={() => navigate('/ngo/profile')} className="text-[12px] font-semibold text-white/25 hover:text-white/50 transition-colors">
            Ignorer pour l'instant →
          </button>
        </div>
      </div>

      {/* ── Right: step content ── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: OFFWHITE }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#e0e0da] shrink-0">
          <button onClick={() => navigate('/ngo/profile')} className="flex items-center gap-2 text-[#bbb] hover:text-[#666] transition-colors">
            <ArrowLeft size={15} />
            <span className="text-[11px] font-bold tracking-[0.15em]">IGNORER</span>
          </button>

          {/* Mobile step indicator */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i === step ? '24px' : '6px', backgroundColor: i <= step ? BG : '#ddd' }}
              />
            ))}
          </div>

          <span className="text-[12px] font-bold tracking-[0.15em] text-[#bbb]">{step + 1} / {STEPS.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] shrink-0" style={{ backgroundColor: '#e8e8e3' }}>
          <motion.div className="h-full" style={{ backgroundColor: BG }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div key={step} custom={direction}
              variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 overflow-y-auto no-scrollbar px-6 md:px-12 lg:px-16 py-10"
              data-lenis-prevent="true"
            >

              {/* ── STEP 0: Identité visuelle ── */}
              {step === 0 && (
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-3">Étape 1 · Identité visuelle</p>
                  <h2 className="text-[28px] md:text-[36px] font-medium text-[#1a1a1a] leading-tight mb-2">
                    Donnez un visage à <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', color: BG }}>votre ONG</em>
                  </h2>
                  <p className="text-[14px] text-[#999] mb-10 leading-relaxed">La bannière et le logo sont les premiers éléments que verront vos donateurs.</p>

                  {/* Banner upload */}
                  <div className="mb-8">
                    <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#aaa] mb-3">Bannière de couverture</p>
                    <input ref={bannerInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setBannerPreview)} />
                    <button onClick={() => bannerInput.current?.click()}
                      className="w-full rounded-2xl border-2 border-dashed transition-all hover:border-[#aaa] overflow-hidden"
                      style={{ borderColor: '#ddd', backgroundColor: '#fafaf6', aspectRatio: '16/5', position: 'relative' }}
                    >
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eee' }}>
                            <Upload size={20} style={{ color: '#aaa' }} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#999]">Cliquer pour uploader</p>
                            <p className="text-[12px] text-[#ccc] mt-0.5">PNG, JPG · Recommandé : 1400 × 400px</p>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Logo upload */}
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#aaa] mb-3">Logo / Photo de profil</p>
                    <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setLogoPreview)} />
                    <div className="flex items-center gap-6">
                      <button onClick={() => logoInput.current?.click()}
                        className="w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:border-[#aaa] overflow-hidden shrink-0"
                        style={{ borderColor: '#ddd', backgroundColor: '#fafaf6' }}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <><Upload size={18} style={{ color: '#ccc' }} /><span className="text-[10px] text-[#ccc] font-semibold">LOGO</span></>
                        )}
                      </button>
                      <div>
                        <p className="text-[14px] font-semibold text-[#666]">Format carré recommandé</p>
                        <p className="text-[13px] text-[#bbb] mt-1">Min. 200 × 200px · PNG ou JPG</p>
                        <button onClick={() => logoInput.current?.click()}
                          className="mt-3 text-[12px] font-bold tracking-[0.1em] px-5 py-2.5 rounded-full border-2 hover:scale-105 transition-all"
                          style={{ borderColor: BG, color: BG }}
                        >CHOISIR UN FICHIER</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1: Présentation ── */}
              {step === 1 && (
                <div className="max-w-2xl flex flex-col gap-8">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-3">Étape 2 · Présentation</p>
                    <h2 className="text-[28px] md:text-[36px] font-medium text-[#1a1a1a] leading-tight mb-2">
                      Racontez votre <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', color: BG }}>histoire</em>
                    </h2>
                    <p className="text-[14px] text-[#999] leading-relaxed">Ces informations apparaîtront sur votre page de profil public.</p>
                  </div>

                  {[
                    { label: "Nom officiel de l'ONG", placeholder: "Lumières du Sahel", type: "text" },
                    { label: "Slogan ou tagline", placeholder: "Éduquer pour transformer", type: "text" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#aaa] mb-3">{f.label}</label>
                      <div className="border-b-2 border-[#ddd] pb-2 focus-within:border-[#183028] transition-colors">
                        <input type={f.type} placeholder={f.placeholder} className="w-full bg-transparent text-[16px] text-[#1a1a1a] outline-none placeholder-[#ccc]" />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#aaa] mb-3">Catégorie</label>
                    <div className="flex flex-wrap gap-2">
                      {['Éducation & Enfance', 'Santé', 'Environnement', 'Humanitaire', 'Droits humains', 'Eau & Alimentation'].map(cat => (
                        <button key={cat}
                          className="px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all hover:scale-105"
                          style={{ borderColor: '#e0e0da', color: '#888' }}
                          onClick={e => {
                            const btn = e.currentTarget;
                            const active = btn.style.backgroundColor === BG;
                            btn.style.backgroundColor = active ? 'transparent' : BG;
                            btn.style.color = active ? '#888' : LIME;
                            btn.style.borderColor = active ? '#e0e0da' : BG;
                          }}
                        >{cat}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#aaa] mb-3">Description de la mission</label>
                    <div className="border-b-2 border-[#ddd] pb-2 focus-within:border-[#183028] transition-colors">
                      <textarea rows={4} placeholder="Décrivez votre mission, vos valeurs et vos actions sur le terrain..."
                        className="w-full bg-transparent text-[15px] text-[#1a1a1a] outline-none placeholder-[#ccc] resize-none leading-relaxed"
                      />
                    </div>
                    <p className="text-[11px] text-[#ccc] mt-2">Maximum 500 caractères</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: "Pays du siège social", placeholder: "Sénégal" },
                      { label: "Année de fondation", placeholder: "2021" },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-[11px] font-bold tracking-[0.15em] uppercase text-[#aaa] mb-3">{f.label}</label>
                        <div className="border-b-2 border-[#ddd] pb-2 focus-within:border-[#183028] transition-colors">
                          <input type="text" placeholder={f.placeholder} className="w-full bg-transparent text-[16px] text-[#1a1a1a] outline-none placeholder-[#ccc]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP 2: Documents ── */}
              {step === 2 && (
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-3">Étape 3 · Documents légaux</p>
                  <h2 className="text-[28px] md:text-[36px] font-medium text-[#1a1a1a] leading-tight mb-2">
                    Établissez votre <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', color: BG }}>crédibilité</em>
                  </h2>
                  <p className="text-[14px] text-[#999] mb-10 leading-relaxed">Ces documents sont vérifiés par l'équipe Qrowd sous 72h avant publication.</p>

                  <div className="flex flex-col gap-5">
                    {[
                      { label: 'Statuts officiels', desc: 'Acte de constitution · PDF requis', required: true },
                      { label: 'Récépissé de déclaration', desc: 'Délivré par les autorités compétentes · PDF requis', required: true },
                      { label: 'Rapport d\'activités', desc: 'Dernier rapport annuel disponible · PDF ou DOCX', required: false },
                      { label: 'Rapport financier', desc: 'Bilan comptable ou attestation CAC · PDF', required: false },
                    ].map((doc, i) => {
                      const uploaded = docs.includes(doc.label);
                      return (
                        <motion.div key={doc.label}
                          className="flex items-center justify-between p-5 rounded-2xl border-2 transition-all"
                          style={{ borderColor: uploaded ? LIME : '#e8e8e3', backgroundColor: uploaded ? `${LIME}0d` : '#fafaf6' }}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                              style={{ backgroundColor: uploaded ? `${LIME}25` : '#eee' }}
                            >📄</div>
                            <div>
                              <p className="text-[14px] font-bold text-[#1a1a1a]">{doc.label}</p>
                              <p className="text-[12px] text-[#aaa] mt-0.5">{doc.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {doc.required && !uploaded && (
                              <span className="text-[10px] font-bold tracking-[0.1em] text-[#e08060]">REQUIS</span>
                            )}
                            {uploaded ? (
                              <button onClick={() => setDocs(d => d.filter(x => x !== doc.label))}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-[#aaa] hover:text-[#666] transition-colors"
                              ><X size={13} /> Retirer</button>
                            ) : (
                              <button onClick={() => setDocs(d => [...d, doc.label])}
                                className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] px-4 py-2 rounded-full border-2 hover:scale-105 transition-all"
                                style={{ borderColor: BG, color: BG }}
                              ><Upload size={12} /> UPLOADER</button>
                            )}
                            {uploaded && <CheckCircle size={18} style={{ color: LIME }} />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Réseaux sociaux ── */}
              {step === 3 && (
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-3">Étape 4 · Réseaux & Contact</p>
                  <h2 className="text-[28px] md:text-[36px] font-medium text-[#1a1a1a] leading-tight mb-2">
                    Connectez vos <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', color: BG }}>canaux</em>
                  </h2>
                  <p className="text-[14px] text-[#999] mb-10 leading-relaxed">Ces liens apparaîtront sur votre profil pour renforcer la confiance des donateurs.</p>

                  <div className="flex flex-col gap-7">
                    {[
                      { label: 'Site web', placeholder: 'https://lumieresdusahel.org', icon: '🌐' },
                      { label: 'LinkedIn', placeholder: 'https://linkedin.com/company/...', icon: '💼' },
                      { label: 'Facebook', placeholder: 'https://facebook.com/...', icon: '📘' },
                      { label: 'Instagram', placeholder: '@lumieresdusahel', icon: '📷' },
                      { label: 'Email de contact public', placeholder: 'contact@lumieresdusahel.org', icon: '✉️' },
                      { label: 'Numéro de téléphone', placeholder: '+221 XX XXX XX XX', icon: '📞' },
                    ].map(f => (
                      <div key={f.label} className="flex items-center gap-4">
                        <span className="text-[22px] shrink-0">{f.icon}</span>
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-[#aaa] mb-2">{f.label}</label>
                          <div className="border-b-2 border-[#ddd] pb-1.5 focus-within:border-[#183028] transition-colors">
                            <input type="text" placeholder={f.placeholder} className="w-full bg-transparent text-[15px] text-[#1a1a1a] outline-none placeholder-[#ccc]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-5 border-t border-[#e0e0da] shrink-0">
          <button onClick={() => goTo(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 text-[12px] font-bold tracking-[0.12em] transition-all disabled:opacity-30"
            style={{ color: '#888' }}
          >
            <ArrowLeft size={14} /> PRÉCÉDENT
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i === step ? '20px' : '6px', backgroundColor: i <= step ? BG : '#ddd' }}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <motion.button onClick={() => goTo(step + 1)} whileHover={{ scale: 1.04 }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full text-[12px] font-bold tracking-[0.12em] transition-all"
              style={{ backgroundColor: BG, color: LIME }}
            >
              SUIVANT <ArrowRight size={14} />
            </motion.button>
          ) : (
            <motion.button onClick={() => navigate('/ngo/profile')} whileHover={{ scale: 1.04 }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full text-[12px] font-bold tracking-[0.12em] transition-all"
              style={{ backgroundColor: LIME, color: BG }}
            >
              <CheckCircle size={14} /> TERMINER
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
