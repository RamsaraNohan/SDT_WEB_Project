import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LogOut, LayoutDashboard, Send, PlusCircle, FileText,
  Activity, Settings, Menu, X, Award, Bell
} from 'lucide-react';
import ProposalWizard from '../components/ProposalWizard';
import StudentProposals from '../components/StudentProposals';
import AcademicPortal from '../components/AcademicPortal';
import StudentAnalytics from '../components/StudentAnalytics';
import StudentSettings from '../components/StudentSettings';
import api from '../api/axios';
import { notificationService } from '../services/NotificationService';

const StudentDashboard: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [myMatchId, setMyMatchId] = useState<string | null>(null);
  const [myMatchState, setMyMatchState] = useState<string | null>(null);
  const [statsData, setStatsData] = useState({ proposals: 0, interests: 0, daysLeft: 14 });

  useEffect(() => {
    // Start SignalR AFTER login (token is now available)
    notificationService.start();

    const fetchData = async () => {
      try {
        const [matchRes, proposalRes] = await Promise.all([
          api.get('/matches/my').catch(() => ({ data: [] })),
          api.get('/proposals/my').catch(() => ({ data: [] })),
        ]);

        const matches = matchRes.data || [];
        const proposals = proposalRes.data || [];

        if (matches.length > 0) {
          setMyMatchId(matches[0].id);
          setMyMatchState(matches[0].state);
        }

        const underReview = proposals.filter((p: any) => p.status === 2).length;
        setStatsData({
          proposals: proposals.length,
          interests: underReview,
          daysLeft: 14,
        });
      } catch (e) {
        console.error('Dashboard data fetch error', e);
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
    { id: 'new', label: 'New Proposal', icon: <PlusCircle size={20} /> },
    { id: 'my', label: 'My Submissions', icon: <Send size={20} /> },
    { id: 'academic', label: 'Academic Hub', icon: <FileText size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold tracking-tighter text-white">
          <span className="text-[#39b54a]">NSBM</span>
          <span className="text-[#0054a6] ml-1">STUDENT</span>
        </h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-72 h-full glass-card border-r border-white/5 flex-col bg-slate-950/98 md:bg-transparent backdrop-blur-xl`}>
        {/* Logo */}
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39b54a] to-[#0054a6] flex items-center justify-center font-black text-white text-sm">N</div>
          <div>
            <h2 className="text-sm font-black text-white">NSBM PORTAL</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Student Console</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {user?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          {myMatchState === 'Confirmed' && (
            <div className="mt-3 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-400 font-bold text-center">✓ Match Confirmed</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-semibold text-sm">{tab.label}</span>
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
        {/* Top Bar */}
        <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-500">PUSL2020 — Project Approval System</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Bell size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-bold">Student</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-reveal-fade">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label="My Proposals"
                  value={statsData.proposals.toString()}
                  sub="Total submitted"
                  color="emerald"
                  icon={<Send size={24} />}
                />
                <StatCard
                  label="Supervisor Interests"
                  value={statsData.interests.toString()}
                  sub="Currently under review"
                  color="blue"
                  icon={<Award size={24} />}
                />
                <StatCard
                  label="Days Remaining"
                  value={statsData.daysLeft.toString()}
                  sub="To submission deadline"
                  color="amber"
                  icon={<Activity size={24} />}
                />
              </div>

              {/* Status Guide */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">Proposal Status Guide</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Draft', color: 'bg-slate-500/20 text-slate-400', desc: 'Saved, not submitted' },
                    { label: 'Submitted', color: 'bg-amber-500/20 text-amber-400', desc: 'Awaiting review' },
                    { label: 'Under Review', color: 'bg-blue-500/20 text-blue-400', desc: 'Supervisor interested' },
                    { label: 'Matched', color: 'bg-emerald-500/20 text-emerald-400', desc: 'Identity revealed' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${s.color}`}>{s.label}</span>
                      <p className="text-xs text-slate-500 mt-2">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('new')}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left hover:bg-emerald-500/20 transition-all group"
                  >
                    <PlusCircle className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <p className="font-bold text-white">Submit New Proposal</p>
                    <p className="text-xs text-slate-400 mt-1">Create a new project proposal</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('my')}
                    className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left hover:bg-blue-500/20 transition-all group"
                  >
                    <Send className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <p className="font-bold text-white">View My Submissions</p>
                    <p className="text-xs text-slate-400 mt-1">Track your proposal status</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'new' && (
            <div className="animate-reveal-fade">
              <ProposalWizard />
            </div>
          )}

          {activeTab === 'my' && (
            <div className="animate-reveal-fade">
              <StudentProposals />
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="animate-reveal-fade">
              {myMatchId ? (
                <AcademicPortal matchId={myMatchId} role="Student" />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center glass-card rounded-2xl border border-white/5 p-8">
                  <FileText size={48} className="text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300">No Active Match Yet</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">Once a supervisor confirms interest in your proposal, you'll gain access to the Academic Workspace here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-reveal-fade">
              <StudentAnalytics />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-reveal-fade">
              <StudentSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) => {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
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

export default StudentDashboard;
