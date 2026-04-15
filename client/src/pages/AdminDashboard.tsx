import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  LogOut, Users, Settings, Menu, X, Bell,
  Activity, LayoutDashboard, Shield, Tag, BookOpen
} from 'lucide-react';
import LeaderOverview from '../components/LeaderOverview';
import api from '../api/axios';
import { notificationService } from '../services/NotificationService';

const AdminDashboard: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalProposals: 0,
    matchedProposals: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    notificationService.start();
    const fetchData = async () => {
      try {
        const res = await api.get('/metrics/summary').catch(() => ({ data: null }));
        if (res.data) {
          setStatsData({
            totalProposals: res.data.totalProposals || 0,
            matchedProposals: res.data.matchedProposals || 0,
            totalUsers: res.data.activeSupervisors || 0,
          });
        }
      } catch (e) {
        console.error('Admin data fetch error', e);
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
    { id: 'overview', label: 'Module Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'metrics', label: 'Analytics', icon: <Activity size={20} /> },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'areas', label: 'Research Areas', icon: <Tag size={20} /> },
    { id: 'settings', label: 'Module Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
        <h2 className="text-xl font-extrabold tracking-tighter text-white">
          <span className="text-amber-400">NSBM</span>
          <span className="text-orange-400 ml-1">ADMIN</span>
        </h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-72 h-full glass-card border-r border-white/5 flex-col bg-slate-950/98 md:bg-transparent backdrop-blur-xl`}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-black text-white text-sm">N</div>
          <div>
            <h2 className="text-sm font-black text-white">NSBM PORTAL</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Admin Console</p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Shield size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-bold">Module Leader</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-3.5 rounded-2xl transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-semibold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-xs text-slate-500">PUSL2020 Module Administration</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Bell size={18} /></button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-400 font-bold">Module Leader</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-reveal-fade">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Proposals" value={statsData.totalProposals.toString()} sub="Submitted this cycle" color="amber" />
                <StatCard label="Confirmed Matches" value={statsData.matchedProposals.toString()} sub="Identity revealed" color="emerald" />
                <StatCard label="Active Supervisors" value={statsData.totalUsers.toString()} sub="Participating faculty" color="blue" />
              </div>
              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="text-amber-400" size={20} /> Module Leader Responsibilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Manage Research Areas', desc: 'Add, edit or deactivate research tags', tab: 'areas' },
                    { title: 'User Management', desc: 'Create and manage student/supervisor accounts', tab: 'users' },
                    { title: 'View Analytics', desc: 'Monitor match rates and proposal distribution', tab: 'metrics' },
                    { title: 'Module Settings', desc: 'Set deadlines and capacity limits', tab: 'settings' },
                  ].map(item => (
                    <button
                      key={item.tab}
                      onClick={() => setActiveTab(item.tab)}
                      className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all"
                    >
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && <div className="animate-reveal-fade"><LeaderOverview /></div>}

          {activeTab === 'users' && (
            <div className="animate-reveal-fade space-y-6">
              <div className="glass-card p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-2">User Management</h3>
                <p className="text-slate-400 mb-6">Manage student and supervisor accounts for PUSL2020.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                    <p className="font-bold text-white mb-1">Supervisors</p>
                    <p className="text-sm text-slate-400 mb-3">5 seeded — supervisor-1 through supervisor-5 @nsbm.ac.lk</p>
                    <p className="text-xs text-slate-500">Password: NSBM_Secure_2026!</p>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                    <p className="font-bold text-white mb-1">Students</p>
                    <p className="text-sm text-slate-400 mb-3">15 seeded — student-1 through student-15 @nsbm.ac.lk</p>
                    <p className="text-xs text-slate-500">Password: NSBM_Secure_2026!</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-400 font-bold text-sm">Database Reset</p>
                  <p className="text-slate-400 text-sm mt-1">Call <code className="text-amber-300">/api/auth/bootstrap-ui</code> to reset and re-seed the database.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'areas' && <div className="animate-reveal-fade"><ResearchAreaManager /></div>}

          {activeTab === 'settings' && (
            <div className="animate-reveal-fade space-y-6">
              <div className="glass-card p-8 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-2">Module Configuration</h3>
                <p className="text-slate-400 mb-6">Configure submission windows and capacity settings.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Proposal Window Open', value: '2026-02-01', type: 'date' },
                    { label: 'Proposal Window Close', value: '2026-04-30', type: 'date' },
                    { label: 'Final Submission Deadline', value: '2026-06-30', type: 'date' },
                    { label: 'Max Projects per Supervisor', value: '4', type: 'number' },
                  ].map(setting => (
                    <div key={setting.label} className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">{setting.label}</label>
                      <input
                        type={setting.type}
                        defaultValue={setting.value}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-white"
                      />
                    </div>
                  ))}
                </div>
                <button className="mt-6 px-6 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/30 transition-all font-bold">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ResearchAreaManager: React.FC = () => {
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    api.get('/proposals/areas').then(res => setAreas(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag className="text-amber-400" size={20} /> Research Areas</h3>
        <div className="flex gap-3 mb-6">
          <input
            value={newArea}
            onChange={e => setNewArea(e.target.value)}
            placeholder="Add new research area..."
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-white"
          />
          <button className="px-6 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-500/30 transition-all font-bold">Add</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {areas.map(area => (
            <div key={area.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-sm font-medium text-white">{area.name}</span>
              <span className="px-2 py-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) => {
  const colorMap: Record<string, string> = {
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
  };
  return (
    <div className={`glass-card p-6 rounded-2xl border bg-gradient-to-br ${colorMap[color]} hover-slide`}>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <h4 className="text-3xl font-black mt-1 mb-1 text-white">{value}</h4>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
};

export default AdminDashboard;
