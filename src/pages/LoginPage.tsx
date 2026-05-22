import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BG      = '#183028';
const LIME    = '#cde877';
const OFFWHITE= '#f2f1ec';
const API     = 'http://localhost:5000/api';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } } };
const item      = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as any } } };

export default function LoginPage() {
  const navigate              = useNavigate();
  const { login }             = useAuth();
  const toast                 = useToast();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      const errMsg = 'Email et mot de passe requis.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Connexion en cours...');
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      /* Email non vérifié → rediriger vers une page d'info */
      if (data.status === 'unverified') {
        toast.info('Veuillez vérifier votre adresse email.', { id: toastId });
        return navigate('/register', { state: { email, step: 2 } });
      }

      if (!res.ok) throw new Error(data.message || 'Identifiants incorrects.');

      await login(data.token);
      toast.success('Connexion réussie !', { id: toastId });
      if (data.data?.user?.role === 'ngo') {
        navigate('/ngo/profile');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex" style={{ backgroundColor: BG }}>

      {/* ── Panneau gauche ── */}
      <motion.div
        className="relative hidden lg:flex flex-col justify-between w-[55%] overflow-hidden p-12"
        initial={{ x: '-100%' }} animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1400&auto=format&fit=crop"
          alt="Impact" className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(24,48,40,0.92) 0%, rgba(24,48,40,0.65) 100%)' }} />

        <div className="relative z-10 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} strokeWidth={2} />
            <span className="text-[12px] font-bold tracking-[0.15em]">RETOUR</span>
          </button>
          <span className="text-[20px] font-bold" style={{ color: LIME }}>Qrowd</span>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-6" style={{ color: LIME }}>
            (Plateforme de financement solidaire)
          </p>
          <h2 className="text-white font-medium leading-[1.05]" style={{ fontSize: 'clamp(36px, 4.5vw, 64px)' }}>
            Chaque don est{' '}
            <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>une vie</em>{' '}
            transformée.
          </h2>
          <div className="flex gap-10 mt-10">
            {[{ n: '340+', l: 'campagnes actives' }, { n: '15K+', l: 'donateurs' }, { n: '28', l: 'pays' }].map(s => (
              <div key={s.n} className="flex flex-col gap-1">
                <span className="text-[28px] font-bold leading-none" style={{ color: LIME }}>{s.n}</span>
                <span className="text-[12px] text-white/50">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Panneau droit (formulaire) ── */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-12 lg:px-16 relative"
        style={{ backgroundColor: OFFWHITE }}
        initial={{ x: '100%' }} animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <button onClick={() => navigate('/')}
          className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-[#333]">
          <ArrowLeft size={16} /><span className="text-[12px] font-bold tracking-[0.15em]">RETOUR</span>
        </button>

        <motion.div className="max-w-[400px] w-full mx-auto" variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="mb-10">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: BG, opacity: 0.4 }}>
              Bienvenue
            </p>
            <h1 className="text-[36px] font-medium leading-tight text-[#1a1a1a]">
              Connectez-vous<br />
              <em className="font-['Cormorant_Garamond'] italic" style={{ color: BG }}>à votre compte.</em>
            </h1>
          </motion.div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#555]">Email</label>
              <div className="border-b-2 transition-colors duration-300 pb-2"
                style={{ borderColor: focused === 'email' ? BG : '#ccc' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="votre@email.com" required
                  className="w-full bg-transparent text-[16px] text-[#1a1a1a] outline-none placeholder-[#bbb]" />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={item} className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#555]">Mot de passe</label>
              <div className="border-b-2 transition-colors duration-300 pb-2 flex items-center"
                style={{ borderColor: focused === 'pass' ? BG : '#ccc' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                  placeholder="••••••••" required
                  className="flex-1 bg-transparent text-[16px] text-[#1a1a1a] outline-none placeholder-[#bbb]" />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="text-[#999] hover:text-[#333] transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={item} className="flex justify-end -mt-2">
              <a href="#" className="text-[12px] font-semibold text-[#888] hover:text-[#1a1a1a] transition-colors">
                Mot de passe oublié ?
              </a>
            </motion.div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[12px] font-medium text-red-600 bg-red-50 px-3 py-2 border-l-2 border-red-400">
                {error}
              </motion.p>
            )}

            <motion.button variants={item} type="submit" disabled={loading}
              className="w-full py-5 rounded-full text-[13px] font-bold tracking-[0.18em] mt-2 transition-all hover:brightness-105 disabled:opacity-60 flex items-center justify-center gap-3"
              style={{ backgroundColor: BG, color: LIME }}>
              {loading ? <><RefreshCw size={14} className="animate-spin" /> Connexion…</> : 'SE CONNECTER'}
            </motion.button>

            <motion.div variants={item} className="flex items-center gap-4 my-1">
              <div className="flex-1 h-px bg-[#ddd]" />
              <span className="text-[12px] text-[#bbb]">ou</span>
              <div className="flex-1 h-px bg-[#ddd]" />
            </motion.div>

            <motion.button variants={item} type="button"
              className="w-full py-4 rounded-full text-[13px] font-bold tracking-[0.12em] border-2 border-[#ddd] hover:border-[#bbb] transition-all text-[#333] flex items-center justify-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </motion.button>
          </form>

          <motion.p variants={item} className="text-center text-[13px] text-[#888] mt-10">
            Pas encore de compte ?{' '}
            <button onClick={() => navigate('/register')}
              className="font-bold text-[#1a1a1a] hover:underline underline-offset-2 transition-all">
              Créer un compte
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
