import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, CheckCircle2, AlertCircle, ExternalLink, Calendar, Tag, X, FileText, Code2, Globe, Edit3, Send, Loader2 } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';

interface ProposalDto {
  id: string;
  title: string;
  anonymousCode: string;
  status: number;
  researchAreaName: string;
  researchAreaId: string;
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
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDto | null>(null);
  const [editProposal, setEditProposal] = useState<ProposalDto | null>(null);
  const [areas, setAreas] = useState<{ id: string, name: string }[]>([]);
  
  const showToast = useToastStore(state => state.showToast);

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

  useEffect(() => {
    fetchProposals();
    api.get('/proposals/areas').then(res => setAreas(res.data)).catch(() => {});
  }, []);

  const handleEditDraft = (proposal: ProposalDto) => {
      setEditProposal(proposal);
  };

  const handleUpdateDraft = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editProposal) return;
      
      setSubmitting(editProposal.id);
      try {
          await api.put(`/proposals/my/draft/${editProposal.id}`, {
              title: editProposal.title,
              abstract: editProposal.abstract,
              techStack: editProposal.techStack,
              researchAreaId: editProposal.researchAreaId
          });
          showToast("Draft updated successfully.", "success");
          setEditProposal(null);
          fetchProposals();
      } catch (err: any) {
          showToast(err.response?.data?.message || "Failed to update draft.", "error");
      } finally {
          setSubmitting(null);
      }
  };

  const handleSubmitDraft = async (id: string) => {
      setSubmitting(id);
      try {
          await api.post(`/proposals/my/submit/${id}`);
          showToast("Proposal submitted successfully to the pool.", "success");
          fetchProposals();
      } catch (err: any) {
          showToast(err.response?.data?.message || "Submission failed.", "error");
      } finally {
          setSubmitting(null);
      }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-white/5 rounded-xl w-1/4" />
      <div className="h-32 bg-white/5 rounded-2xl w-full" />
      <div className="h-32 bg-white/5 rounded-2xl w-full" />
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">My Project Submissions</h2>
            <p className="text-slate-400">Track the progress and matching status of your proposals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {proposals.map(proposal => (
            <div
              key={proposal.id}
              className="bg-[#0b1120] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#39b54a]/30 transition-all font-sans"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-[#182e25] text-[10px] font-bold text-[#39b54a] rounded border border-[#39b54a]/30 tracking-tighter">
                    {proposal.anonymousCode}
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${StatusColors[proposal.status]}`}>
                    {StatusLabels[proposal.status]}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{proposal.title}</h3>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-[#39b54a]" />
                    {proposal.researchAreaName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {proposal.status === 0 ? (
                    <>
                        <button 
                            onClick={() => handleEditDraft(proposal)} 
                            className="px-4 py-3 bg-white/5 text-slate-300 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
                        >
                            <Edit3 size={18} /> Edit
                        </button>
                        <button 
                            onClick={() => handleSubmitDraft(proposal.id)} 
                            disabled={submitting === proposal.id}
                            className="px-4 py-3 bg-[#182e25] text-[#39b54a] rounded-xl flex items-center gap-2 hover:bg-[#182e25]/80 transition-all border border-[#39b54a]/30 font-bold disabled:opacity-50"
                        >
                            {submitting === proposal.id ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Submit</>}
                        </button>
                    </>
                ) : proposal.status === 3 ? (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'academic' }))}
                    className="px-6 py-3 bg-[#39b54a] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#2e9c3e] transition-all shadow-lg shadow-[#39b54a]/20"
                  >
                    <CheckCircle2 size={18} /> Manage Academic Hub
                  </button>
                ) : (
                  <button className="px-6 py-3 bg-white/5 text-slate-400 rounded-xl flex items-center gap-2 border border-white/5 cursor-not-allowed">
                    <Clock size={18} /> Awaiting Supervisor
                  </button>
                )}

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
            <div className="flex flex-col items-center justify-center py-20 bg-[#0b1120] rounded-3xl border border-dashed border-white/10 text-center">
              <AlertCircle size={40} className="text-slate-600 mb-4" />
              <p className="text-slate-500 max-w-xs">You haven't submitted any proposals yet. Start by using the Project Wizard.</p>
            </div>
          )}
        </div>
      </div>

      {/* Draft Edit Modal */}
      {editProposal && (
        <div className="fixed inset-0 z-[200] bg-[#0a0f1c]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1628] w-full max-w-2xl my-auto p-8 rounded-3xl border border-white/10 shadow-2xl animate-reveal-fade">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Edit3 className="text-[#39b54a]" /> Edit Draft Proposal
                </h2>
                <button onClick={() => setEditProposal(null)} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleUpdateDraft} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Proposal Title</label>
                    <input 
                        required
                        className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#39b54a]/50 outline-none text-white"
                        value={editProposal.title}
                        onChange={e => setEditProposal({...editProposal, title: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Research Area</label>
                        <select 
                            required
                            className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl outline-none text-white focus:ring-2 focus:ring-[#39b54a]/50"
                            value={editProposal.researchAreaId}
                            onChange={e => setEditProposal({...editProposal, researchAreaId: e.target.value})}
                        >
                            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Tech Stack</label>
                        <input 
                            required
                            className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#39b54a]/50 outline-none text-white"
                            value={editProposal.techStack}
                            onChange={e => setEditProposal({...editProposal, techStack: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Abstract</label>
                    <textarea 
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-[#0b1120] border border-white/10 rounded-xl focus:ring-2 focus:ring-[#39b54a]/50 outline-none text-white resize-none"
                        value={editProposal.abstract}
                        onChange={e => setEditProposal({...editProposal, abstract: e.target.value})}
                    />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                    <button 
                        type="button" 
                        onClick={() => setEditProposal(null)}
                        className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 transition-all font-bold"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={!!submitting}
                        className="px-8 py-3 bg-[#39b54a] text-white rounded-xl hover:bg-[#2e9c3e] transition-all font-bold shadow-lg shadow-[#39b54a]/20 flex items-center gap-2"
                    >
                        {submitting === editProposal.id ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-[200] bg-[#0a0f1c]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1628] w-full max-w-2xl p-8 rounded-3xl border border-white/10 animate-reveal-fade">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-[#182e25] text-[10px] font-bold text-[#39b54a] rounded border border-[#39b54a]/30 tracking-tighter">
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

            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-slate-400 border-b border-white/5 pb-4">
                <span className="flex items-center gap-2"><Globe size={14} className="text-[#39b54a]" /> {selectedProposal.researchAreaName}</span>
                <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(selectedProposal.createdAt).toLocaleDateString()}</span>
              </div>

              {selectedProposal.abstract ? (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><FileText size={14} /> Abstract</h4>
                  <p className="text-slate-400 text-sm leading-relaxed bg-[#0b1120] p-4 rounded-xl border border-white/5">{selectedProposal.abstract}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">Full abstract details are available after submission review.</p>
              )}

              {selectedProposal.techStack && (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2"><Code2 size={14} /> Technical Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProposal.techStack.split(',').map(tech => (
                      <span key={tech} className="px-3 py-1 bg-[#182e25] text-[#39b54a] border border-[#39b54a]/20 text-xs rounded-full font-medium">
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
