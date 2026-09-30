import React from 'react';
import { NotificationItem } from '../types';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Wifi
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  isConnected: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  isConnected
}) => {
  if (!isOpen) return null;

  const typeConfig: Record<string, { icon: any; color: string; badge: string }> = {
    create: { icon: PlusCircle, color: 'text-[#E25822] bg-orange-50', badge: 'Nova Tarefa' },
    status: { icon: RefreshCw, color: 'text-[#0B3B95] bg-blue-50', badge: 'Mudança de Status' },
    update: { icon: RefreshCw, color: 'text-amber-600 bg-amber-50', badge: 'Atualizada' },
    delete: { icon: Trash2, color: 'text-rose-600 bg-rose-50', badge: 'Removida' },
    system: { icon: Wifi, color: 'text-emerald-600 bg-emerald-50', badge: 'Sistema' }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0B3B95] to-[#07255f] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Bell className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Notificações em Tempo Real</h3>
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isConnected ? 'Sincronização em nuvem ativa' : 'Reconectando à nuvem...'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              {notifications.length} {notifications.length === 1 ? 'notificação' : 'notificações'}
            </span>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onMarkAllAsRead}
                  className="flex items-center gap-1 text-[#0B3B95] hover:text-blue-800 font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marcar lidas</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((item) => {
                const cfg = typeConfig[item.type] || typeConfig.system;
                const Icon = cfg.icon;

                return (
                  <div
                    key={item.id}
                    className={`pt-3 first:pt-0 p-2 rounded-xl transition-colors ${
                      item.read ? 'bg-transparent' : 'bg-blue-50/40 border border-blue-100/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-snug break-words">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bell className="w-10 h-10 stroke-[1.5] text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Nenhuma notificação recente</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Eventos como novas tarefas cadastradas ou mudanças de status serão avisados aqui em tempo real.
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Colégio Educar • Conexão contínua com a nuvem
          </div>
        </div>
      </div>
    </div>
  );
};
