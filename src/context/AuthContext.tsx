/**
 * context/AuthContext.tsx
 * Gestion globale de la session utilisateur.
 *
 * - Stocke le JWT dans localStorage
 * - Charge le profil depuis l'API au démarrage
 * - Expose : user, token, loading, login(), logout()
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const API = 'http://localhost:5000/api';

/* ── Types ── */
export interface AuthUser {
  _id:            string;
  firstName:      string;
  lastName:       string;
  email:          string;
  role:           'donor' | 'admin';
  avatar:         string | null;
  totalDonated:   number;
  donationsCount: number;
  isEmailVerified:boolean;
  createdAt:      string;
}

interface AuthContextValue {
  user:    AuthUser | null;
  token:   string | null;
  loading: boolean;
  login:   (token: string) => Promise<void>;
  logout:  () => void;
  refresh: () => Promise<void>;
}

/* ── Context ── */
const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // true pendant le chargement initial

  /* Charger le profil depuis l'API avec le token */
  const fetchMe = async (jwt: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error('Token invalide');
      const data = await res.json();
      return data.data.user as AuthUser;
    } catch {
      return null;
    }
  };

  /* Au démarrage : restaurer la session depuis localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('qrowd_token');
    if (!stored) { setLoading(false); return; }

    fetchMe(stored).then((u) => {
      if (u) { setUser(u); setToken(stored); }
      else   { localStorage.removeItem('qrowd_token'); }
      setLoading(false);
    });
  }, []);

  /* login : reçoit le JWT, charge le profil, met à jour l'état */
  const login = async (jwt: string) => {
    localStorage.setItem('qrowd_token', jwt);
    setToken(jwt);
    const u = await fetchMe(jwt);
    if (u) setUser(u);
  };

  /* logout : nettoie tout */
  const logout = () => {
    localStorage.removeItem('qrowd_token');
    setToken(null);
    setUser(null);
  };

  /* refresh : recharge le profil sans changer le token */
  const refresh = async () => {
    if (!token) return;
    const u = await fetchMe(token);
    if (u) setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
