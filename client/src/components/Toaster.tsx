import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const Toaster: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
            {toasts.map((toast) => (
                <div 
                    key={toast.id} 
                    className="glass-card p-5 rounded-2xl border border-white/10 shadow-2xl min-w-[320px] max-w-[400px] flex items-start gap-4 animate-reveal-slide pointer-events-auto"
                >
                    <div className="mt-1">
                        {toast.type === 'success' && <CheckCircle className="text-emerald-400" size={20} />}
                        {toast.type === 'info' && <Info className="text-blue-400" size={20} />}
                        {toast.type === 'warning' && <AlertTriangle className="text-amber-400" size={20} />}
                        {toast.type === 'error' && <XCircle className="text-red-400" size={20} />}
                    </div>
                    
                    <div className="flex-1 pr-4">
                        <p className="text-sm font-medium text-white leading-tight">{toast.message}</p>
                    </div>

                    <button 
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toaster;
