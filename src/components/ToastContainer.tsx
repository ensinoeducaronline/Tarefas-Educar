import React from 'react';
import { NotificationItem } from '../types';
import { PlusCircle, RefreshCw, Trash2, Wifi, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isCreate = toast.type === 'create';
        const isStatus = toast.type === 'status';
        const isDelete = toast.type === 'delete';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/90 flex items-start gap-3 transform transition-all animate-in slide-in-from-bottom-5 duration-300"
          >
            {/* Icon */}
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isCreate
                  ? 'bg-orange-100 text-[#E25822]'
                  : isStatus
                  ? 'bg-blue-100 text-[#0B3B95]'
                  : isDelete
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {isCreate && <PlusCircle className="w-4 h-4" />}
              {isStatus && <RefreshCw className="w-4 h-4" />}
              {isDelete && <Trash2 className="w-4 h-4" />}
              {!isCreate && !isStatus && !isDelete && <Wifi className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {toast.title}
                </span>
                <span className="text-[10px] text-slate-400">agora</span>
              </div>
              <p className="text-xs text-slate-600 leading-snug mt-0.5 line-clamp-2">
                {toast.message}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Dispensar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
