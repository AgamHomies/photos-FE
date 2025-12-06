import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
      <div className={`px-6 py-3 rounded-full shadow-xl border flex items-center gap-3 ${
        type === 'success' 
            ? 'bg-slate-900 text-white border-slate-800' 
            : 'bg-red-50 text-red-600 border-red-200'
      }`}>
        {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        ) : (
            <XCircle className="w-5 h-5" />
        )}
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
