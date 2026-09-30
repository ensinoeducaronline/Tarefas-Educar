import React, { useState, useEffect } from 'react';
import { Task, TaskLevel, TaskStatus } from '../types';
import { X, Calendar, User, AlignLeft, Layers, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    description: string;
    level: TaskLevel;
    responsible: string;
    dueDate: string;
    status?: TaskStatus;
  }) => Promise<void>;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask
}) => {
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<TaskLevel>('Média');
  const [responsible, setResponsible] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pendente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested responsible options for quick select
  const SUGGESTED_RESPONSIBLES = [
    'Coordenação Pedagógica',
    'Secretaria Escolar',
    'Diretoria Geral',
    'Equipe de TI & Laboratório',
    'Prof. Ensino Médio',
    'Prof. Fundamental II',
    'Biblioteca Educar',
    'Coordenação de Eventos'
  ];

  useEffect(() => {
    if (initialTask) {
      setDescription(initialTask.description);
      setLevel(initialTask.level);
      setResponsible(initialTask.responsible);
      setDueDate(initialTask.dueDate);
      setStatus(initialTask.status);
    } else {
      // Default new task
      setDescription('');
      setLevel('Média');
      setResponsible('');
      // Default to 7 days from now in YYYY-MM-DD
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setStatus('Pendente');
    }
    setError(null);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor, informe a descrição da tarefa.');
      return;
    }
    if (!responsible.trim()) {
      setError('Por favor, indique o responsável pela tarefa.');
      return;
    }
    if (!dueDate) {
      setError('Por favor, selecione a data de entrega.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSave({
        description: description.trim(),
        level,
        responsible: responsible.trim(),
        dueDate,
        ...(initialTask ? { status } : {})
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar a tarefa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Colégio Educar identity */}
        <div className="bg-gradient-to-r from-[#0B3B95] via-[#0E46AF] to-[#0B3B95] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E25822] text-white flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-orange-200">
                Módulo Administrativo
              </span>
              <h2 className="text-xl font-bold font-['Outfit']">
                {initialTask ? 'Editar Tarefa Escolar' : 'Cadastrar Nova Tarefa'}
              </h2>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo 1: Descrição Tarefa (textarea) */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-[#0B3B95]" />
                Descrição da Tarefa *
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {description.length} caracteres
              </span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o objetivo da tarefa escolar, orientações pedagógicas ou técnicas..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all placeholder:text-slate-400 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo 2: Nível (Suspenso com: Baixa, Média, Alta) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nível de Prioridade *
              </label>
              <div className="relative">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as TaskLevel)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="Baixa">🟢 Baixa (Rotina / Prazos longos)</option>
                  <option value="Média">🟡 Média (Importante no cronograma)</option>
                  <option value="Alta">🔴 Alta (Urgente / Prioridade Máxima)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Campo 4: Data de Entrega (Seletor de calendário) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <Calendar className="w-4 h-4 text-[#E25822]" />
                Data de Entrega *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Campo 3: Responsável (Input de texto) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <User className="w-4 h-4 text-[#0B3B95]" />
              Responsável *
            </label>
            <input
              type="text"
              required
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nome do colaborador, setor ou coordenação responsável"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all"
            />
            {/* Quick responsible chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 self-center mr-1">Sugestões:</span>
              {SUGGESTED_RESPONSIBLES.slice(0, 4).map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setResponsible(sug)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-[#0B3B95] text-slate-600 border border-slate-200 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* If editing, allow changing Status directly in form */}
          {initialTask && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status do Processo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pendente', 'Executando', 'Concluída'] as TaskStatus[]).map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      status === st
                        ? st === 'Concluída'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : st === 'Executando'
                          ? 'bg-[#0B3B95] text-white border-[#0B3B95] shadow-sm'
                          : 'bg-[#E25822] text-white border-[#E25822] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#E25822] hover:bg-[#d04915] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{initialTask ? 'Salvar Alterações' : 'Cadastrar Tarefa'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
