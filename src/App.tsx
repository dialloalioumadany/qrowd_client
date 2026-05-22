import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Lenis from 'lenis';
import { CAMPAIGNS } from './data/campaigns';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorProfile from './pages/DonorProfile';
import NGOProfile from './pages/NGOProfile';
import NGOOnboarding from './pages/NGOOnboarding';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import DiscoverPage from './pages/DiscoverPage';
import CampaignDashboard from './pages/CampaignDashboard';

// Home sections
import HeroSection from './components/HeroSection';
import ProjectsSection from './components/ProjectsSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
//import FixedBar from './components/FixedBar';
import PageTransition from './components/PageTransition';

// Re-export for backwards compat
export { CAMPAIGNS };

/* ────────────────────────────────────────
   HomePage — all landing sections
   
──────────────────────────────────────── */
function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrolled = useRef(false);

  useEffect(() => {
    const onScroll = () => { scrolled.current = window.scrollY > 60; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  return (
    <>
      <HeroSection 
        onLaunchClick={() => navigate(user ? (user.role === 'ngo' ? '/ngo/profile' : '/profile') : '/login')} 
        isAuthenticated={!!user} 
      />
      <ProjectsSection onCampaignClick={(id) => navigate(`/campaign/${id}`)} />
      <AboutSection />
      <ServicesSection />
      {/*<FixedBar scrolled={false} onScrollClick={scrollToTop} />*/}
    </>
  );
}

/* ────────────────────────────────────────
   CampaignPage — wraps CampaignDetail with useParams
   
──────────────────────────────────────── */
import { useParams } from 'react-router-dom';

function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        // En cas d'id court (1, 2, 3, etc. pour les mocks statiques)
        if (id && id.length < 10) {
          const staticCamp = CAMPAIGNS.find((c) => c.id === id);
          setCampaign(staticCamp || null);
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:5000/api/campaigns/${id}`);
        const data = await res.json();
        
        if (res.ok && data.status === 'success' && data.data.campaign) {
          const c = data.data.campaign;
          const mapped = {
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
            ngoId: c.organization?._id || '',
            description: c.description || '',
            quote: c.organization?.mission || 'Ensemble, transformons des vies.',
            quoteAuthor: c.organization?.name || 'Notre engagement',
            breakdown: c.budgetBreakdown && c.budgetBreakdown.length > 0
              ? c.budgetBreakdown.map((b: any) => ({ label: b.label, pct: b.percentage }))
              : [{ label: 'Projet principal', pct: 100 }],
            gallery: c.gallery && c.gallery.length > 0 ? c.gallery : [c.coverImage].filter(Boolean),
          };
          setCampaign(mapped);
        } else {
          // Fallback static
          const staticCamp = CAMPAIGNS.find((c) => c.id === id);
          setCampaign(staticCamp || null);
        }
      } catch (err) {
        console.warn("API campaign load failed, fallback to mock...", err);
        const staticCamp = CAMPAIGNS.find((c) => c.id === id);
        setCampaign(staticCamp || null);
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f2f1ec]">
        <div className="text-center">
          <span className="text-[28px] font-bold text-[#183028]">Qrowd</span>
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#bbb] mt-3">CHARGEMENT DE LA CAMPAGNE...</p>
        </div>
      </div>
    );
  }

  if (!campaign) return <Navigate to="/" replace />;

  return <CampaignDetail campaign={campaign} />;
}

/* ────────────────────────────────────────
   App — route table only
──────────────────────────────────────── */
export default function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'in' | 'out'>('idle');

  /* ── Global Smooth Scroll ── */
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let rafId: number;
    const raf = (time: number) => { 
      lenis.raf(time); 
      rafId = requestAnimationFrame(raf); 
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  /* ── Intercept Route Changes for Page Transition ── */
  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      const isCampaignTransition = location.pathname.startsWith('/campaign') || displayLocation.pathname.startsWith('/campaign');

      if (isCampaignTransition) {
        setTransitionPhase('in');
        
        const t1 = setTimeout(() => {
          setDisplayLocation(location);
          window.scrollTo(0, 0);
          setTransitionPhase('out');
        }, 700);
        
        const t2 = setTimeout(() => {
          setTransitionPhase('idle');
        }, 1500);

        return () => { clearTimeout(t1); clearTimeout(t2); };
      } else {
        setDisplayLocation(location);
        window.scrollTo(0, 0);
      }
    }
  }, [location, displayLocation.pathname]);

  return (
    <>
      <PageTransition phase={transitionPhase} />
      <Routes location={displayLocation}>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<DonorProfile />} />
        <Route path="/ngo/onboarding" element={<NGOOnboarding />} />
        <Route path="/ngo/profile" element={<NGOProfile />} />
        <Route path="/ngo/:id" element={<NGOProfile />} />
        <Route path="/campaign/create" element={<CreateCampaign />} />
        <Route path="/campaign/:id/dashboard" element={<CampaignDashboard />} />
        <Route path="/campaign/:id" element={<CampaignPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
