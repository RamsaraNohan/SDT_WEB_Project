import React, { useState, useEffect } from 'react';
import { Calendar, Award, Send, Plus } from 'lucide-react';
import api from '../api/axios';

interface Meeting {
    id: string;
    meetingDate: string; // Corrected
    topics: string; // Corrected
}

const AcademicPortal: React.FC<{ matchId: string, role: string }> = ({ matchId, role }) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [showMeetingForm, setShowMeetingForm] = useState(false);
    const [newMeeting, setNewMeeting] = useState({ date: '', summary: '' });

    useEffect(() => {
        const fetchMeetings = async () => {
            const res = await api.get(`/academic/meetings/${matchId}`);
            setMeetings(res.data);
        };
        fetchMeetings();
    }, [matchId]);

    const handleLogMeeting = async () => {
        // Map UI state to backend DTO
        const payload = {
            matchId,
            meetingDate: newMeeting.date,
            topics: newMeeting.summary,
            durationMinutes: 60 // Default
        };
        await api.post('/academic/meetings', payload);
        setShowMeetingForm(false);
        // Refresh list
        const res = await api.get(`/academic/meetings/${matchId}`);
        setMeetings(res.data);
    };

    return (
        <div className="space-y-8 animate-reveal-fade">
            <header className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold">Academic Workspace</h2>
                    <p className="text-slate-400">Manage your project milestones and interactions.</p>
                </div>
                {role === 'Supervisor' && (
                     <button 
                        onClick={() => setShowMeetingForm(true)}
                        className="flex items-center gap-2 bg-primary px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                    >
                        <Plus size={20} />
                        Log Interaction
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Meeting History */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Calendar size={20} className="text-primary" />
                        Meeting Log
                    </h3>
                    
                    {meetings.length === 0 ? (
                        <div className="glass-card p-12 text-center text-slate-500 italic rounded-2xl border border-white/5">
                            No interactions logged yet.
                        </div>
                    ) : (
                        meetings.map(m => (
                            <div key={m.id} className="glass-card p-6 rounded-2xl border border-white/5 flex gap-6 hover-slide">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-primary uppercase">{new Date(m.meetingDate).toLocaleString('default', { month: 'short' })}</p>
                                    <p className="text-2xl font-bold">{new Date(m.meetingDate).getDate()}</p>
                                </div>
                                <div>
                                    <p className="text-slate-300">{m.topics}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Milestones / Submissions */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/5 bg-emerald-500/5">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                            <Send size={18} className="text-emerald-400" />
                            Final Submission
                        </h4>
                        <p className="text-sm text-slate-400 mb-4">Upload your finalized report for academic review.</p>
                        <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-semibold">
                            Select File
                        </button>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/5 bg-blue-500/5">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                            <Award size={18} className="text-blue-400" />
                            Project Score
                        </h4>
                        <p className="text-sm text-slate-400 mb-4">
                            {role === 'Supervisor' ? "Record the final academic score for this project." : "Score will be available after supervisor review."}
                        </p>
                        {role === 'Supervisor' && (
                             <button className="w-full py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all font-bold">
                                Enter Score
                             </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Meeting Log */}
            {showMeetingForm && (
                <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 animate-reveal-slide">
                        <h3 className="text-xl font-bold mb-6">Log Supervision Meeting</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3" 
                                    onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Summary</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32" 
                                    placeholder="Discussed methodology and initial results..."
                                    onChange={e => setNewMeeting({...newMeeting, summary: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="flex-1 p-3 text-slate-400 hover:text-white" onClick={() => setShowMeetingForm(false)}>Cancel</button>
                                <button className="flex-1 p-3 bg-primary rounded-xl font-bold" onClick={handleLogMeeting}>Save Log</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicPortal;
