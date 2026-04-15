import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import api from '../api/axios';

const SupervisorAnalytics: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches/my')
      .then(res => setMatches(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const confirmed = matches.filter(m => m.state === 'Confirmed').length;
  const interested = matches.filter(m => m.state === 'Interested').length;
  const capacity = 4;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Supervision Analytics</h2>
        <p className="text-slate-400">Track your supervision activity and match performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Matches', value: confirmed, icon: <CheckCircle size={20} />, color: 'blue' },
          { label: 'Expressed Interests', value: interested, icon: <Users size={20} />, color: 'amber' },
          { label: 'Capacity Used', value: `${confirmed}/${capacity}`, icon: <Activity size={20} />, color: 'purple' },
          { label: 'Utilisation', value: `${Math.round((confirmed / capacity) * 100)}%`, icon: <TrendingUp size={20} />, color: 'emerald' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl border border-white/5 hover-slide">
            <p className="text-slate-500 text-sm">{stat.label}</p>
            <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Capacity Bar */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">Supervision Capacity</h3>
        <div className="mb-2 flex justify-between text-sm text-slate-400">
          <span>{confirmed} active</span>
          <span>{capacity - confirmed} slots remaining</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
            style={{ width: `${(confirmed / capacity) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">You can supervise up to {capacity} projects per cycle</p>
      </div>

      {/* Match Activity */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4">Match Activity</h3>
        {matches.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Activity size={40} className="mx-auto mb-3 text-slate-700" />
            <p>No matches yet. Browse proposals and express interest to see activity here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-semibold text-white text-sm">{m.title || 'Anonymous Proposal'}</p>
                  <p className="text-xs text-slate-500">Match ID: {m.id?.slice(0, 8)}...</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  m.state === 'Confirmed'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/20'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                }`}>
                  {m.state}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorAnalytics;
