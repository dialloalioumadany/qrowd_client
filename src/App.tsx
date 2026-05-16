import { useEffect, useRef, useState, useCallback } from 'react';
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

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

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
  const navigate = useNavigate();
  const campaign = CAMPAIGNS.find((c) => c.id === id);

  if (!campaign) return <Navigate to="/" replace />;

  return <CampaignDetail campaign={campaign} onBack={() => navigate(-1)} />;
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
        <Route path="/campaign/create" element={<CreateCampaign />} />
        <Route path="/campaign/:id" element={<CampaignPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
