import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  // For error messages, show as centered modal dialog
  if (type === 'error') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-red-500 p-6">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">שגיאה</h3>
            <p className="text-slate-700 text-lg whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
          <div className="p-6 bg-slate-50 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
            >
              הבנתי
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For success messages, keep as toast
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg transition-all z-50 ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center gap-3`}>
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Toast;
