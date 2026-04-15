import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

// JWT payload decoder
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

function extractRoles(payload: Record<string, any>): string[] {
  const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const simpleKey = 'role';
  const rawRoles = payload[roleKey] || payload[simpleKey] || [];
  if (typeof rawRoles === 'string') return [rawRoles];
  if (Array.isArray(rawRoles)) return rawRoles;
  return [];
}

function extractUserId(payload: Record<string, any>): string {
  return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload['sub'] || payload['nameid'] || 'unknown';
}

function extractEmail(payload: Record<string, any>): string {
  return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload['email'] || payload['unique_name'] || '';
}

function extractName(payload: Record<string, any>): string {
  return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['name'] || payload['given_name'] || 'User';
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
      const payload = decodeJwtPayload(token);
      if (!payload) throw new Error('Invalid token');

      const roles = extractRoles(payload);
      const user = { id: extractUserId(payload), email: extractEmail(payload) || email, fullName: extractName(payload), roles };
      setAuth(token, refreshToken, user);

      if (roles.includes('Admin') || roles.includes('ModuleLeader')) navigate('/admin');
      else if (roles.includes('Supervisor')) navigate('/supervisor');
      else navigate('/student');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0f1c] font-sans">
      <div className="w-full max-w-[420px] p-10 bg-[#0e1628] rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6">
            <img src="/nsbm-logo.png" alt="NSBM Logo" className="w-56 h-auto" onError={(e) => { e.currentTarget.style.display='none'; }} />
          </div>
          <h1 className="text-3xl font-black flex gap-2 tracking-tight">
             <span className="text-[#39b54a]">NSBM</span>
             <span className="text-[#0054a6]">PORTAL</span>
          </h1>
          <p className="text-slate-300 font-medium mt-2">Green University Project Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#0a0f1c] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#39b54a] focus:border-transparent outline-none transition-all text-white"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#0a0f1c] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#39b54a] focus:border-transparent outline-none transition-all text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#39b54a] text-white font-bold rounded-xl hover:bg-[#2e9c3e] transition-all flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Sign In <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-slate-400">
            Forgot Password? <a href="#" className="text-[#39b54a] hover:underline font-medium">Contact Administrator</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
