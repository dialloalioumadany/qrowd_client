import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Globe, 
  Tag, 
  Calendar, 
  DollarSign,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore
import ImageTool from '@editorjs/image';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BG = '#183028';
const LIME = '#cde877';
const OFFWHITE = '#f2f1ec';

const CATEGORIES = [
  'Éducation',
  'Santé',
  'Environnement',
  'Eau & Assainissement',
  'Alimentation',
  'Économie Solidaire',
  'Réfugiés & Urgence',
  'Énergie & Climat',
  'Culture & Art',
  'Autre'
];

interface BudgetBreakdownItem {
  label: string;
  percentage: number;
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const toast = useToast();

  const editorRef = useRef<EditorJS | null>(null);
  
  // Step management
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 States
  const [title, setTitle] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Step 2 States
  const [targetAmount, setTargetAmount] = useState<number>(5000);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<string>('Éducation');
  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdownItem[]>([
    { label: 'Construction & Matériaux', percentage: 60 },
    { label: 'Frais de fonctionnement', percentage: 25 },
    { label: 'Logistique & Transport', percentage: 15 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Init Editor.js
  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs-container',
        placeholder: 'Racontez l\'histoire de votre campagne, ajoutez des images, des citations...',
        tools: {
          header: {
            class: Header as any,
            inlineToolbar: ['link'],
            config: { placeholder: 'Titre de section', levels: [2, 3], defaultLevel: 2 }
          },
          list: {
            class: List as any,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as any,
            inlineToolbar: true,
            config: { quotePlaceholder: 'Saisissez la citation', captionPlaceholder: 'Auteur' }
          },
          delimiter: Delimiter as any,
          image: {
            class: ImageTool as any,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const jwt = localStorage.getItem('qrowd_token');
                  if (!jwt) {
                    return { success: 0, message: 'Non authentifié' };
                  }

                  const fd = new FormData();
                  fd.append('image', file);
                  fd.append('folder', 'campaign_gallery');

                  try {
                    const res = await fetch('http://localhost:5000/api/upload/image', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${jwt}`
                      },
                      body: fd
                    });

                    const data = await res.json();
                    if (res.ok && data.status === 'success' && data.data?.url) {
                      return {
                        success: 1,
                        file: {
                          url: data.data.url
                        }
                      };
                    }
                    return { success: 0, message: data.message || 'Téléversement impossible.' };
                  } catch (e) {
                    return { success: 0, message: 'Erreur réseau.' };
                  }
                }
              }
            }
          }
        },
      });
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          // Ignore destroy error on strict mode hot reloads
        }
        editorRef.current = null;
      }
    };
  }, []);

  // Redirect if not connected or not NGO
  useEffect(() => {
    if (!token) {
      toast.error('Vous devez être connecté pour créer une campagne.');
      navigate('/login');
    }
  }, [token]);

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      toast.success('Bannière sélectionnée.');
    }
  };

  const handleGoToParameters = async () => {
    if (!title.trim()) {
      toast.error('Veuillez saisir un titre pour votre campagne.');
      return;
    }
    if (!bannerFile) {
      toast.error('Veuillez ajouter une bannière de couverture.');
      return;
    }

    const blocksData = await editorRef.current?.save();
    if (!blocksData || !blocksData.blocks || blocksData.blocks.length === 0) {
      toast.error("Veuillez rédiger l'histoire de votre campagne dans l'éditeur.");
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Budget Breakdown handlers
  const handleAddBudgetRow = () => {
    setBudgetBreakdown([...budgetBreakdown, { label: '', percentage: 0 }]);
  };

  const handleRemoveBudgetRow = (index: number) => {
    setBudgetBreakdown(budgetBreakdown.filter((_, i) => i !== index));
  };

  const handleUpdateBudgetRow = (index: number, key: keyof BudgetBreakdownItem, val: string | number) => {
    const updated = [...budgetBreakdown];
    if (key === 'percentage') {
      updated[index].percentage = Math.max(0, Math.min(100, Number(val) || 0));
    } else {
      updated[index].label = String(val);
    }
    setBudgetBreakdown(updated);
  };

  const budgetTotalPct = budgetBreakdown.reduce((acc, curr) => acc + curr.percentage, 0);

  // Submit final campaign
  const handlePublishCampaign = async () => {
    if (isSubmitting) return;

    // Validate Step 2 fields
    if (targetAmount < 100) {
      toast.error("L'objectif financier doit être de 100 € minimum.");
      return;
    }
    if (!endDate) {
      toast.error('La date de fin est requise.');
      return;
    }
    if (new Date(endDate) <= new Date()) {
      toast.error('La date de fin doit être dans le futur.');
      return;
    }
    if (!shortDescription.trim()) {
      toast.error('La description courte est requise.');
      return;
    }
    if (shortDescription.length > 300) {
      toast.error('La description courte ne doit pas dépasser 300 caractères.');
      return;
    }
    if (budgetTotalPct !== 100) {
      toast.error('La répartition budgétaire globale doit être égale à 100 %.');
      return;
    }
    const emptyBudgetLabel = budgetBreakdown.some(b => !b.label.trim());
    if (emptyBudgetLabel) {
      toast.error('Veuillez remplir les libellés de tous vos postes budgétaires.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Publication de la campagne en cours...');

    try {
      // 1. Upload Banner Image
      let coverImageUrl = '';
      if (bannerFile) {
        const fd = new FormData();
        fd.append('image', bannerFile);
        fd.append('folder', 'campaign_cover');

        const uploadRes = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fd
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.status === 'success' && uploadData.data?.url) {
          coverImageUrl = uploadData.data.url;
        } else {
          throw new Error(uploadData.message || 'Échec de l\'upload de la bannière.');
        }
      }

      // 2. Extract Story from EditorJS
      const blocksData = await editorRef.current?.save();
      if (!blocksData || !blocksData.blocks || blocksData.blocks.length === 0) {
        throw new Error("L'histoire de votre campagne semble vide.");
      }

      const descriptionPayload = JSON.stringify(blocksData);

      // 3. Post to Campaign API
      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const campaignPayload = {
        title,
        description: descriptionPayload,
        shortDescription,
        category,
        targetAmount,
        endDate: new Date(endDate).toISOString(),
        coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1800',
        tags: tagsArray,
        location: {
          country: country.trim() || undefined,
          city: city.trim() || undefined,
        },
        budgetBreakdown: budgetBreakdown.map(b => ({
          label: b.label.trim(),
          percentage: b.percentage
        })),
        status: 'pending' // En attente de validation admin
      };

      const res = await fetch('http://localhost:5000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(campaignPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Impossible de créer la campagne.');
      }

      toast.success('Votre campagne a été publiée avec succès ! Elle est en cours de validation.', { id: toastId });
      
      // Navigate to the newly created campaign page
      const newCampaignId = data.data?.campaign?._id;
      if (newCampaignId) {
        navigate(`/campaign/${newCampaignId}`);
      } else {
        navigate('/ngo/profile');
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Une erreur est survenue lors de la publication.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: OFFWHITE }}>
      
      {/* Top sticky bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-md" 
        style={{ backgroundColor: 'rgba(242, 241, 236, 0.85)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
        initial={{ y: '-100%' }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        <button 
          onClick={() => {
            if (step === 2) setStep(1);
            else navigate(-1);
          }} 
          className="flex items-center gap-2 text-[#333] hover:text-[#000] transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-[11px] font-bold tracking-[0.15em] hidden sm:block">
            {step === 2 ? "RETOUR À L'ÉDITEUR" : "RETOUR"}
          </span>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#bbb]">
            <span>1. HISTOIRE</span>
            <span style={{ color: step === 2 ? LIME : '#bbb' }}>→</span>
            <span style={{ color: step === 2 ? BG : '#bbb' }}>2. PARAMÈTRES</span>
          </div>

          {step === 1 ? (
            <button 
              onClick={handleGoToParameters}
              className="px-6 py-3 rounded-full text-[12px] font-bold tracking-[0.1em] text-white hover:brightness-110 transition-all" 
              style={{ backgroundColor: BG }}
            >
              PARAMÉTRER LA CAMPAGNE
            </button>
          ) : (
            <button 
              onClick={handlePublishCampaign}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full text-[12px] font-bold tracking-[0.1em] text-white hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50" 
              style={{ backgroundColor: BG }}
            >
              {isSubmitting ? 'PUBLICATION...' : 'CONFIRMER & PUBLIER'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: History editor */}
        {step === 1 && (
          <motion.div 
            key="step1"
            className="max-w-[800px] mx-auto pt-28 px-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Banner upload */}
            <div className="mb-12 relative group">
              <label className="block w-full rounded-2xl overflow-hidden cursor-pointer bg-[#e8e8e3] transition-all hover:opacity-95" style={{ aspectRatio: '16/7' }}>
                <input type="file" accept="image/*" className="hidden" onChange={handleBanner} />
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover animate-fade-in" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[#888]">
                    <ImageIcon size={32} className="mb-3 opacity-55 text-[#183028]" />
                    <p className="text-[14px] font-semibold text-[#183028]">Ajouter une bannière de couverture</p>
                    <p className="text-[11px] opacity-60 mt-1">Format recommandé : Paysage (JPG, PNG ou WebP)</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-5 py-2.5 bg-white rounded-full text-[11px] font-bold tracking-[0.12em] text-[#111]">
                    {bannerPreview ? 'MODIFIER LA BANNIÈRE' : 'TÉLÉVERSER UNE COUVERTURE'}
                  </span>
                </div>
              </label>
            </div>

            {/* Title */}
            <div className="mb-8">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de votre campagne..."
                rows={1}
                className="w-full text-[36px] md:text-[54px] font-medium leading-[1.1] tracking-tight bg-transparent border-none outline-none resize-none placeholder-[#ccc] text-[#1a1a1a]"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>

            {/* EditorJS container */}
            <div className="editor-wrapper min-h-[350px] bg-white rounded-2xl p-6 md:p-10 border border-[#e2e2da]">
              <div id="editorjs-container" className="prose prose-lg max-w-none text-[#333]" />
            </div>
          </motion.div>
        )}

        {/* STEP 2: Parameters setup */}
        {step === 2 && (
          <motion.div 
            key="step2"
            className="max-w-[1100px] mx-auto pt-28 px-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-10 text-center md:text-left">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#bbb] mb-2">— ÉTAPE FINALE</p>
              <h1 className="text-[32px] md:text-[46px] font-medium leading-none text-[#1a1a1a]">
                Paramétrez votre <em className="font-['Cormorant_Garamond'] italic font-normal" style={{ color: BG }}>cagnotte</em>
              </h1>
              <p className="text-[#666] text-[14px] mt-2 max-w-[600px]">
                Renseignez les détails financiers, de ciblage et de transparence budgétaire avant de soumettre la campagne à la modération.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form details (Left) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 md:p-8 border border-[#e2e2da] flex flex-col gap-6">
                
                {/* Financial Target Amount */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[#183028] uppercase mb-2">
                    <DollarSign size={14} style={{ color: LIME }} /> Objectif de financement (€)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min={100}
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3.5 px-4 text-[16px] font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#183028] transition-all"
                      placeholder="Ex: 5000"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#bbb]">EUR</div>
                  </div>
                  <span className="text-[10px] text-[#bbb] mt-1 block">Objectif minimum de 100 €</span>
                </div>

                {/* Grid Category & EndDate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category */}
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[#183028] uppercase mb-2">
                      <Briefcase size={14} style={{ color: LIME }} /> Catégorie
                    </label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3.5 px-4 text-[14px] font-medium text-[#1a1a1a] focus:outline-none focus:border-[#183028] transition-all cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[#183028] uppercase mb-2">
                      <Calendar size={14} style={{ color: LIME }} /> Date limite
                    </label>
                    <input 
                      type="date"
                      value={endDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3 px-4 text-[14px] font-medium text-[#1a1a1a] focus:outline-none focus:border-[#183028] transition-all"
                    />
                  </div>
                </div>

                {/* Pitch / Short Description */}
                <div>
                  <label className="flex items-center justify-between text-[11px] font-bold tracking-[0.15em] text-[#183028] uppercase mb-2">
                    <span>Pitch court de la campagne</span>
                    <span className={shortDescription.length > 300 ? 'text-red-500' : 'text-[#bbb]'}>
                      {shortDescription.length}/300
                    </span>
                  </label>
                  <textarea 
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value.slice(0, 300))}
                    rows={3}
                    maxLength={300}
                    className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3 px-4 text-[14px] leading-relaxed text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#183028] transition-all"
                    placeholder="Résumez la mission de cette campagne en 2 ou 3 phrases percutantes..."
                  />
                  <span className="text-[10px] text-[#bbb] mt-1 block">Sera visible sur les cartes d'aperçu de la campagne.</span>
                </div>

                {/* Grid Location */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[#183028] uppercase mb-2">
                    <Globe size={14} style={{ color: LIME }} /> Zone géographique (Localisation)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Pays (ex: Sénégal)"
                      className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3 px-4 text-[14px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#183028] transition-all"
                    />
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ville (ex: Dakar)"
                      className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3 px-4 text-[14px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#183028] transition-all"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-[#183028] uppercase mb-2">
                    <Tag size={14} style={{ color: LIME }} /> Tags associés
                  </label>
                  <input 
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="eau, forage, sahel, humanitaire (séparés par des virgules)"
                    className="w-full bg-[#f8f7f2] border border-[#e2e2da] rounded-xl py-3 px-4 text-[14px] text-[#1a1a1a] placeholder-[#bbb] focus:outline-none focus:border-[#183028] transition-all"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.split(',').map((t, idx) => {
                      const clean = t.trim();
                      if (!clean) return null;
                      return (
                        <span key={idx} className="bg-[#183028]/10 text-[#183028] text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
                          #{clean}
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Transparency budget breakdown (Right) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Visual Status Indicator Panel */}
                <div className="bg-[#183028] text-[#f2f1ec] rounded-2xl p-6 border border-white/5">
                  <h3 className="text-[14px] font-bold tracking-widest uppercase mb-4" style={{ color: LIME }}>Statut de validation</h3>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between text-[13px] border-b border-white/5 pb-2">
                      <span className="opacity-70">Histoire & Description</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: LIME }}>
                        <Check size={13} strokeWidth={3} /> OK
                      </span>
                    </li>
                    <li className="flex items-center justify-between text-[13px] border-b border-white/5 pb-2">
                      <span className="opacity-70">Bannière de couverture</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: LIME }}>
                        <Check size={13} strokeWidth={3} /> OK
                      </span>
                    </li>
                    <li className="flex items-center justify-between text-[13px] border-b border-white/5 pb-2">
                      <span className="opacity-70">Objectif financier ({targetAmount}€)</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                        {targetAmount >= 100 ? (
                          <span style={{ color: LIME }} className="flex items-center gap-1"><Check size={13} strokeWidth={3} /> PRÊT</span>
                        ) : (
                          <span className="text-red-400">INCORRECT</span>
                        )}
                      </span>
                    </li>
                    <li className="flex items-center justify-between text-[13px]">
                      <span className="opacity-70">Budget ({budgetTotalPct}%)</span>
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                        {budgetTotalPct === 100 ? (
                          <span style={{ color: LIME }} className="flex items-center gap-1"><Check size={13} strokeWidth={3} /> ÉQUILIBRÉ</span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1"><AlertCircle size={13} /> {budgetTotalPct}% / 100%</span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Budget breakdown builder */}
                <div className="bg-white rounded-2xl p-6 border border-[#e2e2da]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[12px] font-bold tracking-[0.15em] text-[#183028] uppercase">Transparence Budgétaire</h3>
                      <p className="text-[11px] text-[#bbb]">Répartition des dons collectés</p>
                    </div>
                    
                    <button 
                      onClick={handleAddBudgetRow}
                      className="p-1.5 rounded-full hover:bg-[#f2f1ec] transition-colors border border-[#e2e2da]"
                      title="Ajouter un poste budgétaire"
                    >
                      <Plus size={15} className="text-[#183028]" />
                    </button>
                  </div>

                  {/* Visual allocation chart simulator */}
                  <div className="h-3 w-full rounded-full bg-[#f2f1ec] overflow-hidden flex mb-6">
                    {budgetBreakdown.map((item, idx) => {
                      const colors = ['#183028', '#cde877', '#a4bf4c', '#6e852a', '#e8e8e3'];
                      const col = colors[idx % colors.length];
                      if (item.percentage <= 0) return null;
                      return (
                        <div 
                          key={idx}
                          style={{ width: `${item.percentage}%`, backgroundColor: col }}
                          className="h-full transition-all duration-300"
                          title={`${item.label || 'Poste sans nom'} : ${item.percentage}%`}
                        />
                      );
                    })}
                  </div>

                  {/* List items inputs */}
                  <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                    {budgetBreakdown.map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center bg-[#f8f7f2] p-3 rounded-xl border border-[#e2e2da]/60">
                        <input 
                          type="text" 
                          value={item.label}
                          onChange={(e) => handleUpdateBudgetRow(idx, 'label', e.target.value)}
                          placeholder="Nom du poste (ex: Matériel)"
                          className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-[#1a1a1a] focus:outline-none"
                        />
                        <div className="flex items-center gap-1 shrink-0 w-20">
                          <input 
                            type="number"
                            min={0}
                            max={100}
                            value={item.percentage}
                            onChange={(e) => handleUpdateBudgetRow(idx, 'percentage', e.target.value)}
                            className="w-12 bg-transparent text-right font-bold text-[13px] text-[#183028] focus:outline-none"
                          />
                          <span className="text-[11px] font-bold text-[#bbb]">%</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveBudgetRow(idx)}
                          className="p-1 text-[#bbb] hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total summary */}
                  <div className="mt-5 pt-4 border-t border-[#e2e2da] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#bbb] uppercase">Somme totale</span>
                    <span 
                      className="text-[16px] font-bold"
                      style={{ color: budgetTotalPct === 100 ? BG : 'orange' }}
                    >
                      {budgetTotalPct} %
                    </span>
                  </div>

                  {budgetTotalPct !== 100 && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>La somme des pourcentages doit valoir exactement 100 %. Ajustez les valeurs.</span>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
      
    </div>
  );
}
