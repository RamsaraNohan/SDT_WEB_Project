import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, TrendingUp, Clock, Award } from 'lucide-react';

const StudentAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/proposals/my')
      .then(res => setProposals(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusLabels: Record<number, string> = {
    0: 'Draft', 1: 'Submitted', 2: 'Under Review', 3: 'Matched', 4: 'Revision Required'
  };

  const statusColors: Record<number, string> = {
    0: 'bg-slate-500/20 text-slate-400',
    1: 'bg-amber-500/20 text-amber-400',
    2: 'bg-blue-500/20 text-blue-400',
    3: 'bg-emerald-500/20 text-emerald-400',
    4: 'bg-red-500/20 text-red-400',
  };

  const hasMatch = proposals.some(p => p.status === 3);
  const underReview = proposals.filter(p => p.status === 2).length;
  const submitted = proposals.filter(p => p.status >= 1).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Analytics</h2>
        <p className="text-slate-400">Track your proposal journey through the Blind-Match system.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Proposals', value: proposals.length, icon: <Activity size={20} />, color: 'emerald' },
          { label: 'Under Review', value: underReview, icon: <Clock size={20} />, color: 'blue' },
          { label: 'Matched', value: hasMatch ? 1 : 0, icon: <Award size={20} />, color: 'purple' },
          { label: 'Success Rate', value: `${proposals.length > 0 ? Math.round((hasMatch ? 1 : 0) / submitted * 100) || 0 : 0}%`, icon: <TrendingUp size={20} />, color: 'amber' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl border border-white/5 hover-slide">
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Proposal Status Timeline */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">Proposal Status Breakdown</h3>
        {proposals.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Activity size={40} className="mx-auto mb-3 text-slate-700" />
            <p>No proposals submitted yet. Submit your first proposal to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-semibold text-white text-sm">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.researchAreaName} · {p.anonymousCode}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[p.status] || 'bg-slate-500/20 text-slate-400'}`}>
                  {statusLabels[p.status] || 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">My Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Full Name</p>
            <p className="font-semibold text-white">{user?.fullName || '—'}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="font-semibold text-white">{user?.email || '—'}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Role</p>
            <p className="font-semibold text-emerald-400">Student</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Match Status</p>
            <p className={`font-semibold ${hasMatch ? 'text-emerald-400' : 'text-slate-400'}`}>
              {hasMatch ? '✓ Matched with Supervisor' : 'Awaiting Match'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
