import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Info, Heart, Loader2, Sparkles, Code2 } from 'lucide-react';

interface ProposalView {
  id: string;
  proposalId: string;
  title: string;
  abstract: string;
  techStack: string;
  anonymousCode: string;
  researchAreaName: string;
}

const SupervisorExplore: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await api.get('/proposals/available');
        setProposals(response.data);
      } catch (err) {
        console.error('Failed to fetch proposals');
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleInterest = async (proposalId: string) => {
    setActing(proposalId);
    try {
      await api.post('/matches/express-interest', { proposalId });
      // Logic for success toast/notification
    } catch (err) {
      console.error('Failed to express interest');
    } finally {
      setActing(null);
    }
  };

  const filtered = proposals.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.techStack.toLowerCase().includes(search.toLowerCase()) ||
    p.researchAreaName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-reveal-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Explore Proposals <Sparkles className="text-primary" />
          </h2>
          <p className="text-slate-400">Discover student project ideas. Identities remain hidden until match confirmation.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Search by tech, area, or keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(proposal => (
          <div key={proposal.id} className="glass-card rounded-2xl border border-white/5 p-6 flex flex-col hover-slide">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wider">
                {proposal.anonymousCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">{proposal.researchAreaName}</span>
            </div>

            <h3 className="text-lg font-bold mb-3 leading-snug">{proposal.title}</h3>
            
            <p className="text-sm text-slate-400 line-clamp-3 mb-6 flex-1">
              {proposal.abstract}
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-300">
                <Code2 size={16} className="text-primary" />
                <span className="text-xs font-mono">{proposal.techStack}</span>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleInterest(proposal.proposalId)}
                  disabled={!!acting}
                  className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all font-bold flex items-center justify-center gap-2 border border-emerald-500/20"
                >
                  {acting === proposal.proposalId ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
                  Express Interest
                </button>
                <button className="px-4 py-3 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-all border border-white/5">
                  <Info size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-slate-500">No matching proposals found for your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SupervisorExplore;
