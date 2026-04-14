import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, CheckCircle, Loader2 } from 'lucide-react';

interface SupervisorMatch {
  id: string;
  proposalId: string;
  title: string;
  state: string; // 'Interested', 'Confirmed'
}

const SupervisorMatches: React.FC = () => {
  const [matches, setMatches] = useState<SupervisorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches/my');
        // Sort Confirmed to the top, then Interested
        const sorted = response.data.sort((a: any, b: any) => a.state.localeCompare(b.state));
        setMatches(sorted);
      } catch (err) {
        console.error('Failed to fetch supervisor matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleConfirm = async (matchId: string, proposalId: string) => {
    setConfirming(matchId);
    try {
      await api.post('/matches/confirm', { proposalId });
      // Update local state
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, state: 'Confirmed' } : m));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm match');
    } finally {
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center animate-reveal-fade">
        <Users size={48} className="text-slate-700 mb-4" />
        <p className="text-slate-500">You haven't expressed interest in any projects yet. Browse available projects to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-reveal-fade">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Match Management <Users className="text-primary" />
        </h2>
        <p className="text-slate-400">Review your expressions of interest and confirm matches to begin supervision.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matches.map(match => (
          <div key={match.id} className={`glass-card p-6 rounded-2xl border ${match.state === 'Confirmed' ? 'border-primary/30 bg-primary/5' : 'border-white/5'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover-slide`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${match.state === 'Confirmed' ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'}`}>
                  {match.state}
                </span>
              </div>
              <h3 className="text-lg font-bold">{match.title}</h3>
            </div>
            
            <div>
              {match.state === 'Interested' && (
                <button 
                  onClick={() => handleConfirm(match.id, match.proposalId)}
                  disabled={!!confirming}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
                >
                  {confirming === match.id ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  Confirm Match
                </button>
              )}
              {match.state === 'Confirmed' && (
                <div className="flex items-center gap-2 text-primary font-bold px-4 py-2 border border-primary/20 rounded-xl bg-primary/10">
                  <CheckCircle size={20} /> Active Supervision
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupervisorMatches;
