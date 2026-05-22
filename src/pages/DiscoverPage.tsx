import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowUpRight, Search, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CAMPAIGNS, type Campaign } from '@/data/campaigns';

/* ── Tokens ── */
const INK    = '#111111';
const SUB    = '#555555';
const MUTED  = '#999999';
const BORDER = '#e8e8e8';
const ACCENT = '#183028';
const LIME   = '#cde877';

/* ── Categories & sort ── */
const ALL_CATS = ['Toutes', ...Array.from(new Set(CAMPAIGNS.map((c) => c.category)))];
type SortKey = 'popular' | 'ending' | 'funded' | 'recent';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Populaires' },
  { key: 'ending',  label: 'Fin proche' },
  { key: 'funded',  label: 'Mieux financées' },
  { key: 'recent',  label: 'Récentes' },
];

function pct(c: Campaign) {
  return Math.round((c.raised / c.goal) * 100);
}

/* ── Tiny NGO avatar ── */
function Avatar({ name, logo }: { name: string; logo?: string | null }) {
  if (logo) return <img src={logo} alt={name} className="w-5 h-5 rounded-full object-cover shrink-0" />;
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
      style={{ backgroundColor: '#f0f0f0', color: ACCENT }}
    >
      {initials}
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   CAMPAIGN CARD — clean, flat, airy
   ────────────────────────────────────────────────────── */
function CampaignCard({
  campaign,
  index,
  onClick,
}: {
  campaign: Campaign;
  index: number;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const p = pct(campaign);
  const isUrgent = campaign.daysLeft <= 10;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group cursor-pointer flex flex-col"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      {/* ── Image ── */}
      <div
        className="relative overflow-hidden w-full mb-4"
        style={{ aspectRatio: '4/3', borderRadius: '3px', backgroundColor: '#f6f6f4' }}
      >
        <img
          src={campaign.heroImg}
          alt={campaign.title}
          className="w-full h-full object-cover"
          style={{
            transform: hov ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />

        {/* Category — top left */}
        <span
          className="absolute top-3 left-3 text-[9px] font-semibold uppercase tracking-[0.16em] px-2.5 py-1"
          style={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            color: ACCENT,
            borderRadius: '2px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {campaign.category}
        </span>

        {/* Urgent */}
        {isUrgent && (
          <span
            className="absolute top-3 right-3 text-[9px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 flex items-center gap-1"
            style={{ backgroundColor: ACCENT, color: LIME, borderRadius: '2px' }}
          >
            <Clock size={8} strokeWidth={2.5} />
            Urgent
          </span>
        )}
      </div>

      {/* ── Meta ── */}
      <div className="flex flex-col gap-2.5 flex-1">
        {/* NGO */}
        <div className="flex items-center gap-2">
          <Avatar name={campaign.ngoName} logo={campaign.ngoLogo} />
          <span className="text-[11px] font-medium truncate" style={{ color: MUTED }}>
            {campaign.ngoName}
          </span>
        </div>

        {/* Title */}
        <h2
          className="font-medium leading-snug line-clamp-2"
          style={{
            fontSize: '15px',
            color: INK,
            letterSpacing: '-0.01em',
            transition: 'color 0.2s',
          }}
        >
          {campaign.title}
        </h2>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress bar */}
        <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: BORDER }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: ACCENT }}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(p, 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3" style={{ color: MUTED }}>
            <span className="text-[11px] flex items-center gap-1">
              <Clock size={10} strokeWidth={2} />
              {campaign.daysLeft}j
            </span>
            <span className="text-[11px] flex items-center gap-1">
              <Users size={10} strokeWidth={2} />
              {campaign.donors.toLocaleString('fr-FR')}
            </span>
          </div>
          <span className="text-[12px] font-semibold" style={{ color: ACCENT }}>
            {p}%
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ──────────────────────────────────────────────────────
   DISCOVER PAGE
   ────────────────────────────────────────────────────── */
export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [cat, setCat]       = useState('Toutes');
  const [sort, setSort]     = useState<SortKey>('popular');
  const [search, setSearch] = useState('');
  const [apiCampaigns, setApiCampaigns] = useState<Campaign[]>([]);

  /* ── API ── */
  useEffect(() => {
    fetch('http://localhost:5000/api/campaigns?status=all&limit=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data?.campaigns)) {
          const visible = data.data.campaigns.filter((c: any) =>
            ['active', 'pending', 'completed'].includes(c.status)
          );
          setApiCampaigns(
            visible.map((c: any) => ({
              id: c._id,
              category: c.category || 'Solidarité',
              title: c.title,
              subtitle: c.shortDescription || '',
              heroImg: c.coverImage || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1800',
              raised: c.raisedAmount || 0,
              goal: c.targetAmount || 1000,
              donors: c.donorsCount || 0,
              daysLeft: typeof c.daysLeft === 'number' ? c.daysLeft : 30,
              ngoName: c.organization?.name || 'ONG Partenaire',
              ngoCountry: c.organization?.address?.country || 'Afrique',
              ngoLogo: c.organization?.logo || null,
              description: c.description || '',
              quote: c.organization?.mission || 'Ensemble, transformons des vies.',
              quoteAuthor: c.organization?.name || 'Notre engagement',
              breakdown: c.budgetBreakdown?.length
                ? c.budgetBreakdown.map((b: any) => ({ label: b.label, pct: b.percentage }))
                : [{ label: 'Projet principal', pct: 100 }],
              gallery: c.gallery?.length ? c.gallery : [c.coverImage].filter(Boolean),
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const allCampaigns = useMemo(() => [...apiCampaigns, ...CAMPAIGNS], [apiCampaigns]);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...allCampaigns];
    if (cat !== 'Toutes') list = list.filter((c) => c.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.ngoName.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case 'popular': list.sort((a, b) => b.donors - a.donors); break;
      case 'ending':  list.sort((a, b) => a.daysLeft - b.daysLeft); break;
      case 'funded':  list.sort((a, b) => pct(b) - pct(a)); break;
    }
    return list;
  }, [allCampaigns, cat, sort, search]);

  const totalRaised = useMemo(() => allCampaigns.reduce((s, c) => s + c.raised, 0), [allCampaigns]);
  const totalDonors = useMemo(() => allCampaigns.reduce((s, c) => s + c.donors, 0), [allCampaigns]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══ NAVBAR ══ */}
      <nav
        className="sticky top-0 z-50 bg-white"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-[1200px] mx-auto px-8 h-[60px] flex items-center justify-between">

          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[12px] font-medium transition-colors duration-200"
            style={{ color: MUTED }}
            onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Accueil
          </button>

          {/* Logo */}
          <button onClick={() => navigate('/')} className="absolute left-1/2 -translate-x-1/2">
            <span className="font-medium tracking-tight" style={{ color: ACCENT, fontSize: '22px' }}>
              Qrowd
            </span>
          </button>

          {/* CTA */}
          <button
            onClick={() => navigate(user ? (user.role === 'ngo' ? '/ngo/profile' : '/profile') : '/register')}
            className="flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-200"
            style={{ color: ACCENT }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.65')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {user ? 'Mon compte' : 'Lancer une campagne'}
            <ArrowUpRight size={13} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* ══ PAGE HEADER ══ */}
      <div className="max-w-[1200px] mx-auto px-8 pt-16 pb-12">
        <div className="flex items-end justify-between gap-8 flex-wrap">

          {/* Left: headline */}
          <div>
            <motion.p
              className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-4"
              style={{ color: MUTED }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Découvrir · {filtered.length} campagne{filtered.length > 1 ? 's' : ''}
            </motion.p>

            <motion.h1
              className="font-medium leading-[1.08]"
              style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: INK, letterSpacing: '-0.025em' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
            >
              Des projets qui comptent.
            </motion.h1>
          </div>

          {/* Right: stats */}
          <motion.div
            className="flex items-center gap-8 pb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-right">
              <div className="text-[20px] font-semibold" style={{ color: INK, letterSpacing: '-0.02em' }}>
                {totalRaised.toLocaleString('fr-FR')} €
              </div>
              <div className="text-[11px]" style={{ color: MUTED }}>collectés</div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: BORDER }} />
            <div className="text-right">
              <div className="text-[20px] font-semibold" style={{ color: INK, letterSpacing: '-0.02em' }}>
                {totalDonors.toLocaleString('fr-FR')}
              </div>
              <div className="text-[11px]" style={{ color: MUTED }}>donateurs</div>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: BORDER }} />
            <div className="text-right">
              <div className="text-[20px] font-semibold" style={{ color: INK, letterSpacing: '-0.02em' }}>
                89%
              </div>
              <div className="text-[11px]" style={{ color: MUTED }}>reversés aux projets</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══ FILTER BAR ══ */}
      <div
        className="sticky top-[60px] z-40 bg-white"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="max-w-[1200px] mx-auto px-8 flex items-center gap-0 h-[50px]">

          {/* Category tabs */}
          <div className="flex items-center gap-0 flex-1 overflow-x-auto no-scrollbar h-full">
            {ALL_CATS.map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="shrink-0 h-full px-4 text-[11px] font-medium relative transition-colors duration-150 whitespace-nowrap"
                  style={{ color: active ? INK : MUTED }}
                >
                  {c}
                  {active && (
                    <motion.div
                      layoutId="cat-underline"
                      className="absolute bottom-0 left-4 right-4 h-[1.5px]"
                      style={{ backgroundColor: INK }}
                      transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-5 mx-3 shrink-0" style={{ backgroundColor: BORDER }} />

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-transparent outline-none text-[11px] font-medium cursor-pointer shrink-0 pr-1"
            style={{ color: SUB, fontFamily: "'Inter', sans-serif" }}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key} style={{ backgroundColor: '#fff', color: INK }}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Divider */}
          <div className="w-px h-5 mx-3 shrink-0" style={{ backgroundColor: BORDER }} />

          {/* Search */}
          <div className="flex items-center gap-2 shrink-0">
            <Search size={13} strokeWidth={1.75} style={{ color: MUTED }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="bg-transparent outline-none text-[11px] w-[140px]"
              style={{ color: INK, fontFamily: "'Inter', sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch('')}>
                <X size={11} style={{ color: MUTED }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══ GRID ══ */}
      <div className="max-w-[1200px] mx-auto px-8 py-14">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 text-center"
            >
              <p className="text-[14px]" style={{ color: MUTED }}>Aucune campagne trouvée.</p>
            </motion.div>
          ) : (
            <motion.div
              key={cat + sort + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14"
            >
              <AnimatePresence>
                {filtered.map((campaign, i) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={i}
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ BOTTOM STRIP ══ */}
      <div
        className="border-t"
        style={{ borderColor: BORDER }}
      >
        <div className="max-w-[1200px] mx-auto px-8 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-[11px] font-medium mb-3" style={{ color: MUTED }}>
              Vous portez un projet ?
            </p>
            <h2
              className="font-medium leading-tight"
              style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', color: INK, letterSpacing: '-0.02em' }}
            >
              Publiez votre campagne sur Qrowd.
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 px-6 py-3 text-[12px] font-semibold transition-opacity duration-200 hover:opacity-80"
              style={{ backgroundColor: ACCENT, color: '#fff', borderRadius: '3px' }}
            >
              Créer un compte
              <ChevronRight size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 text-[12px] font-medium transition-colors duration-200"
              style={{ color: SUB, border: `1px solid ${BORDER}`, borderRadius: '3px' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#bbb')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
            >
              J'ai un compte
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
