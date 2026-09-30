import React from 'react';
import { EducarLogo } from './EducarLogo';
import { X, ShieldCheck, CheckCircle2, Cloud, Smartphone, Move } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  isAdmin: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  isAdmin
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B3B95] to-[#07255f] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <EducarLogo size="md" light={true} showSlogan={true} className="mb-2" />
          <p className="text-xs text-blue-200 mt-2">
            Sistema Oficial de Gestão de Tarefas e Planejamento Escolar
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0B3B95]" />
              Acesso Administrativo Restrito
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Somente a equipe administrativa autorizada do colégio tem permissão para cadastrar novas tarefas, editar atribuições e movimentar os status no fluxo de trabalho.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Recursos Principais do Sistema:</h4>
            
            <div className="flex items-start gap-2.5">
              <Cloud className="w-4 h-4 text-[#0B3B95] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Sincronização em Nuvem & Notificações em Tempo Real:</strong> Todas as alterações (novas tarefas, mudanças de status, exclusões) são propagadas instantaneamente via Server-Sent Events (SSE) para todas as pessoas conectadas.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Move className="w-4 h-4 text-[#E25822] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Quadro Kanban com Drag-and-Drop:</strong> O administrador organiza as tarefas entre Pendente, Executando e Concluída arrastando os cartões ou usando os atalhos rápidos de toque.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Responsivo para Mobile & Desktop:</strong> Navegação simples adaptada para celulares e tablets com alternador de colunas por abas.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0B3B95] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Dashboard Público com Filtros:</strong> Qualquer visitante pode consultar tarefas, filtrar por status, nível de prioridade (Baixa, Média, Alta), responsável e prazo de entrega.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Colégio Educar • Construindo valores.
            </span>
            {!isAdmin ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-4 py-2 bg-[#0B3B95] hover:bg-[#08286a] text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-xs"
              >
                Fazer Login de Admin
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-xs cursor-pointer"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
