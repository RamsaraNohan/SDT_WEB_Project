import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Globe, Bell, Lock, Star, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../api/axios';

interface ResearchArea { id: string; name: string; }

const SupervisorSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(4);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    proposalAlert: true,
    matchAlert: true,
    deadlineReminder: true,
  });

  useEffect(() => {
    api.get('/proposals/areas')
      .then(res => setAreas(res.data || []))
      .catch(() => {});
  }, []);

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const handleSaveExpertise = async () => {
    // POST /api/supervisor/expertise would be the real endpoint
    setSaveStatus('✓ Expertise areas saved (demo mode)');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Expertise & Settings</h2>
        <p className="text-slate-400">Configure your research interests and supervision preferences.</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Star size={20} className="text-blue-400" /> Faculty Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: user?.fullName, readOnly: false },
            { label: 'Email', value: user?.email, readOnly: true },
            { label: 'Department', value: 'School of Computing', readOnly: false },
            { label: 'Office Location', value: 'A-Block, Room 205', readOnly: false },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
              <input
                defaultValue={field.value}
                readOnly={field.readOnly}
                className={`w-full px-4 py-3 border rounded-xl outline-none transition-all text-white ${
                  field.readOnly
                    ? 'bg-white/5 border-white/5 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900/50 border-white/10 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
          ))}
        </div>
        <button className="mt-4 px-6 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all font-bold text-sm">
          Save Profile
        </button>
      </div>

      {/* Expertise Areas */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Globe size={20} className="text-blue-400" /> Research Expertise Tags
        </h3>
        <p className="text-slate-400 text-sm mb-4">Select the research areas you can supervise. Projects will be filtered to show only proposals in your selected areas.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {areas.map(area => (
            <button
              key={area.id}
              onClick={() => toggleArea(area.id)}
              className={`p-3 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                selectedAreas.includes(area.id)
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              {selectedAreas.includes(area.id) && <CheckCircle size={14} />}
              {area.name}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-slate-300 block mb-2">Supervision Capacity</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={8}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xl font-bold text-blue-400 w-8 text-center">{capacity}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Max projects you'll supervise this cycle</p>
        </div>

        {saveStatus && <p className="text-emerald-400 text-sm font-medium mb-3">{saveStatus}</p>}
        <button onClick={handleSaveExpertise} className="px-6 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all font-bold text-sm">
          Save Expertise Settings
        </button>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell size={20} className="text-blue-400" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => {
            const labels: Record<string, string> = {
              proposalAlert: 'New Proposal Alerts (in your expertise area)',
              matchAlert: 'Match Confirmation Notifications',
              deadlineReminder: 'Scoring & Meeting Deadline Reminders',
            };
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm font-medium text-white">{labels[key]}</span>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Password */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lock size={20} className="text-blue-400" /> Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          {[
            { key: 'current', label: 'Current Password' },
            { key: 'newPw', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm[field.key as keyof typeof pwForm]}
                  onChange={e => setPwForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white pr-12"
                />
                {field.key === 'current' && (
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-slate-400">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {pwStatus && <p className={`text-sm font-medium ${pwStatus.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{pwStatus}</p>}
          <button
            onClick={() => {
              if (pwForm.newPw !== pwForm.confirm) { setPwStatus('❌ Passwords do not match'); return; }
              setPwStatus('✓ Password updated (demo mode)');
            }}
            className="px-6 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all font-bold text-sm"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorSettings;
