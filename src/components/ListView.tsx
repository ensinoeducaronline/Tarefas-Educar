import React from 'react';
import { Task, TaskLevel, TaskStatus } from '../types';
import { 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  AlertTriangle 
} from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  isAdmin: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  isAdmin,
  onEditTask,
  onDeleteTask,
  onStatusChange
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const statusBadges: Record<TaskStatus, { bg: string; text: string; icon: any }> = {
    Pendente: { bg: 'bg-orange-100 text-[#E25822] border-orange-200', text: 'Pendente', icon: Clock },
    Executando: { bg: 'bg-blue-100 text-[#0B3B95] border-blue-200', text: 'Executando', icon: PlayCircle },
    Concluída: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'Concluída', icon: CheckCircle2 }
  };

  const levelBadges: Record<TaskLevel, { bg: string; text: string; icon: any }> = {
    Alta: { bg: 'bg-rose-100 text-rose-800', text: 'Alta', icon: Flame },
    Média: { bg: 'bg-amber-100 text-amber-800', text: 'Média', icon: Clock },
    Baixa: { bg: 'bg-emerald-100 text-emerald-800', text: 'Baixa', icon: CheckCircle2 }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-sm font-semibold text-slate-600">Nenhuma tarefa encontrada com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 min-w-[280px]">Descrição da Tarefa</th>
              <th className="py-3.5 px-4">Prioridade</th>
              <th className="py-3.5 px-4">Responsável</th>
              <th className="py-3.5 px-4">Data de Entrega</th>
              {isAdmin && <th className="py-3.5 px-4 text-right">Ações Admin</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {tasks.map((task) => {
              const statusCfg = statusBadges[task.status];
              const levelCfg = levelBadges[task.level];
              const isOverdue = task.status !== 'Concluída' && task.dueDate < todayStr;
              const isToday = task.status !== 'Concluída' && task.dueDate === todayStr;

              return (
                <tr key={task.id} className="hover:bg-blue-50/30 transition-colors">
                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isAdmin ? (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B3B95] ${statusCfg.bg}`}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Executando">Executando</option>
                        <option value="Concluída">Concluída</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg}`}>
                        <statusCfg.icon className="w-3 h-3" />
                        <span>{statusCfg.text}</span>
                      </span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4">
                    <div className={`font-semibold text-slate-900 ${task.status === 'Concluída' ? 'line-through text-slate-500' : ''}`}>
                      {task.description}
                    </div>
                  </td>

                  {/* Prioridade */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${levelCfg.bg}`}>
                      <levelCfg.icon className="w-3 h-3" />
                      <span>{levelCfg.text}</span>
                    </span>
                  </td>

                  {/* Responsável */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="w-3.5 h-3.5 text-[#0B3B95]" />
                      <span>{task.responsible}</span>
                    </div>
                  </td>

                  {/* Data Entrega e Registro */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#E25822]" />
                      <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : isToday ? 'text-[#E25822] font-bold' : 'text-slate-700'}`}>
                        {task.dueDate.split('-').reverse().join('/')}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">
                          Atrasada
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[10px] bg-orange-100 text-[#E25822] px-1.5 py-0.5 rounded-full font-bold">
                          Hoje
                        </span>
                      )}
                    </div>
                    {task.createdAt && (
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        Reg: {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(task.createdAt))}
                      </div>
                    )}
                  </td>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1.5 text-slate-400 hover:text-[#0B3B95] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
