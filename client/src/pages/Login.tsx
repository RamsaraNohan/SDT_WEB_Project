import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

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
      
      // Decode user from token (in a real app, use a jwt decode lib)
      // For now, we'll assume the API returns enough user info
      const user = {
        id: 'temp-id', // Would be parsed from token
        email: email,
        fullName: 'Test User',
        roles: ['Student'] // Demo role
      };

      setAuth(token, refreshToken, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image with blur reveal */}
      <div 
        className="absolute inset-0 z-0 animate-reveal-fade opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url('/portal_auth_bg_1775919778043.png')` }}
      />
      
      {/* Glassmorphism Card */}
      <div className="z-10 w-full max-w-md p-8 glass-card rounded-2xl animate-reveal-fade">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 animate-float">
            <img src="/nsbm-logo.png" alt="NSBM Logo" className="w-48 h-auto" onError={(e) => { e.currentTarget.style.display='none'; }} />
          </div>
          <h1 className="text-3xl font-extrabold text-white flex gap-2">
             <span className="text-[#39b54a]">NSBM</span>
             <span className="text-[#0054a6]">PORTAL</span>
          </h1>
          <p className="text-muted-foreground mt-2">Green University Project Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="name@university.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/80 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-slate-400">
            Forgot Password? <a href="#" className="text-primary hover:underline">Contact Administrator</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
