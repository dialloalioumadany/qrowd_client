import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, CheckCircle, Heart, LogOut, ArrowUpRight, Lock, Camera, Target, BookOpen, Droplets, TreePine, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInView } from '@/hooks/useInView';

const TABS = ['Historique', 'Mon Impact', 'Récompenses', 'Paramètres'];

const BG = '#183028';
const LIME = '#cde877';
const OFFWHITE = '#f2f1ec';
const API = 'http://localhost:5000/api';

/* ── Types & Constants ── */
interface Donation {
  _id: string;
  amount: number;
  createdAt: string;
  campaign: { title: string; coverImage: string; slug: string; category?: string } | null;
}

const BADGES_RICH = [
  { id: 'pioneer',    img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=500&auto=format&fit=crop', label: 'Pionnier',       desc: 'Premier don', threshold: 1  },
  { id: 'generous',   img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop', label: 'Généreux',       desc: '3 dons effectués', threshold: 3  },
  { id: 'committed',  img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop', label: 'Engagé',         desc: '5 dons effectués', threshold: 5  },
  { id: 'champion',   img: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=500&auto=format&fit=crop', label: 'Champion',       desc: '10 dons effectués', threshold: 10 },
  { id: 'global',     img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop', label: 'Citoyen',        desc: '3 secteurs soutenus', threshold: 3  },
  { id: 'hundredeur', img: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop', label: 'Centenaire',     desc: 'Plus de 100€ donnés', threshold: 100 },
];

export default function DonorProfile() {
  const navigate = useNavigate();
  const { user, token, logout, loading: authLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bannerRef, offset: ['start start', 'end start'] });
  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const { ref: historyRef, inView: historyInView } = useInView(0.1);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [dLoading, setDLoading] = useState(true);

  const [localBanner, setLocalBanner] = useState('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop');
  const [localAvatar, setLocalAvatar] = useState(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'avatar' | 'banner'>('avatar');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      if (uploadType === 'avatar') setLocalAvatar(url);
      if (uploadType === 'banner') setLocalBanner(url);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/donations/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setDonations(d.data.donations); })
      .catch(() => {})
      .finally(() => setDLoading(false));
  }, [token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f1ec]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#183028] border-t-transparent" />
      </div>
    );
  }

  /* Derived stats */
  const totalDonated = user.totalDonated ?? donations.reduce((s, d) => s + d.amount, 0);
  const donationsCount = user.donationsCount ?? donations.length;
  const joinDate = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const uniqueCategories = [...new Set(donations.map(d => d.campaign?.category).filter(Boolean))];
  const earnedBadges = new Set(
    BADGES_RICH.filter(b => {
      if (b.id === 'hundredeur') return totalDonated >= b.threshold;
      if (b.id === 'global') return uniqueCategories.length >= b.threshold;
      return donationsCount >= b.threshold;
    }).map(b => b.id)
  );

  const impactData = uniqueCategories.length > 0
    ? uniqueCategories.map(cat => ({
        label: cat!,
        value: donations.filter(d => d.campaign?.category === cat).reduce((s, d) => s + d.amount, 0),
      }))
    : [ { label: 'Soutien Général', value: 0 } ];
  const maxImpact = Math.max(...impactData.map(i => i.value), 1);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div style={{ backgroundColor: OFFWHITE, fontFamily: "'Inter', sans-serif" }}>

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
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 transition-colors justify-self-start"
          style={{ color: scrolled ? '#1a1a1a' : 'rgba(255,255,255,0.8)' }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Accueil</span>
        </button>

        <span className="text-[18px] font-bold transition-colors justify-self-center" style={{ color: scrolled ? BG : LIME }}>Qrowd</span>

        <div className="flex items-center gap-3 justify-self-end">
          <motion.button
            onClick={() => { logout(); navigate('/'); }}
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase transition-all"
            style={scrolled
              ? { backgroundColor: BG, color: LIME }
              : { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: `1px solid rgba(255,255,255,0.3)` }
            }
          >
            Déconnexion <LogOut size={12} strokeWidth={3} />
          </motion.button>
        </div>
      </motion.header>

      {/* ─── Banner with parallax ─── */}
      <div ref={bannerRef} className="relative w-full overflow-hidden group cursor-pointer" style={{ height: '70vh' }}>
        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        <motion.img
          src={localBanner}
          alt="Mountains"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: bannerY, scale: 1.15 }}
          initial={{ scale: 1.2 }} animate={{ scale: 1.15 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(24,48,40,0.95) 100%)' }} />

        {/* Edit banner button */}
        <div className="absolute top-28 right-6 md:right-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button onClick={(e) => { e.stopPropagation(); setUploadType('banner'); fileInputRef.current?.click(); }} className="flex items-center gap-2 px-5 py-2.5 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white text-[11px] font-bold uppercase tracking-widest border border-white/20 transition-all shadow-lg hover:scale-105">
              <Camera size={14} /> Modifier la bannière
           </button>
        </div>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 md:pb-14">
          <motion.div className="flex items-center gap-1.5 mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <CheckCircle size={11} style={{ color: LIME }} />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: LIME }}>Donateur vérifié Qrowd</span>
          </motion.div>

          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              className="text-white font-medium leading-[0.9]"
              style={{ fontSize: 'clamp(44px, 8.5vw, 120px)', fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ y: '105%' }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              {user.firstName} {user.lastName}
            </motion.h1>
          </div>

          <motion.div className="flex flex-wrap gap-4 md:gap-8 mt-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            {[
              { label: 'Statut', value: 'Membre Solidaire' },
              { label: 'Secteurs d\'action', value: `${uniqueCategories.length} soutenus` },
              { label: 'Rejoint en', value: joinDate },
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
        <div style={{ position: 'relative', paddingTop: '0' }}>
          <motion.div
            onClick={() => { setUploadType('avatar'); fileInputRef.current?.click(); }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-[24px] font-bold border-4 shadow-2xl overflow-hidden group cursor-pointer"
            style={{ backgroundColor: BG, color: LIME, borderColor: OFFWHITE, position: 'relative', top: '-28px', marginBottom: '-12px', display: 'inline-flex' }}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1, type: 'spring', stiffness: 160 }}
          >
             {localAvatar ? <img src={localAvatar} className="w-full h-full object-cover group-hover:blur-sm transition-all" /> : <div className="w-full h-full flex items-center justify-center group-hover:blur-sm transition-all">{initials}</div>}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                 <Camera size={22} className="text-white" />
             </div>
          </motion.div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6 border-b border-[#e0e0da]">
          <div>
            <p className="text-[18px] md:text-[22px] font-bold text-[#1a1a1a] leading-tight">Dossier d'Impact</p>
            <p className="text-[12px] text-[#aaa] mt-0.5">{user.email}</p>
          </div>
          <div className="flex gap-6 md:gap-10">
            {[{ n: `${totalDonated.toLocaleString('fr-FR')}€`, l: 'Impact total' }, { n: donationsCount.toString(), l: 'Dons effectués' }, { n: earnedBadges.size.toString(), l: 'Trophées' }].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-[22px] font-bold leading-none" style={{ color: BG }}>{s.n}</p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#bbb] mt-1.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="py-6 text-[15px] leading-[1.85] text-[#666] max-w-3xl border-b border-[#e0e0da]">
          Espace personnel sécurisé. Retrouvez l'historique complet de vos dons, la portée de vos actions solidaires, et les récompenses liées à votre générosité.
        </p>
      </div>

      {/* ─── Sticky Tabs bar ─── */}
      <div className="sticky top-[64px] z-40 border-b border-[#e0e0da] flex overflow-x-auto no-scrollbar" style={{ backgroundColor: 'rgba(242,241,236,0.95)', backdropFilter: 'blur(12px)' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className="relative py-4 px-6 md:px-8 text-[12px] md:text-[13px] font-bold tracking-[0.1em] uppercase transition-colors shrink-0"
            style={{ color: activeTab === i ? '#1a1a1a' : '#bbb' }}
          >
            {tab}
            {activeTab === i && (
              <motion.div layoutId="ngo-tab-final-donor"
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

        {/* TAB 0: Historique */}
        {activeTab === 0 && (
          <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div ref={historyRef} className="px-6 md:px-12 pt-16 pb-20">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-2">— Vos actions</p>
                  <h2 className="font-medium text-[#1a1a1a] leading-[1.0]" style={{ fontSize: 'clamp(28px, 4.5vw, 58px)' }}>
                    Journal de{' '}<em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>dons</em>
                  </h2>
                </div>
                <button onClick={() => navigate('/discover')} className="hidden sm:flex items-center gap-1.5 px-6 py-3.5 rounded-full text-[12px] font-bold tracking-[0.12em] uppercase hover:scale-105 transition-all shrink-0"
                  style={{ backgroundColor: BG, color: LIME }}
                ><Plus size={13} strokeWidth={3} /> Nouveau don</button>
              </div>

              {dLoading ? (
                 <div className="py-20 flex justify-center"><div className="w-6 h-6 border-2 border-t-transparent border-[#183028] rounded-full animate-spin" /></div>
              ) : donations.length === 0 ? (
                 <div className="py-20 border-t border-[#e0e0da] text-center">
                    <Heart size={40} className="mx-auto mb-4 text-[#d0d0cc]" strokeWidth={1} />
                    <p className="text-[16px] font-medium text-[#1a1a1a] mb-2">Aucun don enregistré</p>
                    <p className="text-[14px] text-[#888]">Commencez à soutenir des projets dès maintenant.</p>
                 </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#e0e0da]">
                  {donations.map((d, i) => (
                    <motion.div key={d._id}
                      className="group py-7 md:py-9 flex flex-col sm:flex-row sm:items-center gap-5 cursor-pointer hover:bg-[#eae9e4] -mx-6 px-6 md:-mx-12 md:px-12 transition-colors"
                      animate={historyInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      onClick={() => d.campaign && navigate(`/campaign/${d.campaign.slug}`)}
                    >
                      {/* Date */}
                      <span className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#888] shrink-0 w-24">
                        {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>

                      {/* Image */}
                      <div className="w-full sm:w-24 md:w-32 h-36 sm:h-[72px] rounded-xl overflow-hidden shrink-0 bg-[#eeeee8]">
                        {d.campaign?.coverImage ? <img src={d.campaign.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-[#ccc]"><Heart size={20} /></div>}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-[17px] md:text-[22px] font-medium text-[#1a1a1a] leading-snug mb-1 group-hover:italic transition-all duration-300">{d.campaign?.title || 'Campagne supprimée'}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888]">{d.campaign?.category}</p>
                      </div>

                      {/* Amount */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[20px] md:text-[26px] font-bold leading-none" style={{ color: BG }}>+{d.amount}€</p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#bbb] mt-1.5">Montant</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <span className="text-[22px] font-light text-[#ccc] group-hover:text-[#1a1a1a] group-hover:translate-x-1 transition-all duration-300 hidden md:block ml-4">→</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 1: Mon Impact (Vrai dashboard) */}
        {activeTab === 1 && (
          <motion.div key="impact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="px-6 md:px-12 pt-16 pb-32">
              <div className="border-b-2 border-[#183028] pb-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#aaa] mb-2">— Analyse de vos contributions</p>
                  <h2 className="text-[36px] md:text-[48px] font-medium leading-none text-[#1a1a1a] tracking-tight">
                    Votre <em className="font-['Cormorant_Garamond'] italic text-[#183028]">empreinte réelle</em>
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#888] mb-1">Moyenne par don</p>
                  <p className="text-[24px] font-bold text-[#183028]">{donations.length > 0 ? Math.round(totalDonated / donations.length) : 0} €</p>
                </div>
              </div>

              {/* Main Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-[#183028] p-8 md:p-10 rounded-2xl flex flex-col justify-between">
                  <div className="w-12 h-12 bg-[#cde877]/20 rounded-full flex items-center justify-center mb-16">
                      <Globe size={24} className="text-[#cde877]" />
                  </div>
                  <div>
                      <p className="text-[48px] md:text-[56px] font-bold text-white leading-none mb-2">{uniqueCategories.length}</p>
                      <p className="text-[11px] font-bold tracking-widest uppercase text-[#cde877]">Catégories impactées</p>
                  </div>
                </div>
                <div className="bg-[#f2f1ec] border border-[#e0e0da] p-8 md:p-10 rounded-2xl flex flex-col justify-between">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-16 border border-[#e0e0da]">
                      <Heart size={24} className="text-[#183028]" />
                  </div>
                  <div>
                      <p className="text-[48px] md:text-[56px] font-bold text-[#1a1a1a] leading-none mb-2">{donationsCount}</p>
                      <p className="text-[11px] font-bold tracking-widest uppercase text-[#888]">Projets financés</p>
                  </div>
                </div>
                <div className="bg-[#f2f1ec] border border-[#e0e0da] p-8 md:p-10 rounded-2xl flex flex-col justify-between">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-16 border border-[#e0e0da]">
                      <Target size={24} className="text-[#183028]" />
                  </div>
                  <div>
                      <p className="text-[48px] md:text-[56px] font-bold text-[#1a1a1a] leading-none mb-2">{Math.floor(totalDonated / 50) || 0}</p>
                      <p className="text-[11px] font-bold tracking-widest uppercase text-[#888]">Mois d'impact soutenu</p>
                  </div>
                </div>
              </div>

              {/* Breakdown Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Categories Breakdown */}
                <div>
                    <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-8">Répartition par catégorie</h3>
                    <div className="space-y-6">
                      {impactData.map((d, i) => (
                        <div key={d.label}>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[14px] font-medium text-[#1a1a1a]">{d.label}</span>
                            <span className="text-[15px] font-bold text-[#183028]">{d.value} € <span className="text-[12px] text-[#aaa] font-normal">({Math.round((d.value/totalDonated)*100) || 0}%)</span></span>
                          </div>
                          <div className="h-2.5 w-full bg-[#f2f1ec] rounded-full overflow-hidden border border-[#e0e0da]">
                            <motion.div className="h-full bg-[#183028]" initial={{ width: 0 }} animate={{ width: `${(d.value/maxImpact)*100}%` }} transition={{ duration: 1.2, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                </div>

                {/* Equivalence (The "Real Impact") */}
                <div className="bg-[#fafaf6] border border-[#e0e0da] rounded-2xl p-8 md:p-10">
                    <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-8">Équivalences concrètes</h3>
                    <div className="flex flex-col gap-8">
                      <div className="flex gap-6 items-start">
                          <div className="w-12 h-12 rounded-full bg-[#e8e8e3] flex items-center justify-center shrink-0">
                            <BookOpen size={20} className="text-[#183028]" />
                          </div>
                          <div>
                            <p className="text-[20px] font-bold text-[#1a1a1a] mb-1">{Math.floor(totalDonated / 30) || 0} Kits Scolaires</p>
                            <p className="text-[13px] text-[#888] leading-relaxed">Vos dons équivalent au financement complet de fournitures scolaires annuelles pour ce nombre d'enfants.</p>
                          </div>
                      </div>
                      <div className="flex gap-6 items-start">
                          <div className="w-12 h-12 rounded-full bg-[#e8e8e3] flex items-center justify-center shrink-0">
                            <Droplets size={20} className="text-[#183028]" />
                          </div>
                          <div>
                            <p className="text-[20px] font-bold text-[#1a1a1a] mb-1">{Math.floor(totalDonated / 150) || 0} Familles Abreuvées</p>
                            <p className="text-[13px] text-[#888] leading-relaxed">C'est la part proportionnelle de financement pour des forages hydrauliques dans les zones arides soutenues.</p>
                          </div>
                      </div>
                      <div className="flex gap-6 items-start">
                          <div className="w-12 h-12 rounded-full bg-[#e8e8e3] flex items-center justify-center shrink-0">
                            <TreePine size={20} className="text-[#183028]" />
                          </div>
                          <div>
                            <p className="text-[20px] font-bold text-[#1a1a1a] mb-1">{Math.floor(totalDonated / 5) || 0} Arbres Plantés</p>
                            <p className="text-[13px] text-[#888] leading-relaxed">Impact écologique estimé de vos contributions sur les projets d'agroforesterie locaux.</p>
                          </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* TAB 2: Badges (Équipe style) */}
        {activeTab === 2 && (
          <motion.div key="badges" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="border-t border-[#e0e0da] pb-32">
              <div className="px-6 md:px-12 py-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#aaa] mb-6">— VOS RÉCOMPENSES</p>
                  <h2 className="font-medium text-[#1a1a1a] leading-tight" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                    L'engagement <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>valorisé</em>
                  </h2>
                </div>
                <p className="text-[15px] text-[#666] max-w-sm leading-relaxed">
                  Chaque étape de votre parcours solidaire est unique. Ces badges symbolisent vos succès et votre évolution sur la plateforme.
                </p>
              </div>

              <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                {BADGES_RICH.map((m, i) => {
                  const earned = earnedBadges.has(m.id);
                  return (
                    <motion.div key={m.label} className="group cursor-default"
                      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }}
                    >
                      <div className="w-full overflow-hidden mb-6 relative" style={{ aspectRatio: i % 2 === 0 ? '3/4' : '4/5', backgroundColor: '#eeeee8' }}>
                        <img src={m.img} alt={m.label} className={`w-full h-full object-cover transition-all duration-[1.2s] ease-[0.25,0.46,0.45,0.94] ${earned ? 'grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100' : 'grayscale opacity-30 blur-[2px]'}`} />
                        {!earned && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                              <Lock size={32} className="text-[#1a1a1a]/50" />
                           </div>
                        )}
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-1">{m.label}</h3>
                          <p className="text-[12px] font-bold tracking-wider uppercase" style={{ color: earned ? LIME : '#aaa' }}>{m.desc}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500" style={{ borderColor: earned ? BG : '#ddd', color: earned ? BG : '#ddd' }}>
                           {earned ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-[#ddd]" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PARAMÈTRES */}
        {activeTab === 3 && (
          <motion.div key="parametres" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <div className="border-t border-[#e0e0da] pb-32">
              <div className="px-6 md:px-12 py-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#aaa] mb-6">— SÉCURITÉ ET PRÉFÉRENCES</p>
                  <h2 className="font-medium text-[#1a1a1a] leading-tight" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                    Gérer mon <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>compte</em>
                  </h2>
                </div>
              </div>
              
              <div className="px-6 md:px-12 max-w-4xl mx-auto flex flex-col gap-16">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-6 border-b border-[#e0e0da] pb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] mb-3">Prénom</label>
                        <input type="text" disabled value={user.firstName} className="w-full bg-white border border-[#e0e0da] rounded-none px-4 py-4 text-[15px] font-medium text-[#1a1a1a] outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] mb-3">Nom</label>
                        <input type="text" disabled value={user.lastName} className="w-full bg-white border border-[#e0e0da] rounded-none px-4 py-4 text-[15px] font-medium text-[#1a1a1a] outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] mb-3">Adresse Email</label>
                        <input type="email" disabled value={user.email} className="w-full bg-white border border-[#e0e0da] rounded-none px-4 py-4 text-[15px] font-medium text-[#1a1a1a] outline-none" />
                      </div>
                  </div>
                  <div className="mt-8">
                      <button className="px-8 py-4 bg-[#183028] text-[#cde877] text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform">Enregistrer les modifications</button>
                  </div>
                </div>

                {/* Préférences */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-6 border-b border-[#e0e0da] pb-4">Confidentialité</h3>
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between py-5 border-b border-[#e0e0da]">
                        <div>
                            <p className="text-[15px] font-medium text-[#1a1a1a]">Profil public</p>
                            <p className="text-[13px] text-[#888] mt-1 max-w-sm">Rendre mon profil visible aux autres membres de la communauté Qrowd.</p>
                        </div>
                        <div className="w-14 h-7 bg-[#183028] rounded-full relative cursor-pointer flex items-center px-1">
                            <div className="w-5 h-5 bg-[#cde877] rounded-full absolute right-1 shadow-sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-5">
                        <div>
                            <p className="text-[15px] font-medium text-[#1a1a1a]">Dons Anonymes</p>
                            <p className="text-[13px] text-[#888] mt-1 max-w-sm">Masquer mon identité publiquement lors de mes contributions financières.</p>
                        </div>
                        <div className="w-14 h-7 bg-[#e0e0da] rounded-full relative cursor-pointer flex items-center px-1">
                            <div className="w-5 h-5 bg-white rounded-full absolute left-1 shadow-sm" />
                        </div>
                      </div>
                  </div>
                </div>

                {/* Zone de danger */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#d32f2f] mb-6 border-b border-[#ffcccc] pb-4">Zone de danger</h3>
                  <div className="bg-[#fff5f5] p-8 border border-[#ffcccc]">
                    <p className="text-[15px] font-medium text-[#d32f2f] mb-2">Supprimer mon compte</p>
                    <p className="text-[13px] text-[#888] mb-8">Cette action est définitive. Toutes vos données personnelles et l'historique de vos contributions seront supprimés de nos serveurs.</p>
                    <button className="px-8 py-4 bg-transparent border border-[#d32f2f] text-[#d32f2f] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#d32f2f] hover:text-white transition-colors">Supprimer définitivement</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
