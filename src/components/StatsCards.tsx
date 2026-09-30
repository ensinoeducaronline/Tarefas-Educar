import React from 'react';
import { Task, TaskStatus } from '../types';
import { Clock, PlayCircle, CheckCircle, AlertTriangle, ListTodo } from 'lucide-react';

interface StatsCardsProps {
  tasks: Task[];
  activeStatusFilter: 'Todos' | TaskStatus;
  activeDateFilter: string;
  onSelectFilter: (status: 'Todos' | TaskStatus, dateFilter?: 'todos' | 'vencidas') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  tasks,
  activeStatusFilter,
  activeDateFilter,
  onSelectFilter
}) => {
  const total = tasks.length;
  const pendentes = tasks.filter((t) => t.status === 'Pendente').length;
  const executando = tasks.filter((t) => t.status === 'Executando').length;
  const concluidas = tasks.filter((t) => t.status === 'Concluída').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(
    (t) => t.status !== 'Concluída' && t.dueDate < todayStr
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Total Card */}
      <button
        type="button"
        onClick={() => onSelectFilter('Todos', 'todos')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'Todos' && activeDateFilter === 'todos'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/50'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            Total
          </span>
          <ListTodo className="w-4 h-4 opacity-70" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">{total}</div>
        <div className="text-[11px] opacity-70 mt-1">Todas as tarefas</div>
      </button>

      {/* Pendentes Card (Orange Accent) */}
      <button
        type="button"
        onClick={() => onSelectFilter('Pendente', 'todos')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'Pendente' && activeDateFilter !== 'vencidas'
            ? 'bg-[#E25822] text-white border-[#E25822] shadow-md ring-2 ring-orange-300'
            : 'bg-white hover:bg-orange-50/50 text-slate-800 border-orange-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${activeStatusFilter === 'Pendente' ? 'text-white' : 'text-[#E25822]'}`}>
            Pendentes
          </span>
          <Clock className={`w-4 h-4 ${activeStatusFilter === 'Pendente' ? 'text-white' : 'text-[#E25822]'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">{pendentes}</div>
        <div className="text-[11px] opacity-80 mt-1">A iniciar</div>
      </button>

      {/* Executando Card (Educar Blue) */}
      <button
        type="button"
        onClick={() => onSelectFilter('Executando', 'todos')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'Executando' && activeDateFilter !== 'vencidas'
            ? 'bg-[#0B3B95] text-white border-[#0B3B95] shadow-md ring-2 ring-blue-300'
            : 'bg-white hover:bg-blue-50/50 text-slate-800 border-blue-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${activeStatusFilter === 'Executando' ? 'text-white' : 'text-[#0B3B95]'}`}>
            Executando
          </span>
          <PlayCircle className={`w-4 h-4 ${activeStatusFilter === 'Executando' ? 'text-white' : 'text-[#0B3B95]'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">{executando}</div>
        <div className="text-[11px] opacity-80 mt-1">Em andamento</div>
      </button>

      {/* Concluídas Card (Green) */}
      <button
        type="button"
        onClick={() => onSelectFilter('Concluída', 'todos')}
        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'Concluída' && activeDateFilter !== 'vencidas'
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
            : 'bg-white hover:bg-emerald-50/50 text-slate-800 border-emerald-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${activeStatusFilter === 'Concluída' ? 'text-white' : 'text-emerald-700'}`}>
            Concluídas
          </span>
          <CheckCircle className={`w-4 h-4 ${activeStatusFilter === 'Concluída' ? 'text-white' : 'text-emerald-600'}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold font-['Outfit']">{concluidas}</div>
        <div className="text-[11px] opacity-80 mt-1">Finalizadas com sucesso</div>
      </button>

      {/* Alerta de Vencidas / Prazos */}
      <button
        type="button"
        onClick={() => onSelectFilter('Todos', 'vencidas')}
        className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
          activeDateFilter === 'vencidas'
            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
            : overdueCount > 0
            ? 'bg-rose-50/70 hover:bg-rose-100 text-rose-950 border-rose-200 shadow-xs'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${activeDateFilter === 'vencidas' ? 'text-white' : overdueCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
            Prazo Expirado
          </span>
          <AlertTriangle className={`w-4 h-4 ${activeDateFilter === 'vencidas' ? 'text-white' : overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
        </div>
        <div className={`text-2xl sm:text-3xl font-extrabold font-['Outfit'] ${activeDateFilter === 'vencidas' ? 'text-white' : overdueCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
          {overdueCount}
        </div>
        <div className="text-[11px] opacity-80 mt-1">Requer atenção imediata</div>
      </button>
    </div>
  );
};
