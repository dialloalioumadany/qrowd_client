import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, CheckCircle, LogOut, Camera, Settings, Trash2, Pencil, UserPlus, X } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TABS = ['Campagnes', 'Notre mission', 'Équipe', 'Documents'];

const BG = '#183028';
const LIME = '#cde877';
const OFFWHITE = '#f2f1ec';

/* ── Team member type ── */
type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  bio: string;
  img: string; // URL or base64 preview
};

export default function NGOProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isMyProfile = !id || id === 'mine';
  const { token, logout, loading: authLoading } = useAuth();
  const toast = useToast();
  
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [org, setOrg] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [updatingBanner, setUpdatingBanner] = useState(false);
  const [updatingLogo, setUpdatingLogo] = useState(false);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  /* ── Team state ── */
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamModal, setTeamModal] = useState<{ open: boolean; editing: TeamMember | null }>({
    open: false,
    editing: null,
  });
  const [teamForm, setTeamForm] = useState<Omit<TeamMember, 'id'>>({
    firstName: '', lastName: '', role: '', bio: '', img: '',
  });
  const [teamImgPreview, setTeamImgPreview] = useState<string>('');
  const [savingTeam, setSavingTeam] = useState(false);
  const teamImgRef = useRef<HTMLInputElement>(null);

  const handleUploadImage = async (file: File, type: 'logo' | 'coverImage') => {
    if (type === 'logo') setUpdatingLogo(true);
    else setUpdatingBanner(true);

    const toastId = toast.loading(type === 'logo' ? "Mise à jour du logo..." : "Mise à jour de la bannière...");

    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', type === 'logo' ? 'org_logo' : 'org_cover');

      const uploadRes = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });

      const uploadData = await uploadRes.json();
      let imageUrl = '';
      let isFallback = false;

      if (!uploadRes.ok || uploadRes.status === 503) {
        console.warn("Upload failed or ImageKit not configured, using fallback image.");
        imageUrl = type === 'logo'
          ? 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=200&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop';
        isFallback = true;
      } else {
        imageUrl = uploadData.data.url;
      }

      // Update the organization on the backend
      const patchRes = await fetch(`http://localhost:5000/api/organizations/${org._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [type]: imageUrl })
      });

      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        throw new Error(patchData.message || "Impossible de mettre à jour l'organisation.");
      }

      // Update the state
      setOrg((prev: any) => ({ ...prev, [type]: imageUrl }));

      if (isFallback) {
        toast.info(
          type === 'logo'
            ? "Logo mis à jour (image d'illustration temporaire)."
            : "Bannière mise à jour (image d'illustration temporaire).",
          { id: toastId }
        );
      } else {
        toast.success(
          type === 'logo'
            ? "Logo mis à jour avec succès !"
            : "Bannière mise à jour avec succès !",
          { id: toastId }
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur de chargement de l'image.", { id: toastId });
    } finally {
      setUpdatingLogo(false);
      setUpdatingBanner(false);
    }
  };

  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: bannerRef, offset: ['start start', 'end start'] });
  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const { ref: campsRef, inView: campsInView } = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (isMyProfile && !token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const url = isMyProfile
          ? 'http://localhost:5000/api/organizations/mine'
          : `http://localhost:5000/api/organizations/${id}`;

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(url, { headers });
        
        if (res.status === 401 && isMyProfile) {
          logout();
          navigate('/login');
          return;
        }

        const data = await res.json();
        if (data.status === 'success' && data.data.organization) {
          setOrg(data.data.organization);
          // Load team members saved on the org
          if (Array.isArray(data.data.organization.team)) {
            setTeam(data.data.organization.team);
          }

          // Fetch campaigns of this organization
          try {
            const campsRes = await fetch(`http://localhost:5000/api/campaigns?organization=${data.data.organization._id}&status=all`);
            const campsData = await campsRes.json();
            if (campsData.status === 'success') {
              const loadedCamps = campsData.data.campaigns || [];
              if (isMyProfile) {
                setCampaigns(loadedCamps);
              } else {
                // Pour la vue publique, filtrer pour n'afficher que les campagnes actives, en attente ou terminées (comme DiscoverPage)
                const publicCamps = loadedCamps.filter((c: any) =>
                  ['active', 'pending', 'completed'].includes(c.status)
                );
                setCampaigns(publicCamps);
              }
            }
          } catch (cErr) {
            console.error("Error loading campaigns:", cErr);
          }
        } else {
          if (isMyProfile) {
            // Redirect to onboarding if no organization exists yet
            navigate('/ngo/onboarding');
          } else {
            toast.error("Organisation introuvable.");
            navigate('/');
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        if (!isMyProfile) {
          toast.error("Impossible de charger le profil de l'organisation.");
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, authLoading, navigate, logout, id, isMyProfile]);

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: OFFWHITE }}>
        <div className="text-center">
          <span className="text-[28px] font-bold" style={{ color: BG }}>Qrowd</span>
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#bbb] mt-3">CHARGEMENT DU PORTAIL ONG...</p>
        </div>
      </div>
    );
  }

  if (!org) return null;

  // Get initials for profile placeholder
  const getInitials = (nameStr: string) => {
    const parts = nameStr.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };

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
          {isMyProfile ? (
            <>
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

              <motion.button
                onClick={() => { logout(); navigate('/login'); }}
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] transition-all border border-solid cursor-pointer"
                style={scrolled
                  ? { borderColor: '#ddd', color: '#666', backgroundColor: '#fff' }
                  : { borderColor: 'rgba(255,255,255,0.2)', color: '#fff', backgroundColor: 'transparent' }
                }
              >
                <LogOut size={12} strokeWidth={2.5} /> Déconnexion
              </motion.button>
            </>
          ) : (
            token ? (
              <motion.button
                onClick={() => navigate('/ngo/profile')}
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] transition-all border border-solid cursor-pointer"
                style={scrolled
                  ? { borderColor: '#ddd', color: '#666', backgroundColor: '#fff' }
                  : { borderColor: 'rgba(255,255,255,0.2)', color: '#fff', backgroundColor: 'transparent' }
                }
              >
                Mon Profil
              </motion.button>
            ) : (
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.04 }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] transition-all border border-solid cursor-pointer"
                style={scrolled
                  ? { borderColor: '#ddd', color: '#666', backgroundColor: '#fff' }
                  : { borderColor: 'rgba(255,255,255,0.2)', color: '#fff', backgroundColor: 'transparent' }
                }
              >
                Connexion
              </motion.button>
            )
          )}
        </div>
      </motion.header>

      {/* ─── Banner with parallax ─── */}
      <div ref={bannerRef} className="relative w-full overflow-hidden" style={{ height: '80vh' }}>
        <motion.img
          src={org.coverImage || "https://images.pexels.com/photos/33687179/pexels-photo-33687179.jpeg"}
          alt={org.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: bannerY, scale: 1.15 }}
          initial={{ scale: 1.2 }} animate={{ scale: 1.15 }} transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 30%, rgba(24,48,40,0.82) 100%)' }} />

        {/* Edit banner input & button */}
        {isMyProfile && (
          <>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file, 'coverImage');
            }} />
            <motion.button
              onClick={() => bannerInputRef.current?.click()}
              disabled={updatingBanner}
              className="absolute top-20 right-6 text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-2 rounded-full transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            >{updatingBanner ? 'Téléchargement...' : 'Modifier la bannière'}</motion.button>
          </>
        )}

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-10 md:pb-14">
          {/* Status Badge */}
          <motion.div className="flex items-center gap-1.5 mb-4"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            {org.status === 'verified' ? (
              <>
                <CheckCircle size={11} style={{ color: LIME }} />
                <span className="text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: LIME }}>Organisation certifiée Qrowd</span>
              </>
            ) : org.status === 'pending' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 inline-block animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-amber-400">En attente de vérification</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-red-400">Non vérifiée ({org.status})</span>
              </>
            )}
          </motion.div>

          {/* Name */}
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              className="text-white font-medium leading-[0.9]"
              style={{ fontSize: 'clamp(44px, 8.5vw, 120px)', fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ y: '105%' }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              {org.name}
            </motion.h1>
          </div>

          {/* Sub info */}
          <motion.div className="flex flex-wrap gap-4 md:gap-8 mt-5"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          >
            {[
              { label: 'Catégorie', value: org.category || 'Éducation' },
              { label: 'Zone d\'action', value: org.address?.country || 'Sénégal' },
              { label: 'Inscrit en', value: new Date(org.createdAt).getFullYear().toString() },
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
          {isMyProfile && (
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file, 'logo');
            }} />
          )}
          <div 
            className={`relative inline-flex ${isMyProfile ? 'group cursor-pointer' : ''}`}
            style={{ position: 'relative', top: '-28px', marginBottom: '-12px' }} 
            onClick={() => isMyProfile && logoInputRef.current?.click()}
          >
            {org.logo ? (
              <motion.img
                src={org.logo}
                alt={org.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border-4 shadow-2xl"
                style={{ borderColor: OFFWHITE }}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1, type: 'spring', stiffness: 160 }}
              />
            ) : (
              <motion.div
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-[24px] font-bold border-4 shadow-2xl"
                style={{ backgroundColor: BG, color: LIME, borderColor: OFFWHITE }}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1, type: 'spring', stiffness: 160 }}
              >
                {getInitials(org.name)}
              </motion.div>
            )}
            
            {/* Hover Edit Overlay */}
            {isMyProfile && (
              <div className="absolute inset-0 bg-black/45 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold tracking-[0.1em] border-4" style={{ borderColor: 'transparent' }}>
                {updatingLogo ? (
                  <span>MAJ...</span>
                ) : (
                  <>
                    <Camera size={14} className="mb-1" />
                    <span>MODIFIER</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pb-6 border-b border-[#e0e0da]">
          <div>
            <p className="text-[18px] md:text-[22px] font-bold text-[#1a1a1a] leading-tight">{org.name}</p>
            <p className="text-[12px] text-[#aaa] mt-0.5">ONG humanitaire · {org.category || 'Éducation'}</p>
          </div>
          <div className="flex gap-6 md:gap-10">
            {[
              {
                n: `${campaigns.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0).toLocaleString('fr-FR')}€`,
                l: 'Collectés'
              },
              {
                n: campaigns.reduce((acc, curr) => acc + (curr.donorsCount || 0), 0).toString(),
                l: 'Donateurs'
              },
              {
                n: campaigns.length.toString(),
                l: 'Campagnes'
              }
            ].map(s => (
              <div key={s.l} className="text-center">
                <p className="text-[22px] font-bold leading-none" style={{ color: BG }}>{s.n}</p>
                <p className="text-[11px] text-[#bbb] mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="py-6 text-[15px] leading-[1.85] text-[#666] max-w-3xl border-b border-[#e0e0da]">
          {org.description || org.mission || "Aucune description ou mission fournie pour le moment."}
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
                {isMyProfile && (
                  <button className="hidden sm:flex items-center gap-1.5 px-6 py-3.5 rounded-full text-[12px] font-bold tracking-[0.12em] hover:scale-105 transition-all shrink-0"
                    style={{ backgroundColor: BG, color: LIME }}
                    onClick={() => navigate('/campaign/create')}
                  >
                    <Plus size={13} strokeWidth={3} /> Créer
                  </button>
                )}
              </div>

              {/* Campaign list — clean transparent editorial layout */}
              <div className="flex flex-col">
                {campaigns.length === 0 ? (
                  <div className="py-20 text-center text-[#888] border-2 border-dashed border-[#e0e0da] rounded-2xl">
                    <p className="text-[15px] font-medium mb-6">
                      {isMyProfile 
                        ? "Vous n'avez pas encore créé de campagne de financement." 
                        : "Cette organisation n'a aucune campagne de financement active."}
                    </p>
                    {isMyProfile && (
                      <button
                        onClick={() => navigate('/campaign/create')}
                        className="px-6 py-3.5 rounded-full text-[12px] font-bold tracking-[0.12em] hover:scale-105 transition-all inline-flex items-center gap-2"
                        style={{ backgroundColor: BG, color: LIME }}
                      >
                        <Plus size={14} /> CRÉER VOTRE PREMIÈRE CAMPAGNE
                      </button>
                    )}
                  </div>
                ) : (
                  campaigns.map((c, i) => {
                    const pct = Math.min(Math.round(((c.raisedAmount || 0) / (c.targetAmount || 1)) * 100), 100);
                    return (
                      <motion.div key={c._id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={campsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="group py-8 md:py-10 border-b border-[#e0e0da]/80 flex flex-col md:flex-row items-stretch md:items-center gap-6 cursor-pointer hover:bg-[#fafaf6]/50 px-4 -mx-4 transition-all duration-300 relative"
                        onClick={() => navigate(isMyProfile ? `/campaign/${c._id}/dashboard` : `/campaign/${c._id}`)}
                      >
                        {/* Elegant Left Index */}
                        <div className="text-[13px] font-bold tracking-[0.2em] text-[#bbb] shrink-0 w-8 md:w-10">
                          0{i + 1}
                        </div>

                        {/* Cover Image with Category overlay */}
                        <div className="w-full md:w-44 h-32 md:h-24 rounded-lg overflow-hidden shrink-0 relative bg-black/5">
                          <img 
                            src={c.coverImage || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=700&auto=format&fit=crop'} 
                            alt={c.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                          <div className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#183028]/85 text-[#cde877] backdrop-blur-sm rounded">
                            {c.category || "Général"}
                          </div>
                        </div>

                        {/* Info details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-[18px] md:text-[21px] font-bold text-[#183028] leading-tight mb-1.5 group-hover:text-[#2d5c4e] transition-colors">
                              {c.title}
                            </h3>
                            
                            {(c.shortDescription || c.subtitle) && (
                              <p className="text-[13px] text-[#666] leading-relaxed mb-3 line-clamp-2 max-w-xl">
                                {c.shortDescription || c.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Tags list */}
                          {c.tags && c.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {c.tags.map((t: string) => (
                                <span key={t} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#183028]/5 text-[#183028] rounded">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Vertical Divider (Desktop) */}
                        <div className="hidden md:block w-[1px] bg-[#e0e0da]/60 self-stretch my-2" />

                        {/* Stats Panel */}
                        <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="text-[20px] font-bold text-[#183028]">
                                {(c.raisedAmount || 0).toLocaleString('fr-FR')}€
                              </span>
                              <span className="text-[11px] text-[#888] ml-2">
                                sur {c.targetAmount.toLocaleString('fr-FR')}€
                              </span>
                            </div>
                            <span className="text-[12px] font-bold text-[#183028]">
                              {pct}% financé
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-1 rounded-full overflow-hidden bg-[#e8e8e3]">
                            <motion.div className="h-full rounded-full" style={{ backgroundColor: LIME }}
                              animate={campsInView ? { width: `${pct}%` } : { width: 0 }}
                              transition={{ duration: 1.2, delay: 0.3 + i * 0.12 }}
                            />
                          </div>

                          {/* Actions (Status + Settings) */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#888]">{c.donorsCount || 0} donateurs</span>

                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded"
                                style={c.status === 'completed' || c.daysLeft === 0
                                  ? { backgroundColor: '#eeeee8', color: '#888' }
                                  : c.status === 'pending'
                                  ? { backgroundColor: '#f9f9f6', border: '1px solid #e0e0da', color: '#888' }
                                  : { backgroundColor: `${LIME}20`, color: BG }
                                }
                              >
                                {c.status === 'pending' ? 'En attente' : c.status === 'completed' || c.daysLeft === 0 ? 'Terminée' : c.status === 'paused' ? 'En pause' : `${c.daysLeft || 0}j restants`}
                              </span>

                              {isMyProfile && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/campaign/${c._id}/dashboard`);
                                  }}
                                  className="p-1.5 rounded-full border border-[#e0e0da] hover:border-[#183028] hover:bg-black/5 text-[#666] hover:text-[#183028] transition-all"
                                  title="Paramètres"
                                >
                                  <Settings size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Arrow */}
                        <span className="text-[20px] font-light text-[#ccc] group-hover:text-[#183028] group-hover:translate-x-1 transition-all duration-300 hidden md:block shrink-0">
                          →
                        </span>
                      </motion.div>
                    );
                  })
                )}
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

              {/* Header */}
              <div className="px-6 md:px-12 py-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#aaa] mb-6">— NOTRE ÉQUIPE</p>
                  <h2 className="font-medium text-[#1a1a1a] leading-tight" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
                    Les personnes derrière <em style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: BG }}>notre mission</em>
                  </h2>
                </div>
                {/* Add member button — owner only */}
                {isMyProfile && (
                  <button
                    onClick={() => {
                      setTeamForm({ firstName: '', lastName: '', role: '', bio: '', img: '' });
                      setTeamImgPreview('');
                      setTeamModal({ open: true, editing: null });
                    }}
                    className="flex items-center gap-2.5 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                    style={{ backgroundColor: BG, color: LIME }}
                  >
                    <UserPlus size={14} strokeWidth={2} />
                    Ajouter un membre
                  </button>
                )}
              </div>

              {/* Grid */}
              {team.length === 0 ? (
                <div className="px-6 md:px-12 py-20 text-center">
                  {isMyProfile ? (
                    <div>
                      <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#f5f5f0' }}>
                        <UserPlus size={22} strokeWidth={1.5} style={{ color: '#bbb' }} />
                      </div>
                      <p className="text-[15px] font-medium text-[#1a1a1a] mb-2">Aucun membre pour l'instant</p>
                      <p className="text-[13px] text-[#888] mb-8">Présentez votre équipe aux donateurs pour inspirer confiance.</p>
                      <button
                        onClick={() => {
                          setTeamForm({ firstName: '', lastName: '', role: '', bio: '', img: '' });
                          setTeamImgPreview('');
                          setTeamModal({ open: true, editing: null });
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em]"
                        style={{ backgroundColor: LIME, color: BG }}
                      >
                        <Plus size={13} strokeWidth={2.5} /> Ajouter le premier membre
                      </button>
                    </div>
                  ) : (
                    <p className="text-[14px] text-[#999]">Cette organisation n'a pas encore présenté son équipe.</p>
                  )}
                </div>
              ) : (
                <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                  {team.map((m, i) => (
                    <motion.div key={m.id} className="group relative"
                      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
                    >
                      {/* Photo */}
                      <div
                        className="w-full overflow-hidden mb-5"
                        style={{ aspectRatio: '3/4', backgroundColor: '#eeeee8' }}
                      >
                        {m.img ? (
                          <img
                            src={m.img}
                            alt={`${m.firstName} ${m.lastName}`}
                            className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[1.2s]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#eeeee8' }}>
                            <span className="text-[40px] font-bold text-[#ccc]">
                              {m.firstName[0]}{m.lastName[0]}
                            </span>
                          </div>
                        )}

                        {/* Edit / Delete overlay — owner only */}
                        {isMyProfile && (
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => {
                                setTeamForm({ firstName: m.firstName, lastName: m.lastName, role: m.role, bio: m.bio, img: m.img });
                                setTeamImgPreview(m.img);
                                setTeamModal({ open: true, editing: m });
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                              style={{ backgroundColor: '#fff', color: BG }}
                              title="Modifier"
                            >
                              <Pencil size={13} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => {
                                const updated = team.filter((t) => t.id !== m.id);
                                setTeam(updated);
                                // Persist
                                fetch(`http://localhost:5000/api/organizations/${org._id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ team: updated }),
                                }).catch(() => {});
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                              style={{ backgroundColor: '#fff', color: '#e53e3e' }}
                              title="Supprimer"
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-1">
                        {m.firstName} {m.lastName}
                      </h3>
                      <p className="text-[11px] font-bold tracking-wider uppercase mb-2" style={{ color: LIME }}>
                        {m.role}
                      </p>
                      {m.bio && (
                        <p className="text-[13px] leading-relaxed text-[#666]">{m.bio}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ── ADD / EDIT MODAL ── */}
              <AnimatePresence>
                {teamModal.open && (
                  <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Backdrop */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                      onClick={() => setTeamModal({ open: false, editing: null })}
                    />

                    {/* Panel */}
                    <motion.div
                      className="relative w-full max-w-lg bg-white overflow-y-auto"
                      style={{ maxHeight: '90vh', borderRadius: '4px' }}
                      initial={{ opacity: 0, scale: 0.97, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 20 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-8 py-6 border-b border-[#eee]">
                        <h3 className="text-[16px] font-semibold text-[#1a1a1a]">
                          {teamModal.editing ? 'Modifier le membre' : 'Ajouter un membre'}
                        </h3>
                        <button
                          onClick={() => setTeamModal({ open: false, editing: null })}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors"
                        >
                          <X size={16} strokeWidth={2} style={{ color: '#888' }} />
                        </button>
                      </div>

                      {/* Form */}
                      <div className="px-8 py-8 flex flex-col gap-6">

                        {/* Photo picker */}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-3">Photo</label>
                          <div className="flex items-center gap-5">
                            {/* Preview */}
                            <div
                              className="w-20 h-20 overflow-hidden shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: '#f5f5f0', borderRadius: '2px' }}
                            >
                              {teamImgPreview ? (
                                <img src={teamImgPreview} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                <Camera size={20} strokeWidth={1.5} style={{ color: '#ccc' }} />
                              )}
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                              {/* Upload file */}
                              <input
                                ref={teamImgRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const result = reader.result as string;
                                    setTeamImgPreview(result);
                                    setTeamForm((f) => ({ ...f, img: result }));
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <button
                                onClick={() => teamImgRef.current?.click()}
                                className="text-[11px] font-semibold uppercase tracking-[0.15em] px-4 py-2 transition-all hover:opacity-75 text-left"
                                style={{ border: '1px solid #e0e0da', color: BG }}
                              >
                                Choisir une photo
                              </button>
                              {/* Or URL */}
                              <input
                                type="text"
                                placeholder="… ou coller une URL"
                                value={teamForm.img.startsWith('data:') ? '' : teamForm.img}
                                onChange={(e) => {
                                  setTeamForm((f) => ({ ...f, img: e.target.value }));
                                  setTeamImgPreview(e.target.value);
                                }}
                                className="text-[12px] px-3 py-2 outline-none w-full"
                                style={{ border: '1px solid #e0e0da', color: '#333', fontFamily: "'Inter', sans-serif" }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* First + Last name */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-2">Prénom *</label>
                            <input
                              type="text"
                              value={teamForm.firstName}
                              onChange={(e) => setTeamForm((f) => ({ ...f, firstName: e.target.value }))}
                              placeholder="Fatou"
                              className="w-full px-4 py-3 text-[14px] outline-none"
                              style={{ border: '1px solid #e0e0da', fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-2">Nom *</label>
                            <input
                              type="text"
                              value={teamForm.lastName}
                              onChange={(e) => setTeamForm((f) => ({ ...f, lastName: e.target.value }))}
                              placeholder="Diallo"
                              className="w-full px-4 py-3 text-[14px] outline-none"
                              style={{ border: '1px solid #e0e0da', fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}
                            />
                          </div>
                        </div>

                        {/* Role */}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-2">Poste / Rôle *</label>
                          <input
                            type="text"
                            value={teamForm.role}
                            onChange={(e) => setTeamForm((f) => ({ ...f, role: e.target.value }))}
                            placeholder="Directrice générale"
                            className="w-full px-4 py-3 text-[14px] outline-none"
                            style={{ border: '1px solid #e0e0da', fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}
                          />
                        </div>

                        {/* Bio */}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-2">Biographie courte</label>
                          <textarea
                            value={teamForm.bio}
                            onChange={(e) => setTeamForm((f) => ({ ...f, bio: e.target.value }))}
                            placeholder="Quelques mots sur ce membre..."
                            rows={3}
                            className="w-full px-4 py-3 text-[14px] outline-none resize-none"
                            style={{ border: '1px solid #e0e0da', fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <button
                            onClick={() => setTeamModal({ open: false, editing: null })}
                            className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#888] hover:text-[#333] transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            disabled={!teamForm.firstName.trim() || !teamForm.lastName.trim() || !teamForm.role.trim() || savingTeam}
                            onClick={async () => {
                              if (!teamForm.firstName.trim() || !teamForm.lastName.trim() || !teamForm.role.trim()) return;
                              setSavingTeam(true);
                              let updatedTeam: TeamMember[];
                              if (teamModal.editing) {
                                updatedTeam = team.map((t) =>
                                  t.id === teamModal.editing!.id
                                    ? { ...t, ...teamForm }
                                    : t
                                );
                              } else {
                                const newMember: TeamMember = {
                                  id: Date.now().toString(),
                                  ...teamForm,
                                };
                                updatedTeam = [...team, newMember];
                              }
                              setTeam(updatedTeam);
                              try {
                                await fetch(`http://localhost:5000/api/organizations/${org._id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ team: updatedTeam }),
                                });
                              } catch (_) {}
                              setSavingTeam(false);
                              setTeamModal({ open: false, editing: null });
                            }}
                            className="px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-40"
                            style={{ backgroundColor: BG, color: LIME }}
                          >
                            {savingTeam ? 'Enregistrement...' : teamModal.editing ? 'Enregistrer' : 'Ajouter'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  {org.documents && org.documents.length > 0 ? (
                    org.documents.map((doc: any, i: number) => (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" key={i}
                        className="group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-[#e0e0da] transition-colors hover:bg-[#fafaf6] px-4 -mx-4 block"
                      >
                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors"
                            style={{ backgroundColor: LIME, color: BG }}
                          >
                            <span className="text-[10px] font-bold">DOC</span>
                          </div>
                          <div>
                            <h3 className="text-[18px] md:text-[22px] font-medium text-[#1a1a1a] mb-1 group-hover:text-[#cde877] transition-colors">{doc.name || `Document ${i + 1}`}</h3>
                            <div className="flex items-center gap-4 text-[13px] text-[#888]">
                              <span>Format en ligne</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.1em] text-[#1a1a1a] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          OUVRIR LE DOCUMENT <ArrowLeft size={14} className="-rotate-90" />
                        </div>
                      </a>
                    ))
                  ) : (
                    [
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Settings Modal */}
      {showSettingsModal && selectedCampaign && (
        <CampaignSettingsModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedCampaign(null);
          }}
          onSave={(updatedCamp) => {
            setCampaigns((prev) =>
              prev.map((c) => (c._id === updatedCamp._id ? updatedCamp : c))
            );
            setShowSettingsModal(false);
            setSelectedCampaign(null);
          }}
          token={token}
        />
      )}
    </div>
  );
}

interface CampaignSettingsModalProps {
  campaign: any;
  onClose: () => void;
  onSave: (updatedCampaign: any) => void;
  token: string | null;
}

function CampaignSettingsModal({ campaign, onClose, onSave, token }: CampaignSettingsModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState(campaign.title || '');
  const [shortDescription, setShortDescription] = useState(campaign.shortDescription || campaign.subtitle || '');
  const [targetAmount, setTargetAmount] = useState(campaign.targetAmount || campaign.goal || 0);
  const [category, setCategory] = useState(campaign.category || 'Éducation');
  const [status, setStatus] = useState(campaign.status || 'pending');
  const [tagsInput, setTagsInput] = useState(campaign.tags ? campaign.tags.join(', ') : '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    if (!shortDescription.trim()) {
      toast.error("La description courte est requise.");
      return;
    }
    if (shortDescription.length > 300) {
      toast.error("La description courte ne doit pas dépasser 300 caractères.");
      return;
    }
    if (targetAmount < 100) {
      toast.error("L'objectif minimum est de 100 €.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Enregistrement des modifications...");

    try {
      const parsedTags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      const payload: any = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        targetAmount,
        category,
        tags: parsedTags,
      };

      if (campaign.status !== 'pending') {
        payload.status = status;
      }

      const res = await fetch(`http://localhost:5000/api/campaigns/${campaign._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la mise à jour.");
      }

      toast.success("Campagne mise à jour avec succès !", { id: toastId });
      onSave(data.data.campaign);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur réseau.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#f2f1ec] rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ border: '1px solid rgba(24,48,40,0.1)' }}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e0e0da]">
          <h3 className="text-[18px] font-bold text-[#183028] tracking-tight">Paramètres</h3>
          <button onClick={onClose} className="text-[#888] hover:text-[#183028] text-[20px] font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[13px]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028]">Description courte</label>
              <span className="text-[9px] font-medium text-[#888]">{shortDescription.length}/300</span>
            </div>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2 rounded-xl border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[13px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1">Objectif (€)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                min={100}
                className="w-full px-4 py-2 rounded-xl border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[13px]"
              >
                {['Éducation', 'Santé', 'Environnement', 'Eau & Assainissement', 'Alimentation', 'Économie Solidaire', 'Réfugiés & Urgence', 'Énergie & Climat', 'Culture & Art', 'Autre'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {campaign.status !== 'pending' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[13px]"
              >
                <option value="active">Active (Publique)</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ex: sahel, mode, artisanat"
              className="w-full px-4 py-2 rounded-xl border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[13px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e0e0da] mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2 rounded-full border border-[#e0e0da] hover:bg-black/5 text-[11px] font-bold tracking-[0.1em] uppercase transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase transition-all"
              style={{ backgroundColor: '#183028', color: '#cde877' }}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
