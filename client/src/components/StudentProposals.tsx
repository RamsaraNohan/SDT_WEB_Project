import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle2, AlertCircle, ExternalLink, Calendar, Tag, X, FileText, Code2, Globe } from 'lucide-react';

interface ProposalDto {
  id: string;
  title: string;
  anonymousCode: string;
  status: number;
  researchAreaName: string;
  createdAt: string;
  abstract?: string;
  techStack?: string;
}

const StatusColors: Record<number, string> = {
  0: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  1: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  2: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  3: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  4: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const StatusLabels: Record<number, string> = {
  0: 'Draft', 1: 'Submitted', 2: 'Under Review', 3: 'MATCHED', 4: 'Revision Required'
};

const StudentProposals: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDto | null>(null);

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

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-white/5 rounded-xl w-1/4" />
      <div className="h-32 bg-white/5 rounded-2xl w-full" />
      <div className="h-32 bg-white/5 rounded-2xl w-full" />
    </div>
  );

  return (
    <>
      <div className="space-y-6 animate-reveal-fade">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">My Project Submissions</h2>
            <p className="text-slate-400">Track the progress and matching status of your proposals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {proposals.map(proposal => (
            <div
              key={proposal.id}
              className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-white/5 text-[10px] font-bold text-slate-500 rounded border border-white/5 tracking-tighter">
                    {proposal.anonymousCode}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${StatusColors[proposal.status]}`}>
                    {StatusLabels[proposal.status]}
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

                {/* External Link — opens detail modal */}
                <button
                  onClick={() => setSelectedProposal(proposal)}
                  title="View Full Proposal"
                  className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white hover:bg-white/10 transition-all border border-white/5"
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

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-2xl p-8 rounded-3xl border border-white/10 animate-reveal-fade">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-white/5 text-[10px] font-bold text-slate-500 rounded border border-white/5">
                    {selectedProposal.anonymousCode}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${StatusColors[selectedProposal.status]}`}>
                    {StatusLabels[selectedProposal.status]}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{selectedProposal.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-slate-400 border-b border-white/5 pb-4">
                <span className="flex items-center gap-2"><Globe size={14} className="text-primary" /> {selectedProposal.researchAreaName}</span>
                <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(selectedProposal.createdAt).toLocaleDateString()}</span>
              </div>

              {selectedProposal.abstract ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><FileText size={14} /> Abstract</h4>
                  <p className="text-slate-400 text-sm leading-relaxed bg-white/5 p-4 rounded-xl">{selectedProposal.abstract}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">Full abstract details are available after submission review.</p>
              )}

              {selectedProposal.techStack && (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><Code2 size={14} /> Technical Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.techStack.split(',').map(tech => (
                      <span key={tech} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs rounded-full font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-6 py-2.5 bg-white/5 text-slate-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProposals;
