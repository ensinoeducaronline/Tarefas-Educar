import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Clock, PlayCircle, CheckCircle2, Plus, Sparkles, Inbox } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  isAdmin: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTask: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  isAdmin,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onOpenNewTask
}) => {
  // Mobile active tab ('Pendente' | 'Executando' | 'Concluída')
  const [mobileTab, setMobileTab] = useState<TaskStatus>('Pendente');
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: {
    status: TaskStatus;
    title: string;
    description: string;
    headerBg: string;
    borderColor: string;
    activeBorder: string;
    badgeBg: string;
    badgeText: string;
    icon: any;
  }[] = [
    {
      status: 'Pendente',
      title: 'Pendente',
      description: 'Tarefas planejadas e aguardando início',
      headerBg: 'bg-orange-50/70 border-orange-200/80',
      borderColor: 'border-orange-100',
      activeBorder: 'border-[#E25822] ring-2 ring-orange-200 bg-orange-50/40',
      badgeBg: 'bg-[#E25822]',
      badgeText: 'text-white',
      icon: Clock
    },
    {
      status: 'Executando',
      title: 'Executando',
      description: 'Tarefas escolares em andamento ativo',
      headerBg: 'bg-blue-50/70 border-blue-200/80',
      borderColor: 'border-blue-100',
      activeBorder: 'border-[#0B3B95] ring-2 ring-blue-200 bg-blue-50/40',
      badgeBg: 'bg-[#0B3B95]',
      badgeText: 'text-white',
      icon: PlayCircle
    },
    {
      status: 'Concluída',
      title: 'Concluída',
      description: 'Tarefas entregues e homologadas',
      headerBg: 'bg-emerald-50/70 border-emerald-200/80',
      borderColor: 'border-emerald-100',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/40',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      icon: CheckCircle2
    }
  ];

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    if (!isAdmin) return;
    // Only reset if we're actually leaving the column container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    if (!isAdmin) return;
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Column Switcher Bar */}
      <div className="md:hidden flex items-center p-1 bg-slate-200/80 rounded-2xl">
        {columns.map((col) => {
          const count = tasks.filter((t) => t.status === col.status).length;
          const isActive = mobileTab === col.status;
          const Icon = col.icon;
          return (
            <button
              key={col.status}
              type="button"
              onClick={() => setMobileTab(col.status)}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? col.status === 'Pendente'
                    ? 'bg-[#E25822] text-white shadow-md'
                    : col.status === 'Executando'
                    ? 'bg-[#0B3B95] text-white shadow-md'
                    : 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{col.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Grid: Desktop 3 columns / Mobile selected column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          const isMobileHidden = mobileTab !== col.status;
          const isDragOver = dragOverColumn === col.status;
          const Icon = col.icon;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={(e) => handleDragLeave(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`flex flex-col rounded-2xl bg-slate-100/70 border transition-all duration-200 min-h-[500px] p-3 sm:p-4 ${
                isDragOver ? col.activeBorder : col.borderColor
              } ${isMobileHidden ? 'hidden md:flex' : 'flex'}`}
            >
              {/* Column Header */}
              <div className={`p-3.5 rounded-xl border mb-3 flex items-center justify-between shadow-2xs ${col.headerBg}`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${col.badgeBg} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-['Outfit'] flex items-center gap-1.5">
                      {col.title}
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                        {colTasks.length}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {col.description}
                    </p>
                  </div>
                </div>

                {isAdmin && col.status === 'Pendente' && (
                  <button
                    onClick={onOpenNewTask}
                    className="p-1.5 rounded-lg bg-white text-[#E25822] hover:bg-orange-100 transition-colors shadow-2xs cursor-pointer"
                    title="Adicionar tarefa em Pendente"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Drag Drop Helper Banner for Admin */}
              {isAdmin && (
                <div className="mb-2 text-[10px] text-slate-400 text-center font-medium py-1 px-2 border border-dashed border-slate-300 rounded-lg">
                  Arraste e solte tarefas aqui para alterar o status
                </div>
              )}

              {/* Task Cards Container */}
              <div className="flex-1 space-y-3">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isAdmin={isAdmin}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                    />
                  ))
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-300/80 rounded-2xl bg-white/40">
                    <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">Nenhuma tarefa nesta etapa</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAdmin 
                        ? 'Arraste tarefas para cá ou cadastre uma nova' 
                        : 'Aguardando novas atribuições'}
                    </p>
                  </div>
                )}
              </div>

              {/* Column Footer */}
              <div className="mt-3 pt-2 text-right">
                <span className="text-[11px] text-slate-400">
                  {colTasks.length} {colTasks.length === 1 ? 'tarefa' : 'tarefas'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
