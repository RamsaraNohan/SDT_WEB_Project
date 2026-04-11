import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Activity, Users, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface MetricSummary {
    matchRate: number;
    totalProposals: number;
    matchedProposals: number;
    activeSupervisors: number;
    identityReveals: number;
    systemHealth: string;
}

const LeaderOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricSummary | null>(null);
    const [trends, setTrends] = useState<any[]>([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [summaryRes, trendsRes] = await Promise.all([
                    axios.get('/api/metrics/summary'),
                    axios.get('/api/metrics/matching-trends')
                ]);
                setMetrics(summaryRes.data);
                setTrends(trendsRes.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            }
        };

        fetchMetrics();
    }, []);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 animate-reveal-fade">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard 
                    icon={<Activity className="text-emerald-400" />} 
                    label="Match Rate" 
                    value={`${metrics?.matchRate.toFixed(1)}%`} 
                    sub="Overall completion" 
                />
                <KPICard 
                    icon={<Clock className="text-blue-400" />} 
                    label="Total Proposals" 
                    value={metrics?.totalProposals.toString() || "0"} 
                    sub="Submitted and pending" 
                />
                <KPICard 
                    icon={<CheckCircle className="text-amber-400" />} 
                    label="Matches Confirmed" 
                    value={metrics?.matchedProposals.toString() || "0"} 
                    sub="Academic matches" 
                />
                <KPICard 
                    icon={<Users className="text-purple-400" />} 
                    label="Active Staff" 
                    value={metrics?.activeSupervisors.toString() || "0"} 
                    sub="Participating supervisors" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trends Chart */}
                <div className="glass-card p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold mb-6">Proposal Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="status" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} 
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="glass-card p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xl font-bold mb-6">Module Health</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={trends}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {trends.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) => (
    <div className="glass-card p-6 rounded-2xl border border-white/5 hover-slide">
        <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        </div>
        <h4 className="text-3xl font-bold mt-2 mb-1">{value}</h4>
        <p className="text-xs text-slate-400">{sub}</p>
    </div>
);

export default LeaderOverview;
