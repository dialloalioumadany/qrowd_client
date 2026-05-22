import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { ArrowLeft, Eye, EyeOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BG       = '#183028';
const LIME     = '#cde877';
const OFFWHITE = '#f2f1ec';
const API      = 'http://localhost:5000/api';

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as any } },
};
const containerAnim = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

/* ── Champ label + border ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <motion.div variants={itemAnim} className="flex flex-col gap-2">
      <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#888]">{label}</label>
      {children}
    </motion.div>
  );
}

function InputLine({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <div className="border-b-2 transition-colors duration-300 flex items-center gap-2"
      style={{ borderColor: focused ? BG : '#d0d0cc' }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Étape 1 — Formulaire d'inscription
══════════════════════════════════════════════════════ */
function StepRegister({ onSuccess }: { onSuccess: (email: string, role: 'donor' | 'ngo') => void }) {
  const toast                 = useToast();
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [role, setRole]       = useState<'donor' | 'ngo'>('donor');
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [terms, setTerms]     = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const fo = (f: string) => ({ onFocus: () => setFocused(f), onBlur: () => setFocused(null) });
  const ic = 'w-full bg-transparent text-[15px] text-[#1a1a1a] outline-none placeholder-[#ccc] pb-2';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!terms) {
      const errMsg = "Vous devez accepter les conditions d'utilisation.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    if (form.password.length < 8) {
      const errMsg = 'Le mot de passe doit faire au moins 8 caractères.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Inscription en cours...');
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur.');
      toast.success('Compte créé ! Code OTP envoyé par email.', { id: toastId });
      onSuccess(form.email, role);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="step1" variants={containerAnim} initial="hidden" animate="show" exit={{ opacity: 0, x: -24 }}>
      <motion.div variants={itemAnim} className="mb-7">
        <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#aaa] mb-2">Étape 1 / 2</p>
        <h1 className="text-[26px] font-medium leading-tight text-[#1a1a1a]">
          Créez votre compte{' '}
          <em className="font-['Cormorant_Garamond'] italic" style={{ color: BG }}>
            {role === 'ngo' ? 'ONG.' : 'Donateur.'}
          </em>
        </h1>
        <p className="text-[13px] text-[#666] mt-2">
          {role === 'ngo'
            ? 'Inscrivez votre organisation pour lever des fonds et publier vos campagnes.'
            : 'Rejoignez-nous pour découvrir des projets solidaires et faire des dons.'}
        </p>
      </motion.div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* Sélecteur de rôle */}
        <motion.div variants={itemAnim} className="flex flex-col gap-2 mb-2">
          <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#888]">Type de compte</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className="flex-1 py-4 border-2 transition-all duration-300 text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
              style={{
                borderColor: role === 'donor' ? BG : '#d0d0cc',
                backgroundColor: role === 'donor' ? BG : 'transparent',
                color: role === 'donor' ? LIME : '#1a1a1a',
              }}
            >
              <span className="text-[12px] font-bold tracking-[0.12em] uppercase">DONATEUR</span>
              <span className="text-[9px] opacity-60 leading-tight">Particulier / Individu</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('ngo')}
              className="flex-1 py-4 border-2 transition-all duration-300 text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
              style={{
                borderColor: role === 'ngo' ? BG : '#d0d0cc',
                backgroundColor: role === 'ngo' ? BG : 'transparent',
                color: role === 'ngo' ? LIME : '#1a1a1a',
              }}
            >
              <span className="text-[12px] font-bold tracking-[0.12em] uppercase">ONG / ASSOC</span>
              <span className="text-[9px] opacity-60 leading-tight">Organisation caritative</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom">
            <InputLine focused={focused === 'fn'}>
              <input value={form.firstName} onChange={set('firstName')} {...fo('fn')}
                className={ic} placeholder="Aliou" required />
            </InputLine>
          </Field>
          <Field label="Nom">
            <InputLine focused={focused === 'ln'}>
              <input value={form.lastName} onChange={set('lastName')} {...fo('ln')}
                className={ic} placeholder="Diallo" required />
            </InputLine>
          </Field>
        </div>

        <Field label="Email">
          <InputLine focused={focused === 'em'}>
            <input type="email" value={form.email} onChange={set('email')} {...fo('em')}
              className={ic} placeholder="votre@email.com" required />
          </InputLine>
        </Field>

        <Field label="Mot de passe">
          <InputLine focused={focused === 'pw'}>
            <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} {...fo('pw')}
              className={`${ic} flex-1`} placeholder="8 caractères minimum" required />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="text-[#bbb] hover:text-[#333] transition-colors pb-1">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </InputLine>
        </Field>

        <motion.label variants={itemAnim} className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 shrink-0">
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="sr-only peer" />
            <div className="w-5 h-5 border-2 flex items-center justify-center transition-all peer-checked:border-[#183028]"
              style={{ backgroundColor: terms ? BG : 'white', borderColor: terms ? BG : '#ccc' }}>
              {terms && <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke={LIME} strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </svg>}
            </div>
          </div>
          <span className="text-[13px] text-[#666] leading-snug">
            J'accepte les{' '}
            <a href="#" className="font-semibold text-[#1a1a1a] hover:underline">conditions d'utilisation</a>
            {' '}et la{' '}
            <a href="#" className="font-semibold text-[#1a1a1a] hover:underline">politique de confidentialité</a>
          </span>
        </motion.label>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[12px] font-medium text-red-600 bg-red-50 px-3 py-2 border-l-2 border-red-400">
            {error}
          </motion.p>
        )}

        <motion.button variants={itemAnim} type="submit" disabled={loading}
          className="w-full py-5 text-[13px] font-bold tracking-[0.18em] uppercase transition-all hover:brightness-105 disabled:opacity-60 flex items-center justify-center gap-3"
          style={{ backgroundColor: BG, color: LIME }}>
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Envoi du code…</>
            : role === 'ngo' ? 'CRÉER MON COMPTE ONG' : 'CRÉER MON COMPTE DONATEUR'}
        </motion.button>
      </form>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   Étape 2 — Saisie du code OTP
