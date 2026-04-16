import React, { useState, useEffect } from 'react';
import { Calendar, Award, Plus, FileText, CheckCircle2, MessageSquare, Loader2, Star, History, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useToastStore } from '../store/useToastStore';

interface Meeting {
    id: string;
    meetingDate: string;
    topics: string;
}

interface Iteration {
    id: string;
    iterationNumber: number;
    submissionContent: string;
    submittedAt: string;
    supervisorFeedback: string | null;
    reviewedAt: string | null;
    assignedMarks: number | null;
    status: number; // 0: Pending, 1: Revision, 2: Approved
    fileName: string | null;
    fileUrl: string | null;
}

interface ProjectScore {
    overallScore: number;
    supervisorFeedback: string;
    gradedAt: string;
}

const AcademicPortal: React.FC<{ matchId: string, role: string }> = ({ matchId, role }) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [iterations, setIterations] = useState<Iteration[]>([]);
    const [score, setScore] = useState<ProjectScore | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Forms
    const [showMeetingForm, setShowMeetingForm] = useState(false);
    const [showIterationForm, setShowIterationForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState<Iteration | null>(null);
    const [showFinalScoreForm, setShowFinalScoreForm] = useState(false);
    
    const [newMeeting, setNewMeeting] = useState({ date: '', summary: '' });
    const [reviewData, setReviewData] = useState({ feedback: '', marks: 0, status: 1 });
    const [finalScoreData, setFinalScoreData] = useState({ score: 0, feedback: '' });
    
    const isGraded = !!score;
    const [actionLoading, setActionLoading] = useState(false);
    const showToast = useToastStore(state => state.showToast);

    const fetchData = async () => {
        if (!matchId) return;
        try {
            const [mRes, iRes, sRes] = await Promise.all([
                api.get(`/Academic/meetings/${matchId}`).catch(() => ({ data: [] })),
                api.get(`/Academic/iterations/${matchId}`).catch(() => ({ data: [] })),
                api.get(`/Academic/score/${matchId}`).catch(() => ({ data: null }))
            ]);
            setMeetings(mRes.data);
            setIterations(iRes.data);
            if (sRes.data) setScore(sRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [matchId]);

    const handleLogMeeting = async () => {
        setActionLoading(true);
        try {
            await api.post('/Academic/meetings', {
                matchId,
                meetingDate: newMeeting.date,
                topics: newMeeting.summary,
                durationMinutes: 60
            });
            showToast("Meeting logged successfully.", "success");
            setShowMeetingForm(false);
            fetchData();
        } catch (e) {
            showToast("Failed to log meeting.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 50 * 1024 * 1024) {
            showToast("File exceeds 50MB limit.", "error");
            return;
        }

        setActionLoading(true);
        const formData = new FormData();
        formData.append('MatchId', matchId);
        formData.append('File', file);

        try {
            await api.post('/Academic/iterations/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast(`Version v${iterations.length + 1} uploaded successfully.`, "success");
            setShowIterationForm(false);
            fetchData();
        } catch (err: any) {
            showToast(err.response?.data?.error || "Upload failed.", "error");
        } finally {
            setActionLoading(false);
        }
    };


    const handleReviewIteration = async () => {
        if (!showReviewForm) return;
        setActionLoading(true);
        try {
            await api.post('/Academic/iterations/review', {
                iterationId: showReviewForm.id,
                feedback: reviewData.feedback,
                marks: reviewData.marks,
                status: Number(reviewData.status)
            });
            showToast("Review submitted successfully.", "success");
            setShowReviewForm(null);
            fetchData();
        } catch (e) {
            showToast("Failed to submit review.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleFinalScore = async () => {
        setActionLoading(true);
        try {
            await api.post('/Academic/score', {
                matchId,
                overallScore: finalScoreData.score,
                supervisorFeedback: finalScoreData.feedback
            });
            showToast("Final score published.", "success");
            setShowFinalScoreForm(false);
            fetchData();
        } catch (e) {
            showToast("Failed to publish score.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-reveal-fade">
            <header className="flex flex-col items-stretch lg:flex-row lg:items-center justify-between bg-[#0e1628] p-6 md:p-8 rounded-3xl border border-white/5 gap-6">
                <div className="w-full lg:w-auto">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <Award className="text-[#39b54a]" /> Academic Workspace
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">Iterative submission tracking and grading system. <span className="text-[10px] opacity-30">v1.0-Stable</span></p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                    {role === 'Supervisor' && (
                         <button 
                            onClick={() => setShowMeetingForm(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-400/20 rounded-xl hover:bg-blue-500/20 transition-all font-bold text-xs"
                         >
                            <Calendar size={14} /> Log Meeting
                         </button>
                    )}
                    
                    {role === 'Supervisor' && !isGraded && (
                        <button 
                            onClick={() => setShowFinalScoreForm(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all font-bold text-xs"
                        >
                            <Star size={14} /> Finalize Grading
                        </button>
                    )}

                    {role === 'Student' && !isGraded && (
                        <button
                            onClick={() => setShowIterationForm(true)}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#39b54a] text-white rounded-xl hover:bg-[#39b54a]/90 transition-all font-black shadow-lg shadow-[#39b54a]/20"
                        >
                            <Plus size={18} /> Submit Work
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Iteration History - Main Column */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            <History size={20} className="text-[#39b54a]" />
                            Submission Iterations
                        </h3>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            {iterations.length} Total Versions
                        </span>
                    </div>

                    <div className="space-y-4">
                        {iterations.length === 0 ? (
                            <div className="bg-[#0e1628] p-12 text-center text-slate-500 italic rounded-3xl border border-white/5">
                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                No work submitted yet. Begin by uploading your first draft.
                            </div>
                        ) : (
                            iterations.map(it => (
                                <div key={it.id} className="bg-[#0e1628] rounded-3xl border border-white/5 overflow-hidden font-sans">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-[#39b54a] border border-white/5">
                                                v{it.iterationNumber}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">Submission Phase {it.iterationNumber}</p>
                                                <p className="text-xs text-slate-500">{new Date(it.submittedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {it.status === 0 ? (
                                                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20">Pending Review</span>
                                            ) : it.status === 1 ? (
                                                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/20">Revision Requested</span>
                                            ) : (
                                                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-[#39b54a]/10 text-[#39b54a] border border-[#39b54a]/20">Approved</span>
                                            )}
                                            
                                            {it.assignedMarks !== null && (
                                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                                                    <Star size={12} className="text-[#39b54a]" />
                                                    <span className="text-xs font-bold text-white">{it.assignedMarks}/100</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0b1120]/50">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Student Submission</h4>
                                            <div className="p-4 bg-[#0a0f1c] rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed italic relative group">
                                                {it.fileName ? (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="text-[#39b54a]" size={20} />
                                                            <div>
                                                                <p className="font-bold text-slate-200">{it.fileName}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase">Version {it.iterationNumber}</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={it.fileUrl?.startsWith('/') ? `${api.defaults.baseURL?.replace('/api', '')}${it.fileUrl}` : it.fileUrl || '#'} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#39b54a]/10 text-[#39b54a] rounded-lg border border-[#39b54a]/20 hover:bg-[#39b54a]/20 transition-all font-bold text-[10px]"
                                                        >
                                                            DOWNLOAD
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span>"{it.submissionContent}"</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Supervisor Feedback</h4>
                                            {it.supervisorFeedback ? (
                                                <div className="p-4 bg-[#39b54a]/5 rounded-2xl border border-[#39b54a]/10 text-sm text-slate-300 leading-relaxed border-l-2 border-l-[#39b54a]">
                                                    {it.supervisorFeedback}
                                                </div>
                                            ) : (
                                                <div className="h-full flex items-center justify-center">
                                                    {role === 'Supervisor' ? (
                                                        <button 
                                                            onClick={() => {
                                                                setShowReviewForm(it);
                                                                setReviewData({...reviewData, feedback: '', marks: it.assignedMarks || 0, status: it.status});
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-[#39b54a]/10 text-[#39b54a] border border-[#39b54a]/20 rounded-xl hover:bg-[#39b54a]/20 transition-all font-bold text-xs"
                                                        >
                                                            <MessageSquare size={14} /> Add Review & Score
                                                        </button>
                                                    ) : (
                                                        <p className="text-xs text-slate-600 italic">No feedback provided yet.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Final Score Card */}
                    <div className="bg-[#0e1628] rounded-3xl border border-white/5 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Award size={80} />
                        </div>
                        <h4 className="font-bold flex items-center gap-2 mb-4 text-white">
                            <Star size={18} className="text-[#39b54a]" />
                            Project Grading
                        </h4>
                        
                        {score ? (
                            <div className="text-center py-4">
                                <p className="text-5xl font-black text-white mb-2">{score.overallScore}%</p>
                                <p className="text-[10px] font-black text-[#39b54a] uppercase tracking-widest bg-[#39b54a]/10 inline-block px-3 py-1 rounded-full border border-[#39b54a]/10">Published Grade</p>
                                <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-400 text-left">
                                    <p className="font-bold text-white mb-1 uppercase tracking-tighter">Final Remarks:</p>
                                    {score.supervisorFeedback}
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    {role === 'Supervisor' 
                                        ? "Once the iterative review cycle is complete, finalize the overall academic grade below." 
                                        : "Your final calculated score will appear here once the supervisor publishes the grading certificate."}
                                </p>
                                {role === 'Supervisor' && (
                                     <button 
                                        onClick={() => setShowFinalScoreForm(true)}
                                        className="w-full py-4 bg-[#39b54a] text-white rounded-2xl hover:bg-[#2e9c3e] transition-all font-bold shadow-lg shadow-[#39b54a]/20 flex items-center justify-center gap-2"
                                     >
                                        <CheckCircle2 size={18} /> Finalize Grading
                                     </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Meeting History Widget */}
                    <div className="bg-[#0e1628] rounded-3xl border border-white/5 overflow-hidden">
                        <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                            <h4 className="font-bold text-sm flex items-center gap-2">
                                <Calendar size={16} className="text-blue-400" /> Interaction Log
                            </h4>
                            <span className="text-[10px] text-slate-500 ">{meetings.length} Logs</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                            {meetings.length === 0 ? (
                                <p className="text-xs text-slate-600 text-center py-4 italic">No meetings logged.</p>
                            ) : (
                                meetings.map(m => (
                                    <div key={m.id} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[#39b54a] font-bold">{new Date(m.meetingDate).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-400 line-clamp-2">{m.topics}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Modals Section --- */}

            {/* Meeting Log Modal */}
            {showMeetingForm && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e1628] w-full max-w-md p-8 rounded-3xl border border-white/10 animate-reveal-slide">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calendar className="text-blue-400" /> Log Session</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Meeting Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Internal Summary</label>
                                <textarea 
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 h-32 text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                                    placeholder="Outline the guidance provided..."
                                    onChange={e => setNewMeeting({...newMeeting, summary: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="flex-1 p-4 text-slate-400 hover:text-white font-bold" onClick={() => setShowMeetingForm(false)}>Cancel</button>
                                <button disabled={actionLoading} className="flex-1 p-4 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20" onClick={handleLogMeeting}>
                                    {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Log'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Iteration Submission Modal */}
            {showIterationForm && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e1628] w-full max-w-lg p-8 rounded-3xl border border-white/10 animate-reveal-slide">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2"><Plus className="text-[#39b54a]" /> New Submission (v{iterations.length + 1})</h3>
                            <button onClick={() => setShowIterationForm(false)} className="text-slate-500 hover:text-white"><X size={24} className="" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 bg-[#0a0f1c] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center hover:border-[#39b54a]/50 transition-all group relative">
                                <FileText size={48} className="text-slate-700 mb-4 group-hover:text-[#39b54a] transition-all" />
                                <p className="text-sm font-bold text-slate-300">Submit Milestone Document</p>
                                <p className="text-xs text-slate-500 mt-2">PDF, DOCX, PNG or JPG up to 50MB</p>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                                    disabled={actionLoading}
                                />
                                {actionLoading && (
                                    <div className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm">
                                        <Loader2 className="animate-spin text-[#39b54a] mb-2" size={32} />
                                        <p className="text-xs font-bold text-white">Uploading...</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase font-black tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5">
                                <AlertCircle size={14} className="text-amber-400" />
                                <span>Note: Every submission is permanent and forced as a new version for academic integrity.</span>
                            </div>

                            <button className="w-full py-4 bg-white/5 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/5" onClick={() => setShowIterationForm(false)}>
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Iteration Review Modal */}
            {showReviewForm && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e1628] w-full max-w-lg p-8 rounded-3xl border border-white/10 animate-reveal-slide">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Review Submission v{showReviewForm.iterationNumber}</h3>
                            <button onClick={() => setShowReviewForm(null)}><X size={24} className="text-slate-500" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-sm text-slate-400">
                                "{showReviewForm.submissionContent}"
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Supervisor Feedback</label>
                                <textarea 
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 h-32 text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                                    placeholder="Provide detailed improvement instructions..."
                                    value={reviewData.feedback}
                                    onChange={e => setReviewData({...reviewData, feedback: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phase Marks (0-100)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        value={reviewData.marks}
                                        onChange={e => setReviewData({...reviewData, marks: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Review Status</label>
                                    <select 
                                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        value={reviewData.status}
                                        onChange={e => setReviewData({...reviewData, status: Number(e.target.value)})}
                                    >
                                        <option value={1}>Revision Required</option>
                                        <option value={2}>Approved / Completed</option>
                                    </select>
                                </div>
                            </div>

                            <button disabled={actionLoading} className="w-full p-4 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20" onClick={handleReviewIteration}>
                                {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Score Modal */}
            {showFinalScoreForm && (
                <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e1628] w-full max-w-md p-8 rounded-3xl border border-white/10 animate-reveal-slide">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Award className="text-blue-400" /> Final Academic Grading</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Final Overall Score (%)</label>
                                <input 
                                    type="number" 
                                    max="100" min="0"
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 text-3xl font-black text-center text-white outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={e => setFinalScoreData({...finalScoreData, score: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Official Grader Remarks</label>
                                <textarea 
                                    className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl p-4 h-32 text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                                    placeholder="Summarize the student's performance throughout the match..."
                                    onChange={e => setFinalScoreData({...finalScoreData, feedback: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="flex-1 p-4 text-slate-400 hover:text-white font-bold" onClick={() => setShowFinalScoreForm(false)}>Cancel</button>
                                <button disabled={actionLoading} className="flex-1 p-4 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20" onClick={handleFinalScore}>
                                    {actionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Publish Certificate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const X = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default AcademicPortal;
