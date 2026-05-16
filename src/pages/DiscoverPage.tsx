import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Bookmark, ArrowUpRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CAMPAIGNS, type Campaign } from '@/data/campaigns';

/* ── Design tokens ── */
const BG   = '#183028';
const LIME = '#cde877';
const OW   = '#f2f1ec';

/* ── Categories + sort ── */
const ALL_CATS = ['Toutes', ...Array.from(new Set(CAMPAIGNS.map((c) => c.category)))];

type SortKey = 'popular' | 'ending' | 'funded' | 'recent';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popular',  label: 'Les plus populaires' },
  { key: 'ending',   label: 'Fin imminente'        },
  { key: 'funded',   label: 'Mieux financées'      },
  { key: 'recent',   label: 'Récentes'             },
];

function pct(c: Campaign) {
  return Math.round((c.raised / c.goal) * 100);
}

/* ── NGO initials avatar ── */
function NgoAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
      style={{ backgroundColor: BG, color: LIME, border: `1.5px solid rgba(205,232,119,0.3)` }}
    >
      {initials}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   CampaignCard — Kickstarter-style : image top, info bottom
──────────────────────────────────────────────────────── */
function CampaignCard({
  campaign,
  index,
  onClick,
}: {
  campaign: Campaign;
  index: number;
  onClick: () => void;
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const p = pct(campaign);
  const isUrgent = campaign.daysLeft <= 10;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group cursor-pointer flex flex-col"
      style={{ backgroundColor: '#0f2118' }}
      onClick={onClick}
    >
      {/* ── Image zone ── */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={campaign.heroImg}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
        />

        {/* Subtle bottom fade for continuity */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2118]/60 to-transparent" />

        {/* Category badge */}
        <div
          className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1.5"
          style={{ backgroundColor: BG, color: LIME }}
        >
          {campaign.category}
        </div>

        {/* Urgent badge */}
        {isUrgent && (
          <div
            className="absolute top-3 right-10 text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1.5 flex items-center gap-1"
            style={{ backgroundColor: LIME, color: BG }}
          >
            <Clock size={9} strokeWidth={2.5} />
            Urgent
          </div>
        )}

        {/* Bookmark */}
        <button
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          style={{ backgroundColor: 'rgba(15,33,24,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { e.stopPropagation(); setBookmarked((v) => !v); }}
        >
          <Bookmark
            size={13}
            strokeWidth={1.5}
            style={{ color: bookmarked ? LIME : OW, fill: bookmarked ? LIME : 'none' }}
          />
        </button>
      </div>

      {/* ── Info zone ── */}
      <div
        className="flex flex-col gap-3 p-4 flex-1"
        style={{ borderTop: '1px solid rgba(205,232,119,0.06)' }}
      >
        {/* NGO row */}
        <div className="flex items-center gap-2">
          <NgoAvatar name={campaign.ngoName} />
          <div className="flex-1 min-w-0">
            <p
              className="text-[11px] font-bold truncate leading-tight"
              style={{ color: LIME }}
            >
              {campaign.ngoName}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(242,241,236,0.35)' }}>
              {campaign.ngoCountry}
            </p>
          </div>
        </div>

        {/* Title */}
        <h2
          className="font-semibold leading-tight transition-colors duration-300 group-hover:text-[#cde877] line-clamp-2"
          style={{ color: OW, fontSize: '15px' }}
        >
          {campaign.title}
        </h2>

        {/* Progress bar */}
        <div className="relative w-full h-[3px] bg-white/10 overflow-hidden mt-auto">
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ backgroundColor: p >= 75 ? LIME : 'rgba(242,241,236,0.5)' }}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(p, 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'rgba(242,241,236,0.4)' }}>
            <span className="flex items-center gap-1">
              <Clock size={10} strokeWidth={1.5} />
              {campaign.daysLeft}j restants
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users size={10} strokeWidth={1.5} />
              {campaign.donors.toLocaleString('fr-FR')}
            </span>
          </div>
          <span className="text-[11px] font-bold" style={{ color: p >= 75 ? LIME : 'rgba(242,241,236,0.55)' }}>
            Financé à {p}%
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ────────────────────────────────────────────────────────
   DiscoverPage — main export
──────────────────────────────────────────────────────── */
export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cat, setCat]         = useState('Toutes');
  const [sort, setSort]       = useState<SortKey>('popular');
  const [search, setSearch]   = useState('');

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...CAMPAIGNS];
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
      case 'recent':  break;
    }
    return list;
  }, [cat, sort, search]);

  /* ── Stats ── */
  const totalRaised = CAMPAIGNS.reduce((s, c) => s + c.raised, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>

      {/* ══ NAVBAR ══ */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-10 h-[64px]"
        style={{
          backgroundColor: 'rgba(24,48,40,0.97)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(205,232,119,0.08)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-200 group"
          style={{ color: 'rgba(242,241,236,0.5)' }}
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover:-translate-x-1"
            style={{ color: LIME }}
          />
          Retour
        </button>

        {/* Logo */}
        <span className="text-[20px] font-bold tracking-tight" style={{ color: OW }}>
          Q<em className="font-['Cormorant_Garamond'] italic font-normal" style={{ color: LIME }}>rowd</em>
        </span>

        <button
          onClick={() => navigate(user ? (user.role === 'ngo' ? '/ngo/profile' : '/profile') : '/register')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] px-5 py-2.5 transition-all duration-300 hover:bg-[#cde877] hover:text-[#183028] group"
          style={{ border: `1px solid rgba(205,232,119,0.35)`, color: LIME }}
        >
          {user ? 'Mon compte' : 'Lancer une campagne'}
          <ArrowUpRight size={12} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </nav>

      {/* ══ PAGE HEADER ══ */}
      <div
        className="px-10 pt-12 pb-10"
        style={{ borderBottom: '1px solid rgba(205,232,119,0.08)' }}
      >
        {/* Overline */}
        <motion.p
          className="text-[11px] font-bold uppercase tracking-[0.32em] mb-3"
          style={{ color: 'rgba(205,232,119,0.5)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          — Découvrir
        </motion.p>

        {/* Main title — Kickstarter-style "Explorez X campagnes" */}
        <motion.h1
          className="font-medium leading-tight mb-6"
          style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: OW, letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Explorez{' '}
          <em
            className="font-['Cormorant_Garamond'] italic font-normal not-italic"
            style={{ color: LIME }}
          >
            {filtered.length} campagne{filtered.length !== 1 ? 's' : ''}
          </em>
        </motion.h1>

        {/* Stats chips */}
        <motion.div
          className="flex items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {[
            { v: totalRaised.toLocaleString('fr-FR') + ' €', l: 'collectés' },
            { v: CAMPAIGNS.reduce((s, c) => s + c.donors, 0).toLocaleString('fr-FR'), l: 'donateurs' },
            { v: '89%', l: 'reversés aux ONG' },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-2">
              <span className="text-[15px] font-bold" style={{ color: LIME }}>{s.v}</span>
              <span className="text-[11px]" style={{ color: 'rgba(242,241,236,0.35)' }}>{s.l}</span>
              <span className="text-[#183028] border-r border-[rgba(205,232,119,0.15)] h-3 ml-4" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ FILTERS BAR ══ */}
      <div
        className="sticky top-[64px] z-40 px-10 py-3 flex items-center gap-4 flex-wrap"
        style={{
          backgroundColor: 'rgba(24,48,40,0.97)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(205,232,119,0.08)',
        }}
      >
        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {ALL_CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] px-4 py-2 transition-all duration-200 whitespace-nowrap"
              style={
                cat === c
                  ? { backgroundColor: LIME, color: BG }
                  : { color: 'rgba(242,241,236,0.45)', border: '1px solid rgba(205,232,119,0.12)' }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{ border: '1px solid rgba(205,232,119,0.14)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(242,241,236,0.35)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="bg-transparent outline-none text-[12px] w-[160px] placeholder-[rgba(242,241,236,0.3)]"
            style={{ color: OW, fontFamily: "'Inter', sans-serif" }}
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={11} style={{ color: 'rgba(242,241,236,0.4)' }} />
            </button>
          )}
        </div>

        {/* Sort select */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-2 outline-none cursor-pointer shrink-0"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid rgba(205,232,119,0.14)',
            color: 'rgba(242,241,236,0.5)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key} style={{ backgroundColor: BG, color: OW }}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* ══ GRID ══ */}
      <div className="px-10 py-10">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-28 text-center"
            >
              <p
                className="font-['Cormorant_Garamond'] italic font-normal mb-3"
                style={{ fontSize: 'clamp(36px, 6vw, 64px)', color: 'rgba(205,232,119,0.15)' }}
              >
                Aucun résultat
              </p>
              <p className="text-[13px]" style={{ color: 'rgba(242,241,236,0.3)' }}>
                Essayez une autre catégorie ou recherche.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={cat + sort + search}
              className="grid gap-5"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
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

      {/* ══ BOTTOM CTA ══ */}
      <div
        className="mx-10 mb-10 px-12 py-16 flex items-center justify-between"
        style={{
          backgroundColor: '#0f2118',
          border: '1px solid rgba(205,232,119,0.08)',
        }}
      >
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4"
            style={{ color: 'rgba(205,232,119,0.4)' }}
          >
            — Vous êtes une ONG ou une association ?
          </p>
          <h2
            className="font-medium text-[#f2f1ec] leading-[1.05]"
            style={{ fontSize: 'clamp(24px, 3.5vw, 48px)', letterSpacing: '-0.02em' }}
          >
            Publiez votre campagne.{' '}
            <em className="font-['Cormorant_Garamond'] italic font-normal" style={{ color: LIME }}>
              Changez le monde.
            </em>
          </h2>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-300 hover:opacity-90 flex items-center gap-3"
            style={{ backgroundColor: LIME, color: BG }}
          >
            Créer un compte
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-300 hover:border-[rgba(205,232,119,0.4)]"
            style={{ border: '1px solid rgba(242,241,236,0.12)', color: 'rgba(242,241,236,0.45)' }}
          >
            J'ai déjà un compte
          </button>
        </div>
      </div>
    </div>
  );
}
