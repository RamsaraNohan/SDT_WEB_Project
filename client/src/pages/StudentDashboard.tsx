import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import {
  LogOut, PlusCircle, Send, Settings, Menu, X, Bell,
  Activity, LayoutDashboard, FileText
} from 'lucide-react';
import ProposalWizard from '../components/ProposalWizard';
import StudentProposals from '../components/StudentProposals';
import AcademicPortal from '../components/AcademicPortal';
import StudentSettings from '../components/StudentSettings';
import StudentAnalytics from '../components/StudentAnalytics';
import api from '../api/axios';
import { notificationService } from '../services/NotificationService';

const StudentDashboard: React.FC = () => {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const showToast = useToastStore(state => state.showToast);
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [myMatchId, setMyMatchId] = useState<string | null>(null);

    useEffect(() => {
        notificationService.start();
        api.get('/matches/my')
           .then(res => {
               const matches = res.data || [];
               const confirmed = matches.find((m: any) => m.state === 'Confirmed');
               if (confirmed) setMyMatchId(confirmed.id);
           })
           .catch(() => {});

        // Listen for internal tab switches
        const handleSwitch = (e: any) => {
            if (typeof e.detail === 'string') {
                setActiveTab(e.detail);
            } else if (e.detail?.id) {
                setActiveTab(e.detail.id);
            }
        };

        window.addEventListener('switchTab', handleSwitch);
        return () => window.removeEventListener('switchTab', handleSwitch);
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
        { id: 'academic', label: 'Academic Hub', icon: <FileText size={20} /> },
        { id: 'new', label: 'Submit A Proposal', icon: <PlusCircle size={20} /> },
        { id: 'my', label: 'My Submissions', icon: <Send size={20} /> },
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

            {/* Sidebar Classic NSBM Style */}
            <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-64 h-full border-r border-white/5 flex-col bg-[#0b1120]`}>
                {/* Logo Area */}
                <div className="hidden md:flex flex-col p-6 items-start border-b border-white/5 mb-4">
                    <img src="/nsbm-logo.png" alt="NSBM Logo" className="w-[180px] h-auto mb-2" onError={(e) => { e.currentTarget.style.display='none'; }} />
                    <h2 className="text-sm font-black text-[#39b54a] mt-2 tracking-wide uppercase">NSBM PORTAL</h2>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                            className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all ${
                                activeTab === tab.id
                                    ? 'bg-[#182e25] text-[#39b54a] font-bold'
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
                <header className="flex justify-between items-center px-4 md:px-10 py-4 md:py-8">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Welcome back, {user?.fullName || 'User'}</h1>
                        <p className="text-sm text-slate-400">Portal Status: <span className="text-[#39b54a] font-medium">Session Active</span></p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button onClick={handleNotificationClick} className="p-2 text-slate-400 hover:text-white transition-colors relative">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center gap-3 text-right">
                             <div className="hidden md:block">
                                 <p className="text-sm font-bold text-white">Student</p>
                                 <p className="text-xs text-slate-500">{user?.email}</p>
                             </div>
                             <div className="w-10 h-10 rounded-full bg-[#182e25] flex items-center justify-center border border-[#39b54a]/30">
                                 <span className="text-[#39b54a] font-bold">{user?.fullName.charAt(0)}</span>
                             </div>
                        </div>
                    </div>
                </header>

                <div className="px-4 md:px-10">
                    {/* Overview Dashboard view matching original image */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard label="Matched Projects" value={myMatchId ? "1/1" : "0/1"} sub="Required: 1" />
                            <StatCard label="Active Interests" value="0" sub="From supervisors" />
                            <StatCard label="Days Remaining" value="14" sub="Submission deadline" />
                        </div>
                    )}

                    <div className="bg-[#0e1628] rounded-2xl p-4 md:p-8 border border-white/5 min-h-[500px]">
                        {activeTab === 'overview' && (
                            <>
                                <h3 className="text-xl font-bold mb-6 text-white">Upcoming Deadlines</h3>
                                <div className="flex items-center justify-center h-64 text-slate-500 italic border border-white/5 bg-white/[0.02] rounded-xl">
                                    No immediate tasks pending. Your submissions are being reviewed.
                                </div>
                            </>
                        )}
                        {activeTab === 'new' && <div className="animate-reveal-fade"><ProposalWizard /></div>}
                        {activeTab === 'my' && <div className="animate-reveal-fade"><StudentProposals /></div>}
                        
                        {activeTab === 'academic' && (
                            <div className="animate-reveal-fade">
                                {myMatchId ? (
                                    <AcademicPortal matchId={myMatchId} role="Student" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <FileText size={48} className="text-slate-700 mb-4" />
                                        <h3 className="text-xl font-bold text-slate-300">No Active Match</h3>
                                        <p className="text-slate-500 mt-2">You need a confirmed match to access the Academic Hub.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'analytics' && <div className="animate-reveal-fade"><StudentAnalytics /></div>}
                        {activeTab === 'settings' && <div className="animate-reveal-fade"><StudentSettings /></div>}
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ label, value, sub }: { label: string, value: string, sub: string }) => (
    <div className="bg-[#0e1628] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h4 className="text-3xl font-bold mt-2 mb-1 text-white">{value}</h4>
        <p className="text-xs text-slate-400">{sub}</p>
    </div>
);

export default StudentDashboard;
