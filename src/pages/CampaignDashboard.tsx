import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  Target,
  Trash2,
  Save,
  TrendingUp,
  Heart,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAMPAIGNS } from '../data/campaigns';

const BG = '#183028';
const LIME = '#cde877';
const WARM_SAND = '#fcfbf7';
const OFFWHITE = '#f2f1ec';
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Twitter_default_profile_400x400.png/250px-Twitter_default_profile_400x400.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail";

export default function CampaignDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const toast = useToast();

  const [campaign, setCampaign] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'donors' | 'settings'>('stats');

  // Edit fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('pending');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Determine if mock/static campaign or backend campaign
        const isMock = id && id.length < 10;

        if (isMock) {
          const mockCamp = CAMPAIGNS.find(c => c.id === id);
          if (!mockCamp) {
            toast.error("Campagne introuvable.");
            navigate('/ngo/profile');
            return;
          }
          // Adapt mock data structure
          const adapted = {
            _id: mockCamp.id,
            title: mockCamp.title,
            shortDescription: mockCamp.subtitle,
            targetAmount: mockCamp.goal,
            raisedAmount: mockCamp.raised,
            donorsCount: mockCamp.donors,
            daysLeft: mockCamp.daysLeft,
            category: mockCamp.category,
            coverImage: mockCamp.heroImg,
            tags: [],
            status: 'active',
            budgetBreakdown: mockCamp.breakdown ? mockCamp.breakdown.map((b: any) => ({ label: b.label, percentage: b.pct })) : [{ label: 'Projet principal', percentage: 100 }],
            organization: { name: mockCamp.ngoName }
          };
          setCampaign(adapted);
          
          // Set inputs
          setTitle(adapted.title);
          setShortDescription(adapted.shortDescription);
          setTargetAmount(adapted.targetAmount);
          setCategory(adapted.category);
          setStatus(adapted.status);

          // Simulated mock donors
          setDonors([
            { _id: 'd1', amount: Math.round(adapted.raisedAmount * 0.15), createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), isAnonymous: false, donorInfo: { firstName: 'Marc', lastName: 'Dubois' }, message: 'Magnifique projet, tout mon soutien !' },
            { _id: 'd2', amount: Math.round(adapted.raisedAmount * 0.05), createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), isAnonymous: true, donorInfo: { firstName: 'Anonyme' }, message: 'Pour un monde meilleur.' },
            { _id: 'd3', amount: Math.round(adapted.raisedAmount * 0.25), createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), isAnonymous: false, donorInfo: { firstName: 'Chantal', lastName: 'Gérard' } },
          ]);
          setLoading(false);
          return;
        }

        // Fetch from Backend
        const res = await fetch(`http://localhost:5000/api/campaigns/${id}`);
        const data = await res.json();

        if (res.ok && data.status === 'success' && data.data.campaign) {
          const camp = data.data.campaign;
          setCampaign(camp);

          // Set inputs
          setTitle(camp.title || '');
          setShortDescription(camp.shortDescription || camp.subtitle || '');
          setTargetAmount(camp.targetAmount || 0);
          setCategory(camp.category || 'Éducation');
          setStatus(camp.status || 'pending');
          setTagsInput(camp.tags ? camp.tags.join(', ') : '');

          // Fetch donations/donors
          try {
            const donRes = await fetch(`http://localhost:5000/api/donations/campaign/${id}`);
            const donData = await donRes.json();
            if (donRes.ok && donData.status === 'success') {
              setDonors(donData.data.donations || []);
            }
          } catch (donErr) {
            console.error("Error fetching campaign donations:", donErr);
          }
        } else {
          toast.error("Campagne introuvable.");
          navigate('/ngo/profile');
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        toast.error("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [id, token, navigate]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
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

    // Static check
    if (id && id.length < 10) {
      toast.info("Modification simulée (campagne statique locale).");
      setCampaign((prev: any) => ({
        ...prev,
        title,
        shortDescription,
        targetAmount,
        category,
        status
      }));
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Sauvegarde des modifications...");

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
        throw new Error(data.message || "Impossible de mettre à jour la campagne.");
      }

      toast.success("Campagne mise à jour avec succès !", { id: toastId });
      setCampaign(data.data.campaign);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur réseau lors de la sauvegarde.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (deleteConfirmText.toLowerCase() !== 'supprimer') {
      toast.error("Veuillez saisir 'supprimer' pour confirmer.");
      return;
    }

    // Static Check
    if (id && id.length < 10) {
      toast.success("Campagne statique retirée temporairement.");
      navigate('/ngo/profile');
      return;
    }

    const toastId = toast.loading("Suppression de la campagne...");
    try {
      const res = await fetch(`http://localhost:5000/api/campaigns/${campaign._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la suppression.");
      }

      toast.success("Votre campagne a été supprimée avec succès !", { id: toastId });
      navigate('/ngo/profile');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur réseau lors de la suppression.", { id: toastId });
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fcfbf7]">
        <div className="text-center">
          <span className="text-[28px] font-bold" style={{ color: BG }}>Q</span>
          <p className="text-[10px] font-bold tracking-[0.25em] text-[#bbb] mt-3 uppercase">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#fcfbf7] px-6">
        <p className="text-[18px] font-bold text-[#183028] mb-4">Campagne introuvable</p>
        <button onClick={() => navigate('/ngo/profile')} className="px-6 py-3 bg-[#183028] text-[#cde877] rounded-full text-[11px] font-bold tracking-widest uppercase">
          Retour au profil
        </button>
      </div>
    );
  }

  // Calc aggregates
  const raised = campaign.raisedAmount || 0;
  const goal = campaign.targetAmount || 1000;
  const percent = Math.min(Math.round((raised / goal) * 100), 100);
  const avgDonation = donors.length > 0 ? Math.round(raised / donors.length) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: WARM_SAND }}>
      
      {/* ══ NAVBAR ══ */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-10 h-[64px]"
        style={{
          backgroundColor: 'rgba(24, 48, 40, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(205, 232, 119, 0.08)',
        }}
      >
        <button
          onClick={() => navigate('/ngo/profile')}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 group text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft
            size={14}
            strokeWidth={2}
            className="transition-transform duration-300 group-hover:-translate-x-1"
            style={{ color: '#cde877' }}
          />
          Retour Profil
        </button>

        <span className="text-[20px] font-bold tracking-tight text-[#f2f1ec]">
          Q<em className="font-['Cormorant_Garamond'] italic font-normal" style={{ color: '#cde877' }}>rowd</em>
        </span>

        <button
          onClick={() => navigate(`/campaign/${id}`)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] px-5 py-2.5 transition-all duration-300 rounded hover:bg-[#cde877] hover:text-[#183028] text-[#cde877] group"
          style={{ border: '1px solid rgba(205, 232, 119, 0.3)' }}
        >
          Voir la page publique
        </button>
      </nav>

      {/* ══ DASHBOARD HEADER (Forest Green) ══ */}
      <div
        className="px-10 pt-14 pb-12 flex flex-col justify-between"
        style={{
          backgroundColor: BG,
          borderBottom: '1px solid rgba(205, 232, 119, 0.08)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <span className="text-[9px] font-bold tracking-[0.22em] uppercase px-2.5 py-1 bg-[#cde877]/10 text-[#cde877] rounded">
              {campaign.category}
            </span>
            
            <h1
              className="font-medium leading-[1.1] text-[#f2f1ec] mt-4"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.02em' }}
            >
              {campaign.title}
            </h1>
            
            <p className="text-[13px] text-[#f2f1ec]/60 mt-3 leading-relaxed font-sans max-w-xl">
              {campaign.shortDescription || "Aucune description courte fournie."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[9px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded"
              style={campaign.status === 'completed' || campaign.daysLeft === 0
                ? { backgroundColor: 'rgba(255,255,255,0.1)', color: '#bbb' }
                : campaign.status === 'pending'
                ? { backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }
                : { backgroundColor: 'rgba(205,232,119,0.15)', color: '#cde877' }
              }
            >
              Statut: {campaign.status === 'pending' ? 'En attente' : campaign.status === 'completed' || campaign.daysLeft === 0 ? 'Terminée' : campaign.status === 'paused' ? 'En pause' : 'Active'}
            </span>
          </div>
        </div>

        {/* Dynamic Aggregated Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-12 border-t border-[#f2f1ec]/10 pt-8 mt-4">
          {[
            { v: `${raised.toLocaleString('fr-FR')} €`, l: 'collectés', color: LIME },
            { v: `${goal.toLocaleString('fr-FR')} €`, l: 'objectif ciblé', color: '#f2f1ec' },
            { v: `${percent}%`, l: 'financé', color: LIME },
            { v: donors.length.toString(), l: 'donateurs', color: '#f2f1ec' }
          ].map(s => (
            <div key={s.l}>
              <p className="text-[24px] font-bold leading-none mb-1.5" style={{ color: s.color }}>{s.v}</p>
              <p className="text-[11px] text-[#f2f1ec]/50 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STICKY TABS BAR (Flat Sand Warm) ══ */}
      <div className="sticky top-[64px] z-40 border-b border-[#e0e0da] flex" style={{ backgroundColor: 'rgba(252, 251, 247, 0.96)', backdropFilter: 'blur(12px)' }}>
        {[
          { key: 'stats', label: 'Statistiques & Budget', icon: TrendingUp },
          { key: 'donors', label: `Donateurs (${donors.length})`, icon: Users },
          { key: 'settings', label: 'Paramètres & Danger', icon: Settings },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className="relative py-4 px-6 md:px-10 text-[11px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 transition-all cursor-pointer"
            style={{ color: activeTab === t.key ? '#183028' : '#bbb' }}
          >
            <t.icon size={12} strokeWidth={2.5} />
            {t.label}
            {activeTab === t.key && (
              <motion.div
                layoutId="dash-tab-marker"
                className="absolute bottom-0 left-6 right-6 md:left-10 md:right-10 h-[2.5px]"
                style={{ backgroundColor: '#183028' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ══ CONTENT AREA (Flat, borderless layout) ══ */}
      <div className="flex-1 px-10 py-12">
        <AnimatePresence mode="wait">
          
          {/* TAB: Stats & Budget */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* Left Column: Aggregated Indicators */}
              <div className="lg:col-span-7 space-y-10">
                <div className="pb-8 border-b border-[#e0e0da]">
                  <h3 className="text-[18px] font-bold text-[#183028] tracking-tight mb-6">Indicateurs clés</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stat Card 1 (Flat, Bordered) */}
                    <div className="p-6 border border-[#e0e0da] bg-transparent rounded-lg">
                      <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-2">Don moyen</p>
                      <p className="text-[32px] font-bold text-[#183028] leading-none mb-2">{avgDonation} €</p>
                      <p className="text-[12px] text-[#666]">Par contributeur unique.</p>
                    </div>

                    {/* Stat Card 2 (Flat, Bordered) */}
                    <div className="p-6 border border-[#e0e0da] bg-transparent rounded-lg">
                      <p className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-2">Temps restant</p>
                      <p className="text-[32px] font-bold text-[#183028] leading-none mb-2">{campaign.daysLeft} jours</p>
                      <p className="text-[12px] text-[#666]">Jusqu'à la fin de la campagne.</p>
                    </div>
                  </div>
                </div>

                {/* Progress detail */}
                <div className="pb-8 border-b border-[#e0e0da]">
                  <h3 className="text-[16px] font-bold text-[#183028] mb-4">Objectif et collecte</h3>
                  
                  {/* Progress Bar (Flat, Forest Green) */}
                  <div className="relative w-full h-[3px] bg-[#eef0ea] overflow-hidden my-6">
                    <motion.div
                      className="absolute inset-y-0 left-0"
                      style={{ backgroundColor: '#183028' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[13px] text-[#666]">
                    <span>Collecté : <strong>{raised.toLocaleString('fr-FR')} €</strong></span>
                    <span>Cible : <strong>{goal.toLocaleString('fr-FR')} €</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Budget Breakdown */}
              <div className="lg:col-span-5 border-l border-[#e0e0da] lg:pl-10 space-y-8">
                <div>
                  <h3 className="text-[18px] font-bold text-[#183028] tracking-tight mb-2">Répartition budgétaire</h3>
                  <p className="text-[13px] text-[#666] leading-relaxed mb-6">Visualisation de l'utilisation des fonds reversés.</p>

                  <div className="space-y-6">
                    {campaign.budgetBreakdown && campaign.budgetBreakdown.length > 0 ? (
                      campaign.budgetBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="pb-4 border-b border-[#eef0ea] last:border-b-0">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[14px] font-semibold text-[#183028]">{item.label}</span>
                            <span className="text-[13px] font-bold text-[#183028]">{item.percentage}%</span>
                          </div>
                          {/* Mini Bar */}
                          <div className="w-full h-[2px] bg-[#eef0ea]">
                            <div className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: '#183028' }} />
                          </div>
                          <p className="text-[11px] text-[#888] mt-1">
                            Soit {Math.round(goal * (item.percentage / 100)).toLocaleString('fr-FR')} € projetés.
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-[#888] italic">Aucune donnée budgétaire fournie.</p>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB: Donors */}
          {activeTab === 'donors' && (
            <motion.div
              key="donors"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl"
            >
              <div className="mb-8">
                <h3 className="text-[18px] font-bold text-[#183028] tracking-tight mb-2">Historique des dons</h3>
                <p className="text-[13px] text-[#666]">Les dons nominatifs et anonymes effectués sur cette campagne.</p>
              </div>

              {donors.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-[#e0e0da] rounded-xl bg-transparent">
                  <Heart size={28} className="text-[#bbb] mx-auto mb-4" />
                  <p className="text-[14px] font-semibold text-[#888]">Aucun don n'a été enregistré pour le moment.</p>
                  <p className="text-[12px] text-[#bbb] mt-1">Les dons des contributeurs apparaîtront ici.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e0e0da]">
                  {donors.map((d, idx) => {
                    const isAnon = d.isAnonymous;
                    const dateObj = new Date(d.createdAt);
                    const formattedDate = isNaN(dateObj.getTime())
                      ? "Récemment"
                      : dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

                    const name = isAnon
                      ? "Donateur anonyme"
                      : (d.donor?.firstName ? `${d.donor.firstName} ${d.donor.lastName || ''}` : `${d.donorInfo?.firstName || 'Donateur'} ${d.donorInfo?.lastName || ''}`);

                    const avatar = isAnon
                      ? DEFAULT_AVATAR
                      : (d.donor?.avatar || DEFAULT_AVATAR);

                    return (
                      <div key={d._id || idx} className="py-6 flex items-start gap-4 transition-colors">
                        <img
                          src={avatar}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#e0e0da]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <h4 className="text-[14px] font-bold text-[#183028] truncate">{name}</h4>
                            <span className="text-[14px] font-extrabold text-[#183028] shrink-0">+{d.amount} €</span>
                          </div>

                          <p className="text-[11px] text-[#888] mt-0.5">{formattedDate}</p>

                          {d.message && (
                            <div className="mt-2.5 p-3 rounded bg-[#f2f1ec]/50 border border-[#e0e0da]/40 text-[13px] text-[#666] leading-relaxed">
                              "{d.message}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: Settings & Danger Zone */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl space-y-14"
            >
              {/* Settings Form */}
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="pb-4 border-b border-[#e0e0da]">
                  <h3 className="text-[18px] font-bold text-[#183028] tracking-tight mb-2">Modifier la campagne</h3>
                  <p className="text-[13px] text-[#666]">Mettez à jour les informations essentielles de votre campagne de financement.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1.5">Titre du projet</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[#183028] text-[13px]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028]">Description courte</label>
                      <span className="text-[9px] font-medium text-[#888]">{shortDescription.length}/300</span>
                    </div>
                    <textarea
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="w-full px-4 py-2.5 rounded-md border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[#183028] text-[13px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1.5">Objectif financier (€)</label>
                      <input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Number(e.target.value))}
                        min={100}
                        className="w-full px-4 py-2.5 rounded-md border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[#183028] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1.5">Catégorie</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-md border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[#183028] text-[13px]"
                      >
                        {['Éducation', 'Santé', 'Environnement', 'Eau & Assainissement', 'Alimentation', 'Économie Solidaire', 'Réfugiés & Urgence', 'Énergie & Climat', 'Culture & Art', 'Autre'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {campaign.status !== 'pending' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1.5">Statut de diffusion</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-md border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[#183028] text-[13px]"
                      >
                        <option value="active">Active (Publique et ouverte)</option>
                        <option value="paused">En pause (Hors-ligne temporairement)</option>
                        <option value="completed">Terminée (Fermée)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1.5">Tags (mots clés séparés par des virgules)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="ex: sahel, puits, urgence"
                      className="w-full px-4 py-2.5 rounded-md border border-[#e0e0da] focus:outline-none focus:border-[#183028] bg-white text-[#183028] text-[13px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-all inline-flex items-center gap-2 hover:scale-[1.03]"
                    style={{ backgroundColor: '#183028', color: '#cde877' }}
                  >
                    <Save size={13} />
                    {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>

              {/* Danger Zone (Flat styling, red bordered border, no rounded cards with shadows) */}
              <div className="pt-10 border-t border-[#e0e0da] space-y-6">
                <div>
                  <h3 className="text-[18px] font-bold text-red-700 tracking-tight mb-2">Zone de danger</h3>
                  <p className="text-[13px] text-[#666]">Actions irréversibles relatives à la suppression définitive de votre campagne.</p>
                </div>

                <div className="p-6 border border-red-200 bg-red-50/20 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-[14px] font-bold text-red-800">Supprimer la campagne</h4>
                    <p className="text-[12px] text-[#777] mt-1 leading-relaxed max-w-sm">
                      Désactive définitivement la campagne. Les statistiques resteront sauvegardées de manière sécurisée mais la campagne ne sera plus visible du public.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setShowDeleteModal(true);
                    }}
                    className="px-6 py-3 rounded-full border border-red-300 hover:bg-red-500 hover:text-white text-red-600 transition-all text-[11px] font-bold tracking-[0.12em] uppercase shrink-0 inline-flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    Supprimer le projet
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ══ DELETE CONFIRMATION OVERLAY MODAL ══ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#f2f1ec] rounded-lg p-6 md:p-8 border border-red-200/50 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-red-600 pb-4 border-b border-[#e0e0da]">
              <AlertTriangle size={20} strokeWidth={2.5} />
              <h3 className="text-[16px] font-extrabold uppercase tracking-wider">Confirmer la suppression</h3>
            </div>

            <p className="text-[13px] text-[#666] leading-relaxed mt-4">
              Êtes-vous absolument sûr de vouloir supprimer la campagne <strong>"{campaign.title}"</strong> ? Cette action est définitive.
            </p>

            <p className="text-[12px] text-red-700 bg-red-50/50 border border-red-100 p-3 rounded mt-4 leading-relaxed font-sans">
              ⚠️ Attention : Toutes les informations publiques associées à cette campagne seront retirées.
            </p>

            <div className="mt-6">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183028] mb-1.5">
                Saisissez "<strong>supprimer</strong>" ci-dessous :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="supprimer"
                className="w-full px-4 py-2.5 rounded border border-[#e0e0da] focus:outline-none focus:border-red-500 bg-white text-[#183028] text-[13px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e0da] mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-full border border-[#e0e0da] hover:bg-black/5 text-[10px] font-bold tracking-[0.1em] uppercase transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteCampaign}
                disabled={deleteConfirmText.toLowerCase() !== 'supprimer'}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-[0.1em] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
