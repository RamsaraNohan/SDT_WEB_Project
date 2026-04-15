import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LogOut, Search, Users, Settings, Menu, X, Award, Bell,
  Activity, LayoutDashboard, CheckCircle, BookOpen, Star
} from 'lucide-react';
import SupervisorExplore from '../components/SupervisorExplore';
import SupervisorMatches from '../components/SupervisorMatches';
import AcademicPortal from '../components/AcademicPortal';
import SupervisorSettings from '../components/SupervisorSettings';
import SupervisorAnalytics from '../components/SupervisorAnalytics';
import api from '../api/axios';
import { notificationService } from '../services/NotificationService';

const SupervisorDashboard: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmedMatchId, setConfirmedMatchId] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({
    activeMatches: 0,
    expressedInterests: 0,
    availableProposals: 0,
  });

  useEffect(() => {
    notificationService.start();
    const fetchData = async () => {
      try {
        const [matchRes, proposalRes] = await Promise.all([
          api.get('/matches/my').catch(() => ({ data: [] })),
          api.get('/proposals/available').catch(() => ({ data: [] })),
        ]);

        const matches = matchRes.data || [];
        const proposals = proposalRes.data || [];

        const confirmed = matches.find((m: any) => m.state === 'Confirmed');
        if (confirmed) setConfirmedMatchId(confirmed.id);

        setStatsData({
          activeMatches: matches.filter((m: any) => m.state === 'Confirmed').length,
          expressedInterests: matches.filter((m: any) => m.state === 'Interested').length,
          availableProposals: proposals.length,
        });
      } catch (e) {
        console.error('Supervisor dashboard data fetch error', e);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    notificationService.stop();
    clearAuth();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'browse', label: 'Browse Projects', icon: <Search size={20} /> },
    { id: 'matches', label: 'My Matches', icon: <Users size={20} /> },
    { id: 'academic', label: 'Academic Hub', icon: <BookOpen size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'settings', label: 'Expertise & Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold tracking-tighter text-white">
          <span className="text-[#0054a6]">NSBM</span>
          <span className="text-[#6366f1] ml-1">SUPERVISOR</span>
        </h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-72 h-full glass-card border-r border-white/5 flex-col bg-slate-950/98 md:bg-transparent backdrop-blur-xl`}>
        {/* Logo */}
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0054a6] to-[#6366f1] flex items-center justify-center font-black text-white text-sm">N</div>
          <div>
            <h2 className="text-sm font-black text-white">NSBM PORTAL</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Supervisor Console</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Star size={12} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-bold">Faculty Supervisor</span>
          </div>
          {/* Capacity Meter */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Supervision Capacity</span>
              <span className="text-white font-bold">{statsData.activeMatches}/4</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                style={{ width: `${(statsData.activeMatches / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-semibold text-sm">{tab.label}</span>
              {tab.id === 'matches' && statsData.expressedInterests > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {statsData.expressedInterests}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-500">Faculty Supervisor Portal — PUSL2020</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Bell size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400 font-bold">Supervisor</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-reveal-fade">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Active Supervisions" value={statsData.activeMatches.toString()} sub="Confirmed matches" color="blue" icon={<CheckCircle size={24} />} />
                <StatCard label="Pending Interests" value={statsData.expressedInterests.toString()} sub="Awaiting confirmation" color="amber" icon={<Users size={24} />} />
                <StatCard label="Available Projects" value={statsData.availableProposals.toString()} sub="In your research areas" color="purple" icon={<Search size={24} />} />
              </div>

              {/* Role Description */}
              <div className="glass-card p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Award className="text-blue-400" size={24} />
                  Your Supervisor Dashboard
                </h3>
                <p className="text-slate-400 mb-6">
                  As a faculty supervisor, you review anonymous student proposals and match with projects that align with your expertise. Your identity and the student's identity remain hidden until you confirm a match.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left hover:bg-blue-500/20 transition-all group"
                  >
                    <Search className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
                    <p className="font-bold text-white">Browse Anonymous Proposals</p>
                    <p className="text-xs text-slate-400 mt-1">Review projects by research area. No student identity visible.</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left hover:bg-indigo-500/20 transition-all group"
                  >
                    <Users className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" size={28} />
                    <p className="font-bold text-white">Manage Matches</p>
                    <p className="text-xs text-slate-400 mt-1">Confirm interest and trigger identity reveal.</p>
                  </button>
                </div>
              </div>

              {/* Workflow Guide */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">Blind Match Workflow</h3>
                <div className="space-y-3">
                  {[
                    { step: '1', label: 'Browse Projects', desc: 'View anonymous proposals filtered by your expertise tags', active: true },
                    { step: '2', label: 'Express Interest', desc: 'Mark proposals you\'d like to supervise', active: statsData.expressedInterests > 0 },
                    { step: '3', label: 'Confirm Match', desc: 'Select one project to officially start supervision', active: false },
                    { step: '4', label: 'Identity Revealed', desc: 'Both you and the student see each other\'s details', active: statsData.activeMatches > 0 },
                  ].map(item => (
                    <div key={item.step} className={`flex items-start gap-4 p-3 rounded-xl ${item.active ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-white/5'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${item.active ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                        {item.step}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${item.active ? 'text-blue-400' : 'text-slate-400'}`}>{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'browse' && <div className="animate-reveal-fade"><SupervisorExplore /></div>}

          {activeTab === 'matches' && <div className="animate-reveal-fade"><SupervisorMatches /></div>}

          {activeTab === 'academic' && (
            <div className="animate-reveal-fade">
              {confirmedMatchId ? (
                <AcademicPortal matchId={confirmedMatchId} role="Supervisor" />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center glass-card rounded-2xl border border-white/5 p-8">
                  <BookOpen size={48} className="text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300">No Confirmed Matches</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">Confirm a match to access the Academic Workspace, log meetings, and score final submissions.</p>
                  <button onClick={() => setActiveTab('matches')} className="mt-4 px-6 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all font-bold">
                    Go to My Matches
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && <div className="animate-reveal-fade"><SupervisorAnalytics /></div>}

          {activeTab === 'settings' && <div className="animate-reveal-fade"><SupervisorSettings /></div>}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) => {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  };
  return (
    <div className={`glass-card p-6 rounded-2xl border bg-gradient-to-br ${colorMap[color]} hover-slide`}>
      <div className={`mb-3 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${colorMap[color].split(' ')[3]}`}>
        {icon}
      </div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <h4 className="text-3xl font-black mt-1 mb-1 text-white">{value}</h4>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
};

export default SupervisorDashboard;
