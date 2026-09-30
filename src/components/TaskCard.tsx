import React, { useState } from 'react';
import { Task, TaskLevel, TaskStatus } from '../types';
import { 
  GripVertical, 
  Calendar, 
  User, 
  Clock, 
  Flame, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  MoreVertical
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isAdmin,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Format date and check urgency
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = task.dueDate.split('-').map(Number);
  const taskDate = new Date(year, month - 1, day);
  taskDate.setHours(0, 0, 0, 0);

  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0 && task.status !== 'Concluída';
  const isDueToday = diffDays === 0 && task.status !== 'Concluída';
  const isDueSoon = diffDays > 0 && diffDays <= 3 && task.status !== 'Concluída';

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(taskDate);

  // Level configuration
  const levelConfig: Record<TaskLevel, { badgeClass: string; label: string; icon: any }> = {
    Alta: {
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
      label: 'Alta',
      icon: Flame
    },
    Média: {
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
      label: 'Média',
      icon: Clock
    },
    Baixa: {
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      label: 'Baixa',
      icon: CheckCircle2
    }
  };

  const currentLevel = levelConfig[task.level] || levelConfig.Média;
  const LevelIcon = currentLevel.icon;

  return (
    <div
      draggable={isAdmin}
      onDragStart={(e) => {
        if (!isAdmin) return;
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) onDragStart(e, task);
      }}
      className={`group relative bg-white rounded-2xl p-4 border transition-all duration-200 shadow-xs hover:shadow-md ${
        isAdmin ? 'cursor-grab active:cursor-grabbing hover:border-[#0B3B95]/50' : 'cursor-default border-slate-200/90'
      } ${
        isOverdue
          ? 'border-l-4 border-l-rose-500 bg-rose-50/20'
          : isDueToday
          ? 'border-l-4 border-l-[#E25822]'
          : task.status === 'Concluída'
          ? 'border-l-4 border-l-emerald-500 opacity-90'
          : 'border-l-4 border-l-[#0B3B95]'
      }`}
    >
      {/* Top Row: Level Badge + Date urgency + Admin actions */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Prioridade Nível */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ring-1 ${currentLevel.badgeClass}`}
          >
            <LevelIcon className="w-3 h-3" />
            <span>{currentLevel.label}</span>
          </span>

          {/* Urgência de Prazo */}
          {isOverdue && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>Vencida há {Math.abs(diffDays)}d</span>
            </span>
          )}
          {isDueToday && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#E25822] bg-orange-100 px-2 py-0.5 rounded-full">
              <span>Vence Hoje!</span>
            </span>
          )}
          {isDueSoon && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
              <span>Em {diffDays} dias</span>
            </span>
          )}
        </div>

        {/* Drag Handle Indicator (Admin) or Lock Indicator (Public) */}
        <div className="flex items-center gap-1">
          {isAdmin ? (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="opacity-80 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#0B3B95] rounded-lg transition-colors cursor-pointer"
                title="Editar Tarefa"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="opacity-80 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                title="Excluir Tarefa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div 
                className="p-1 text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing" 
                title="Arraste para mover entre colunas"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">Somente Leitura</span>
          )}
        </div>
      </div>

      {/* Task Description (Textarea content) */}
      <h3 className={`text-sm font-semibold text-slate-900 leading-snug mb-3 line-clamp-3 ${
        task.status === 'Concluída' ? 'text-slate-600 line-through decoration-emerald-500/60' : ''
      }`}>
        {task.description}
      </h3>

      {/* Details: Responsável & Data de Entrega */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
        
        {/* Responsável */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-50 text-[#0B3B95] flex items-center justify-center shrink-0">
            <User className="w-3 h-3" />
          </div>
          <span className="truncate font-medium text-slate-700" title={task.responsible}>
            {task.responsible}
          </span>
        </div>

        {/* Data de Entrega */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-orange-50 text-[#E25822] flex items-center justify-center shrink-0">
              <Calendar className="w-3 h-3" />
            </div>
            <span className={`font-medium ${isOverdue ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
              Entrega: {formattedDate}
            </span>
          </div>

          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {task.status}
          </span>
        </div>
      </div>

      {/* Quick Move Buttons for Touch & Mobile (Available to Admin) */}
      {isAdmin && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Mover:
          </div>

          <div className="flex items-center gap-1.5">
            {task.status !== 'Pendente' && (
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'Pendente')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-white bg-slate-100 hover:bg-[#E25822] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Retornar para Pendente"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Pendente</span>
              </button>
            )}

            {task.status !== 'Executando' && (
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'Executando')}
                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-white bg-slate-100 hover:bg-[#0B3B95] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Mover para Executando"
              >
                <span>Executando</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {task.status !== 'Concluída' && (
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'Concluída')}
                className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="Marcar como Concluída"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Concluir</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xs rounded-2xl p-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-150">
          <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
            <Trash2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800 mb-1">Excluir esta tarefa escolar?</p>
          <p className="text-[11px] text-slate-500 mb-3 px-2 line-clamp-1">{task.description}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(task.id);
                setShowConfirmDelete(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
