import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle2, AlertCircle, ExternalLink, Calendar, Tag } from 'lucide-react';

interface ProposalDto {
  id: string;
  title: string;
  anonymousCode: string;
  status: number;
  researchAreaName: string;
  createdAt: string;
}

const StudentProposals: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await api.get('/proposals/my');
        setProposals(response.data);
      } catch (err) {
        console.error('Failed to fetch my proposals');
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-amber-400 bg-amber-400/10 border-amber-400/20'; // Draft
      case 1: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';   // Published
      case 2: return 'text-purple-400 bg-purple-400/10 border-purple-400/20'; // UnderReview
      case 3: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'; // Matched
      case 4: return 'text-red-400 bg-red-400/10 border-red-400/20'; // Rejected
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = ['Submitted', 'Anonymous', 'Under Review', 'MATCHED', 'Revision Required'];
    return labels[status] || 'Unknown';
  };

  if (loading) return <div className="animate-pulse flex space-y-4 flex-col p-8"><div className="h-10 bg-white/5 rounded-xl w-1/4"></div><div className="h-64 bg-white/5 rounded-2xl w-full"></div></div>;

  return (
    <div className="space-y-6 animate-reveal-fade">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Project Submissions</h2>
          <p className="text-slate-400">Track the progress and matching status of your proposals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {proposals.map(proposal => (
          <div key={proposal.id} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-white/5 text-[10px] font-bold text-slate-500 rounded border border-white/5 tracking-tighter">
                  {proposal.anonymousCode}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(proposal.status)}`}>
                  {getStatusLabel(proposal.status)}
                </span>
              </div>
              
              <h3 className="text-xl font-bold">{proposal.title}</h3>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-primary" />
                  {proposal.researchAreaName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(proposal.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {proposal.status === 3 ? (
                <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                  <CheckCircle2 size={18} /> View Reveal Details
                </button>
              ) : (
                <button className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
                  <Clock size={18} /> Pending Reveal
                </button>
              )}
              <button 
                onClick={() => alert('Full Document Viewer Coming Soon')}
                className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"
                title="View Full Document"
              >
                <ExternalLink size={20} />
              </button>
            </div>
          </div>
        ))}

        {proposals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
            <AlertCircle size={40} className="text-slate-600 mb-4" />
            <p className="text-slate-500 max-w-xs">You haven't submitted any proposals yet. Start by using the Project Wizard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProposals;
