import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Send, CheckCircle2, AlertCircle, FileText, Code2, Globe } from 'lucide-react';

const ProposalWizard: React.FC = () => {
  const [areas, setAreas] = useState<{ id: string, name: string }[]>([]);
  const [existingProposals, setExistingProposals] = useState<any[]>([]);
  const [hasActive, setHasActive] = useState(false);
  const [formData, setFormData] = useState({ title: '', researchAreaId: '', techStack: '', abstract: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const wordCount = formData.abstract.trim() === "" ? 0 : formData.abstract.trim().split(/\s+/).length;
  const isWordCountValid = wordCount >= 100 && wordCount <= 200;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, propsRes] = await Promise.all([
            api.get('/proposals/areas'),
            api.get('/proposals/my')
        ]);
        setAreas(areasRes.data);
        setExistingProposals(propsRes.data);
        
        const active = propsRes.data.some((p: any) => p.status === 1 || p.status === 2 || p.status === 3);
        setHasActive(active);
      } catch (err) {
        console.error('Failed to fetch initial wizard data');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/proposals', formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Submission failed. Check your word count.');
    } finally {
      setLoading(false);
    }
  };

  if (hasActive) {
    const matched = existingProposals.find(p => p.status === 3);
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-reveal-fade bg-white/5 rounded-3xl border border-white/5">
        <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mb-6 border border-amber-400/30">
          <AlertCircle size={40} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Active Proposal Detected</h2>
        <p className="text-slate-400 max-w-md">
            {matched 
                ? "You are already matched with a supervisor. You cannot submit new proposals at this stage." 
                : "You already have a proposal pending in the pool. You must withdraw or complete your current proposal before submitting a new one."}
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'my' }))}
          className="mt-8 px-8 py-3 bg-[#39b54a] text-white rounded-xl hover:bg-[#2e9c3e] transition-all font-bold shadow-lg shadow-[#39b54a]/20"
        >
          Manage My Submissions
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-reveal-fade">
        <div className="w-20 h-20 bg-emerald-400/20 rounded-full flex items-center justify-center mb-6 border border-emerald-400/30">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Proposal Submitted!</h2>
        <p className="text-slate-400 max-w-md">Your project idea has been anonymously broadcasted to the supervisor pool. We will notify you when interest is expressed.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2 bg-secondary text-white rounded-xl hover:bg-white/10 transition-all font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-reveal-fade">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Submit New Proposal</h2>
        <p className="text-slate-400">Ensure your project abstract is between 100-200 words for the best matching results.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Project Title
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Deep Learning for Automated Crop Grading"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Globe size={16} className="text-primary" /> Research Area
              </label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                value={formData.researchAreaId}
                onChange={e => setFormData({...formData, researchAreaId: e.target.value})}
              >
                <option value="">Select Area...</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Code2 size={16} className="text-primary" /> Tech Stack
              </label>
              <input
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Python, TensorFlow, React Native"
                value={formData.techStack}
                onChange={e => setFormData({...formData, techStack: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col h-full space-y-2">
            <div className="flex justify-between items-center pr-1">
              <label className="text-sm font-medium text-slate-300">Project Abstract</label>
              <span className={`text-xs font-bold ${isWordCountValid ? 'text-[#39b54a]' : 'text-amber-400'}`}>
                {wordCount} / 200 words
              </span>
            </div>
            <textarea
              required
              rows={10}
              className={`w-full flex-1 px-4 py-3 bg-slate-900/50 border rounded-xl focus:ring-2 outline-none transition-all ${isWordCountValid ? 'border-white/10 focus:ring-primary' : 'border-amber-400/50 focus:ring-amber-400'}`}
              placeholder="Detail the problem statement, proposed methodology, and expected outcomes..."
              value={formData.abstract}
              onChange={e => setFormData({...formData, abstract: e.target.value})}
            />
            {!isWordCountValid && wordCount > 0 && (
              <p className="text-[10px] text-amber-400 font-medium">Abstract must be between 100 and 200 words for anonymous matching.</p>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-400/10 border border-red-400/20 text-red-500 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !isWordCountValid}
            className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? 'Processing...' : (
              <>
                Confirm Submission <Send size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalWizard;
