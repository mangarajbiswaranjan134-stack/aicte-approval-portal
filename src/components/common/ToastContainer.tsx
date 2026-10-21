import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
          info: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        };

        const borderColors = {
          success: 'border-teal-200 bg-teal-50/95',
          error: 'border-rose-200 bg-rose-50/95',
          warning: 'border-amber-200 bg-amber-50/95',
          info: 'border-blue-200 bg-blue-50/95'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md ${borderColors[toast.type]} transition-all transform duration-200 ease-out`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
