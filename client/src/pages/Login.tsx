import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { LogIn, Mail, Lock, Loader2, Shield } from 'lucide-react';

// JWT payload decoder (no external lib needed)
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1];
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ASP.NET Identity uses long claim URIs — map them to simple keys
function extractRoles(payload: Record<string, any>): string[] {
  const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const simpleKey = 'role';
  const rawRoles = payload[roleKey] || payload[simpleKey] || [];
  if (typeof rawRoles === 'string') return [rawRoles];
  if (Array.isArray(rawRoles)) return rawRoles;
  return [];
}

function extractUserId(payload: Record<string, any>): string {
  return (
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload['sub'] ||
    payload['nameid'] ||
    'unknown'
  );
}

function extractEmail(payload: Record<string, any>): string {
  return (
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload['email'] ||
    payload['unique_name'] ||
    ''
  );
}

function extractName(payload: Record<string, any>): string {
  return (
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    payload['name'] ||
    payload['given_name'] ||
    'User'
  );
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken } = response.data;

      // Decode JWT to get real user identity and roles
      const payload = decodeJwtPayload(token);
      if (!payload) throw new Error('Invalid token received from server');

      const roles = extractRoles(payload);
      const userId = extractUserId(payload);
      const userEmail = extractEmail(payload) || email;
      const fullName = extractName(payload);

      const user = { id: userId, email: userEmail, fullName, roles };
      setAuth(token, refreshToken, user);

      // Route to the correct dashboard based on role
      if (roles.includes('Admin') || roles.includes('ModuleLeader')) {
        navigate('/admin');
      } else if (roles.includes('Supervisor')) {
        navigate('/supervisor');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper
  const demoAccounts = [
    { label: 'Student', email: 'student-1@nsbm.ac.lk', color: 'emerald' },
    { label: 'Supervisor', email: 'supervisor-1@nsbm.ac.lk', color: 'blue' },
    { label: 'Admin', email: 'admin@blindmatch.edu', color: 'amber' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 animate-reveal-fade opacity-30 bg-cover bg-center"
        style={{ backgroundImage: `url('/portal_auth_bg_1775919778043.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-slate-950/90 z-0" />

      {/* Card */}
      <div className="z-10 w-full max-w-md p-8 glass-card rounded-2xl animate-reveal-fade">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#39b54a] to-[#0054a6] flex items-center justify-center mb-4 shadow-xl">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white flex gap-2">
            <span className="text-[#39b54a]">NSBM</span>
            <span className="text-[#0054a6]">PORTAL</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Blind-Match Project Approval System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                placeholder="name@nsbm.ac.lk"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
              <span className="text-base">⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/20 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign In</>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <p className="text-xs text-slate-500 text-center mb-3 font-medium">DEMO ACCOUNTS — Password: NSBM_Secure_2026!</p>
          <div className="flex gap-2">
            {demoAccounts.map(acct => (
              <button
                key={acct.label}
                onClick={() => setEmail(acct.email)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  acct.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                  acct.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                }`}
              >
                {acct.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
