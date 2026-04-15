import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import {
  LogOut, Search, Users, Settings, Menu, X, Award, Bell,
  Activity, LayoutDashboard, BookOpen
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
  const showToast = useToastStore(state => state.showToast);
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

  const handleNotificationClick = () => {
    showToast("No new notifications at this time.", "info");
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'browse', label: 'Browse Projects', icon: <Search size={20} /> },
    { id: 'matches', label: 'My Matches', icon: <Users size={20} /> },
    { id: 'academic', label: 'Academic Hub', icon: <BookOpen size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0f1c] font-sans overflow-hidden text-slate-200">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5 bg-[#0e1628]">
        <img src="/nsbm-logo.png" alt="NSBM" className="h-8" onError={(e) => { e.currentTarget.style.display='none'; }}/>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-64 h-full border-r border-white/5 flex-col bg-[#0b1120]`}>
        <div className="hidden md:flex flex-col p-6 items-start border-b border-white/5 mb-4">
            <img src="/nsbm-logo.png" alt="NSBM Logo" className="w-[180px] h-auto mb-2" onError={(e) => { e.currentTarget.style.display='none'; }} />
            <h2 className="text-sm font-black text-blue-400 mt-2 tracking-wide uppercase">SUPERVISOR PORTAL</h2>
        </div>

        {/* User Stats/Capacity */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="mt-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Supervision Capacity</span>
              <span className="text-white font-bold">{statsData.activeMatches}/4</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(statsData.activeMatches / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 font-bold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
              {tab.id === 'matches' && statsData.expressedInterests > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {statsData.expressedInterests}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0a0f1c] pb-8">
        <header className="flex justify-between items-center px-10 py-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, Faculty</h1>
            <p className="text-sm text-slate-400">Portal Status: <span className="text-blue-400 font-medium">Session Active</span></p>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleNotificationClick} className="p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 text-right">
                 <div className="hidden md:block">
                     <p className="text-sm font-bold text-white">Supervisor</p>
                     <p className="text-xs text-slate-500">{user?.email}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                     <span className="text-blue-400 font-bold">{user?.fullName?.charAt(0) || 'S'}</span>
                 </div>
            </div>
          </div>
        </header>

        <div className="px-10">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard label="Active Supervisions" value={statsData.activeMatches.toString()} sub="Confirmed matches" />
              <StatCard label="Pending Interests" value={statsData.expressedInterests.toString()} sub="Awaiting confirmation" />
              <StatCard label="Available Projects" value={statsData.availableProposals.toString()} sub="In your research areas" />
            </div>
          )}

          <div className="bg-[#0e1628] rounded-2xl p-8 border border-white/5 min-h-[500px]">
             {activeTab === 'overview' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Award className="text-blue-400" size={24} />
                        Your Supervisor Dashboard
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-3xl">
                        As a faculty supervisor, you review anonymous student proposals and match with projects that align with your expertise. Your identity and the student's identity remain hidden until you confirm a match.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => setActiveTab('browse')} className="p-5 bg-[#0b1120] border border-white/5 rounded-xl text-left hover:border-blue-500/30 transition-all">
                            <Search className="text-blue-400 mb-3" size={24} />
                            <p className="font-bold text-white">Browse Anonymous Proposals</p>
                            <p className="text-xs text-slate-400 mt-1">Review projects by research area.</p>
                        </button>
                        <button onClick={() => setActiveTab('matches')} className="p-5 bg-[#0b1120] border border-white/5 rounded-xl text-left hover:border-blue-500/30 transition-all">
                            <Users className="text-blue-400 mb-3" size={24} />
                            <p className="font-bold text-white">Manage Matches</p>
                            <p className="text-xs text-slate-400 mt-1">Confirm interest and trigger identity reveal.</p>
                        </button>
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
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                    <BookOpen size={48} className="text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-300">No Confirmed Matches</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">Confirm a match to access the Academic Workspace, log meetings, and score final submissions.</p>
                    <button onClick={() => setActiveTab('matches')} className="mt-4 px-6 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all font-bold">
                        Go to My Matches
                    </button>
                    </div>
                )}
                </div>
            )}
            {activeTab === 'analytics' && <div className="animate-reveal-fade"><SupervisorAnalytics /></div>}
            {activeTab === 'settings' && <div className="animate-reveal-fade"><SupervisorSettings /></div>}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, sub }: { label: string; value: string; sub: string }) => {
  return (
    <div className={`bg-[#0e1628] p-6 rounded-2xl border border-white/5 overflow-hidden`}>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h4 className="text-3xl font-bold mt-2 mb-1 text-white">{value}</h4>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
};

export default SupervisorDashboard;
