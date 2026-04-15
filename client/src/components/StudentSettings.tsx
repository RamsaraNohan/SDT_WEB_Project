import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Bell, Lock, User, Eye, EyeOff } from 'lucide-react';

const StudentSettings: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState({
    matchAlert: true,
    revealAlert: true,
    deadlineReminder: true,
    emailDigest: false,
  });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    if (pwForm.newPw !== pwForm.confirm) {
      setPwStatus('❌ Passwords do not match');
      return;
    }
    // In a real system, call api.post('/auth/change-password', {...pwForm})
    setPwStatus('✓ Password change request received (demo mode)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-slate-400">Manage your preferences and account security.</p>
      </div>

      {/* Profile Info */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User size={20} className="text-emerald-400" /> Profile Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Full Name (Read-only)</label>
            <input
              value={user?.fullName}
              readOnly
              className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Email (Read-only)</label>
            <input
              value={user?.email}
              readOnly
              className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">Profile data is locked. Contact your Module Leader for name corrections.</p>
      </div>

      {/* Notification Preferences */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell size={20} className="text-emerald-400" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => {
            const labels: Record<string, string> = {
              matchAlert: 'Supervisor Interest Alerts',
              revealAlert: 'Identity Reveal Notifications',
              deadlineReminder: 'Deadline Reminders',
              emailDigest: 'Weekly Email Digest',
            };
            return (
              <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm font-medium text-white">{labels[key]}</span>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Password Change */}
      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lock size={20} className="text-emerald-400" /> Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.current}
                onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-white pr-12"
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-slate-400">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.newPw}
              onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Confirm New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-white"
            />
          </div>
          {pwStatus && (
            <p className={`text-sm font-medium ${pwStatus.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{pwStatus}</p>
          )}
          <button onClick={handlePasswordChange} className="px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition-all font-bold text-sm">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