══════════════════════════════════════════════════════ */
function StepOtp({ email, onVerified }: { email: string; onVerified: (token: string) => void }) {
  const toast                           = useToast();
  const [digits, setDigits]             = useState(['', '', '', '', '', '']);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [resent, setResent]             = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  /* Un seul ref array — pas de useRef dans une boucle */
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigit = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0)
      inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const verify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) {
      const errMsg = 'Saisissez les 6 chiffres du code.';
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    setError('');
    setLoading(true);
    const toastId = toast.loading('Vérification du code...');
    try {
      const res  = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Validation réussie !', { id: toastId });
      onVerified(data.token);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { id: toastId });
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCooldown) return;
    setResendCooldown(true);
    setResent(false);
    const toastId = toast.loading('Renvoi du code...');
    try {
      await fetch(`${API}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      toast.success('Nouveau code OTP envoyé !', { id: toastId });
      setTimeout(() => setResendCooldown(false), 60000);
    } catch {
      setResendCooldown(false);
      toast.error('Erreur lors du renvoi du code.', { id: toastId });
    }
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#aaa] mb-2">Étape 2 / 2</p>
        <h1 className="text-[26px] font-medium leading-tight text-[#1a1a1a] mb-3">
          Vérifiez votre{' '}
          <em className="font-['Cormorant_Garamond'] italic" style={{ color: BG }}>email.</em>
        </h1>
        <p className="text-[14px] text-[#666] leading-relaxed">
          Un code à 6 chiffres a été envoyé à<br />
          <strong className="text-[#1a1a1a]">{email}</strong>
        </p>
      </div>

      {/* ── 6 cases OTP — taille fixe carrée ── */}
      <div className="flex gap-2 mb-6" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            maxLength={1}
            inputMode="numeric"
            autoFocus={i === 0}
            className="text-center text-[22px] font-bold outline-none transition-all duration-200 shrink-0"
            style={{
              width:           '52px',
              height:          '64px',
              backgroundColor: d ? BG : 'white',
              color:           d ? LIME : '#1a1a1a',
              border:          `2px solid ${error ? '#ef4444' : d ? BG : '#d0d0cc'}`,
              fontFamily:      'monospace',
            }}
          />
        ))}
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[12px] font-medium text-red-600 bg-red-50 px-3 py-2 border-l-2 border-red-400 mb-4">
          {error}
        </motion.p>
      )}

      <button
        onClick={verify}
        disabled={loading || digits.join('').length < 6}
        className="w-full py-5 text-[13px] font-bold tracking-[0.18em] uppercase mb-4 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-3"
        style={{ backgroundColor: BG, color: LIME }}
      >
        {loading
          ? <><RefreshCw size={14} className="animate-spin" /> Vérification…</>
          : 'VÉRIFIER MON EMAIL'}
      </button>

      <div className="flex items-center justify-between text-[12px]">
        <p className="text-[#999]">Vous n'avez pas reçu le code ?</p>
        <button
          onClick={resend}
          disabled={resendCooldown}
          className="font-bold transition-colors hover:underline underline-offset-2 disabled:opacity-40"
          style={{ color: resendCooldown ? '#bbb' : BG }}
        >
          {resendCooldown ? 'Renvoyé ✓' : 'Renvoyer le code'}
        </button>
      </div>

      {resent && (
        <motion.p
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-green-700 mt-2 flex items-center gap-1"
        >
          <CheckCircle size={12} /> Un nouveau code a été envoyé.
        </motion.p>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   Page principale
══════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const navigate          = useNavigate();
  const { login }         = useAuth();
  const [step, setStep]   = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState<'donor' | 'ngo'>('donor');

  const handleVerified = async (token: string) => {
    await login(token);
    if (role === 'ngo') {
      navigate('/ngo/onboarding');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex" style={{ backgroundColor: BG }}>

      {/* ── Panneau gauche ── */}
      <motion.div
        className="relative hidden lg:flex flex-col justify-between w-[45%] overflow-hidden p-12"
        initial={{ x: '-100%' }} animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1200&auto=format&fit=crop"
          alt="ONG" className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(24,48,40,0.93) 0%, rgba(24,48,40,0.60) 100%)' }} />

        {/* Top */}
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-[12px] font-bold tracking-[0.15em]">RETOUR</span>
          </button>
          <span className="text-[20px] font-bold" style={{ color: LIME }}>Qrowd</span>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: LIME }}>
            (Rejoignez la communauté)
          </p>
          <h2 className="text-white font-medium leading-[1.05]"
            style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
            Donnez,{' '}
            <em className="font-['Cormorant_Garamond'] italic" style={{ color: LIME }}>lancez,</em>
            <br />impactez.
          </h2>
          <p className="text-[14px] leading-[1.65] text-white/55 mt-6 max-w-[340px]">
            Rejoignez 15 000 donateurs et 180 ONG qui font confiance à Qrowd pour financer le changement.
          </p>

          {/* Indicateur d'étape */}
          <div className="flex items-center gap-3 mt-10">
            {([1, 2] as const).map((s, idx) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 flex items-center justify-center text-[10px] font-bold transition-all duration-500"
                    style={{
                      backgroundColor: step >= s ? LIME : 'rgba(255,255,255,0.1)',
                      color:           step >= s ? BG   : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  <span
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase"
                    style={{ color: step >= s ? LIME : 'rgba(255,255,255,0.3)' }}
                  >
                    {s === 1 ? 'Informations' : 'Vérification'}
                  </span>
                </div>
                {idx < 1 && (
                  <div className="w-8 h-px"
                    style={{ backgroundColor: step > s ? LIME : 'rgba(255,255,255,0.15)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Panneau droit (formulaire) ── */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-8 lg:px-14 overflow-y-auto"
        style={{ backgroundColor: OFFWHITE }}
        initial={{ x: '100%' }} animate={{ x: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="max-w-[420px] w-full mx-auto py-10">
          <AnimatePresence mode="wait">
            {step === 1
              ? <StepRegister onSuccess={(em, r) => { setEmail(em); setRole(r); setStep(2); }} />
              : <StepOtp email={email} onVerified={handleVerified} />
            }
          </AnimatePresence>

          <p className="text-center text-[13px] text-[#888] mt-8">
            Déjà un compte ?{' '}
            <button onClick={() => navigate('/login')}
              className="font-bold text-[#1a1a1a] hover:underline underline-offset-2">
              Se connecter
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
