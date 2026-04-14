import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, LayoutDashboard, Send, Users, Activity, Settings, PlusCircle, Search, FileText, Menu, X } from 'lucide-react';
import ProposalWizard from '../components/ProposalWizard';
import StudentProposals from '../components/StudentProposals';
import SupervisorExplore from '../components/SupervisorExplore';
import SupervisorMatches from '../components/SupervisorMatches';
import LeaderOverview from '../components/LeaderOverview';
import AcademicPortal from '../components/AcademicPortal';
import api from '../api/axios';

const Dashboard: React.FC = () => {
    const { user, clearAuth } = useAuthStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Match State
    const [myMatchId, setMyMatchId] = useState<string | null>(null);

    const isStudent = user?.roles.includes('Student');
    const isSupervisor = user?.roles.includes('Supervisor');
    const isModuleLeader = user?.roles.includes('ModuleLeader') || user?.roles.includes('Admin');

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await api.get('/matches/my');
                if (res.data && res.data.length > 0) {
                    setMyMatchId(res.data[0].id); // Get first match (student has 1, supervisor can select later but defaults to 1st for MVP)
                }
            } catch (err) {
                console.error("Failed to fetch matches");
            }
        };
        fetchMatch();
    }, []);
    
    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-950 font-sans overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5 glass-card">
                <h2 className="text-xl font-extrabold tracking-tighter text-white">
                    <span className="text-[#39b54a]">NSBM</span> 
                    <span className="text-[#0054a6] ml-1">PORTAL</span>
                </h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative z-50 w-full md:w-72 h-full glass-card border-r border-white/5 flex-col bg-slate-950/95 md:bg-transparent backdrop-blur-xl transition-all`}>
                <div className="hidden md:block p-8">
                    {/* Placeholder for NSBM Logo - User should place logo at /public/nsbm-logo.png */}
                    <div className="flex flex-col gap-1">
                        <img src="/nsbm-logo.png" alt="NSBM Logo" className="w-full h-auto mb-2" onError={(e) => { e.currentTarget.style.display='none'; }} />
                        <h2 className="text-xl font-extrabold tracking-tighter text-white">
                            <span className="text-[#39b54a]">NSBM</span> 
                            <span className="text-[#0054a6] ml-1">PORTAL</span>
                        </h2>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    <NavItem 
                        icon={<LayoutDashboard size={20} />} 
                        label="Overview" 
                        active={activeTab === 'overview'} 
                        onClick={() => setActiveTab('overview')}
                    />

                    {/* ACADEMIC HUB - Shown if match exists (Mocked for dashboard entry) */}
                    <NavItem 
                        icon={<FileText size={20} />} 
                        label="Academic Hub" 
                        active={activeTab === 'academic'} 
                        onClick={() => setActiveTab('academic')}
                    />
                    
                    {isStudent && (
                        <>
                            <NavItem 
                                icon={<PlusCircle size={20} />} 
                                label="New Proposal" 
                                active={activeTab === 'new'} 
                                onClick={() => setActiveTab('new')}
                            />
                            <NavItem 
                                icon={<Send size={20} />} 
                                label="My Submissions" 
                                active={activeTab === 'my'} 
                                onClick={() => setActiveTab('my')}
                            />
                        </>
                    )}

                    {isSupervisor && (
                        <>
                            <NavItem 
                                icon={<Search size={20} />} 
                                label="Browse Projects" 
                                active={activeTab === 'browse'} 
                                onClick={() => setActiveTab('browse')}
                            />
                            <NavItem 
                                icon={<Users size={20} />} 
                                label="Confirmed Matches" 
                                active={activeTab === 'matches'} 
                                onClick={() => setActiveTab('matches')}
                            />
                        </>
                    )}

                    {isModuleLeader && (
                        <>
                             <NavItem 
                                icon={<Activity size={20} />} 
                                label="Module Metrics" 
                                active={activeTab === 'metrics'} 
                                onClick={() => setActiveTab('metrics')}
                            />
                        </>
                    )}

                    <NavItem icon={<Activity size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={clearAuth}
                        className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {user?.fullName}</h1>
                        <p className="text-muted-foreground">Portal Status: <span className="text-emerald-400 font-medium">Session Active</span></p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                             <p className="text-sm font-medium">{user?.roles.join(', ')}</p>
                             <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="text-primary font-bold">{user?.fullName.charAt(0)}</span>
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-reveal-fade">
                        <StatCard label="Matched Projects" value="0/1" sub="Required: 1" />
                        <StatCard label="Active Interests" value={isStudent ? "0" : "5"} sub={isStudent ? "From supervisors" : "Your expressions"} />
                        <StatCard label="Days Remaining" value="14" sub="Submission deadline" />
                    </div>
                )}

                <div className="mt-8 glass-card rounded-3xl p-8 border border-white/5 min-h-[500px]">
                    {activeTab === 'overview' && (
                        <>
                            <h3 className="text-xl font-bold mb-6">Upcoming Deadlines</h3>
                            <div className="flex items-center justify-center h-64 text-slate-500 italic">
                                No immediate tasks pending. Your submissions are being reviewed.
                            </div>
                        </>
                    )}

                    {activeTab === 'new' && isStudent && <ProposalWizard />}
                    {activeTab === 'my' && isStudent && <StudentProposals />}
                    {activeTab === 'browse' && isSupervisor && <SupervisorExplore />}
                    {activeTab === 'metrics' && isModuleLeader && <LeaderOverview />}
                    
                    {activeTab === 'academic' && (
                        myMatchId ? (
                            <AcademicPortal matchId={myMatchId} role={user?.roles[0] || ""} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <FileText size={48} className="text-slate-700 mb-4" />
                                <h3 className="text-xl font-bold text-slate-300">No Active Match</h3>
                                <p className="text-slate-500 mt-2">You need a confirmed match to access the Academic Hub.</p>
                            </div>
                        )
                    )}
                    
                    {activeTab === 'matches' && isSupervisor && <SupervisorMatches />}

                    {activeTab === 'analytics' && (
                        <div className="flex flex-col items-center justify-center h-64 text-center animate-reveal-fade">
                            <Activity size={48} className="text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold text-slate-300">Analytics Insights</h3>
                            <p className="text-slate-500 mt-2">Comprehensive data visualization and reporting interface is coming soon.</p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="flex flex-col items-center justify-center h-64 text-center animate-reveal-fade">
                            <Settings size={48} className="text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold text-slate-300">System Settings</h3>
                            <p className="text-slate-500 mt-2">User preferences and system configuration options will be available shortly.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </button>
);

const StatCard = ({ label, value, sub }: { label: string, value: string, sub: string }) => (
    <div className="glass-card p-6 rounded-2xl border border-white/5 hover-slide">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h4 className="text-3xl font-bold mt-2 mb-1">{value}</h4>
        <p className="text-xs text-slate-400">{sub}</p>
    </div>
);

export default Dashboard;
