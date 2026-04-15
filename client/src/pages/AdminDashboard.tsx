import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import {
  LogOut, Users, Settings, Menu, X, Bell,
  Activity, LayoutDashboard, Tag, BookOpen
} from 'lucide-react';
import LeaderOverview from '../components/LeaderOverview';
import api from '../api/axios';
import { notificationService } from '../services/NotificationService';

const AdminDashboard: React.FC = () => {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const showToast = useToastStore(state => state.showToast);
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

    const handleNotificationClick = () => {
        showToast("No new notifications at this time.", "info");
    };

    const tabs = [
        { id: 'overview', label: 'Module Overview', icon: <LayoutDashboard size={20} /> },
        { id: 'metrics', label: 'Analytics', icon: <Activity size={20} /> },
        { id: 'users', label: 'User Management', icon: <Users size={20} /> },
        { id: 'areas', label: 'Research Areas', icon: <Tag size={20} /> },
        { id: 'settings', label: 'Module Settings', icon: <Settings size={20} /> },
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

            {/* Sidebar Classic NSBM Style */}
            <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-64 h-full border-r border-white/5 flex-col bg-[#0b1120]`}>
                <div className="hidden md:flex flex-col p-6 items-start border-b border-white/5 mb-4">
                    <img src="/nsbm-logo.png" alt="NSBM Logo" className="w-[180px] h-auto mb-2" onError={(e) => { e.currentTarget.style.display='none'; }} />
                    <h2 className="text-sm font-black text-amber-500 mt-2 tracking-wide uppercase">ADMIN PORTAL</h2>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all ${
                                activeTab === tab.id
                                    ? 'bg-amber-500/15 text-amber-500 font-bold'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
                            }`}
                        >
                            {tab.icon}
                            <span className="text-sm">{tab.label}</span>
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
                        <h1 className="text-2xl font-bold text-white mb-1">Module Leader Dashboard</h1>
                        <p className="text-sm text-slate-400">Portal Status: <span className="text-amber-500 font-medium">Session Active</span></p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button onClick={handleNotificationClick} className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center gap-3 text-right">
                             <div className="hidden md:block">
                                 <p className="text-sm font-bold text-white">Module Leader</p>
                                 <p className="text-xs text-slate-500">{user?.email}</p>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                 <span className="text-amber-500 font-bold">{user?.fullName?.charAt(0) || 'A'}</span>
                             </div>
                        </div>
                    </div>
                </header>

                <div className="px-10">
                    {/* Overview Dashboard view matching original image */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard label="Total Proposals" value={statsData.totalProposals.toString()} sub="Submitted this cycle" />
                            <StatCard label="Confirmed Matches" value={statsData.matchedProposals.toString()} sub="Identity revealed" />
                            <StatCard label="Active Supervisors" value={statsData.totalUsers.toString()} sub="Participating faculty" />
                        </div>
                    )}

                    <div className="bg-[#0e1628] rounded-2xl p-8 border border-white/5 min-h-[500px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                    <BookOpen className="text-amber-500" size={24} /> Module Leader Responsibilities
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
                                            className="p-5 bg-[#0b1120] border border-white/5 rounded-xl text-left hover:border-amber-500/30 transition-all font-sans"
                                        >
                                            <p className="font-bold text-white mb-1">{item.title}</p>
                                            <p className="text-sm text-slate-400">{item.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'metrics' && <div className="animate-reveal-fade"><LeaderOverview /></div>}

                        {activeTab === 'users' && (
                            <div className="animate-reveal-fade space-y-6">
                                <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                                <p className="text-slate-400 mb-6">Manage student and supervisor accounts for PUSL2020.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-[#0b1120] border border-white/5 rounded-xl">
                                        <p className="font-bold text-white mb-1">Supervisors</p>
                                        <p className="text-sm text-slate-400 mb-3">5 seeded — supervisor-1 through supervisor-5 @nsbm.ac.lk</p>
                                        <p className="text-xs text-slate-500">Password: NSBM_Secure_2026!</p>
                                    </div>
                                    <div className="p-5 bg-[#0b1120] border border-white/5 rounded-xl">
                                        <p className="font-bold text-white mb-1">Students</p>
                                        <p className="text-sm text-slate-400 mb-3">15 seeded — student-1 through student-15 @nsbm.ac.lk</p>
                                        <p className="text-xs text-slate-500">Password: NSBM_Secure_2026!</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'areas' && <div className="animate-reveal-fade"><ResearchAreaManager /></div>}

                        {activeTab === 'settings' && (
                            <div className="animate-reveal-fade space-y-6">
                                <h3 className="text-xl font-bold mb-2 text-white">Module Configuration</h3>
                                <p className="text-slate-400 mb-6">Configure submission windows and capacity settings.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-6 px-6 py-3 bg-[#0b1120] text-amber-500 border border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition-all font-bold">
                                    Save Settings
                                </button>
                            </div>
                        )}
                    </div>
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
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Tag className="text-amber-500" size={20} /> Research Areas</h3>
      <div className="flex gap-3 mb-6">
        <input
          value={newArea}
          onChange={e => setNewArea(e.target.value)}
          placeholder="Add new research area..."
          className="flex-1 px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-white"
        />
        <button className="px-6 py-3 bg-[#0b1120] text-amber-500 border border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition-all font-bold">Add</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {areas.map(area => (
          <div key={area.id} className="flex items-center justify-between p-4 bg-[#0b1120] border border-white/5 rounded-xl">
             <span className="text-sm font-medium text-white">{area.name}</span>
             <span className="px-2 py-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">Active</span>
          </div>
        ))}
      </div>
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

export default AdminDashboard;
