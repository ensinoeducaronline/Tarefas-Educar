import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskLevel, TaskStatus } from '../types';
import { 
  X, 
  Calendar, 
  User, 
  AlignLeft, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ChevronDown,
  UserPlus,
  Check,
  Clock
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    description: string;
    level: TaskLevel;
    responsible: string;
    dueDate: string;
    status?: TaskStatus;
    createdAt?: string;
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
  const [registrationDate, setRegistrationDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown state for Responsável
  const [responsiblesList, setResponsiblesList] = useState<string[]>(['Átila']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format date and time for compact friendly display: HH:mm - DD/MM/AAAA
  const formatDisplayDateTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch {
      return isoString;
    }
  };

  // Fetch registered responsibles from server (strictly excluding Mariana)
  const loadRegisteredResponsibles = async () => {
    try {
      const res = await fetch('/api/responsibles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.responsibles) && data.responsibles.length > 0) {
          // Exclude Mariana and ensure Átila is present
          const filtered = data.responsibles.filter(
            (name: string) => name.trim().toLowerCase() !== 'mariana'
          );
          const list = filtered.includes('Átila') ? filtered : ['Átila', ...filtered];
          setResponsiblesList(list);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching responsibles:', e);
    }
    setResponsiblesList(['Átila']);
  };

  useEffect(() => {
    if (isOpen) {
      loadRegisteredResponsibles();
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialTask) {
      setDescription(initialTask.description);
      setLevel(initialTask.level);
      setResponsible(initialTask.responsible);
      setDueDate(initialTask.dueDate);
      setStatus(initialTask.status);
      setRegistrationDate(initialTask.createdAt || new Date().toISOString());
    } else {
      // Default new task: registrationDate is automatic current date and time
      const nowIso = new Date().toISOString();
      setDescription('');
      setLevel('Média');
      setResponsible('');
      setRegistrationDate(nowIso);
      // Default to 7 days from now in YYYY-MM-DD
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setStatus('Pendente');
    }
    setError(null);
    setIsDropdownOpen(false);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  // Filtered responsibles according to input query (excluding Mariana)
  const trimmed = responsible.trim();
  const filteredResponsibles = responsiblesList
    .filter((name) => name.toLowerCase() !== 'mariana')
    .filter((name) => name.toLowerCase().includes(trimmed.toLowerCase()));

  const isExactMatch = responsiblesList.some(
    (name) => name.toLowerCase() === trimmed.toLowerCase()
  );

  const handleSelectResponsible = (name: string) => {
    setResponsible(name);
    setIsDropdownOpen(false);
  };

  const handleAddNewResponsible = (name: string) => {
    const clean = name.trim();
    if (!clean || clean.toLowerCase() === 'mariana') return;
    if (!responsiblesList.includes(clean)) {
      setResponsiblesList((prev) => [...prev, clean]);
    }
    setResponsible(clean);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Por favor, informe a descrição da tarefa.');
      return;
    }
    if (!responsible.trim()) {
      setError('Por favor, indique quem executa a tarefa.');
      return;
    }
    if (!dueDate) {
      setError('Por favor, selecione a data de entrega.');
      return;
    }

    const cleanResp = responsible.trim();

    // Auto-register new responsible locally immediately
    if (cleanResp.toLowerCase() !== 'mariana' && !responsiblesList.includes(cleanResp)) {
      setResponsiblesList((prev) => [...prev, cleanResp]);
    }

    setError(null);
    setLoading(true);

    try {
      await onSave({
        description: description.trim(),
        level,
        responsible: cleanResp,
        dueDate,
        createdAt: registrationDate || new Date().toISOString(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Colégio Educar identity (Fixed top) */}
        <div className="bg-gradient-to-r from-[#0B3B95] via-[#0E46AF] to-[#0B3B95] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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

        {/* Form Body with Scrollbar when necessary */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo: Data de Registro Compacta (Hora e Data) */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#0B3B95]" />
              <span>Data de registro:</span>
            </span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {formatDisplayDateTime(registrationDate)}
            </span>
          </div>

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
            {/* Campo 2: Nível (Suspenso apenas com bullets e nomes: Baixa, Média, Alta) */}
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
                  <option value="Baixa">🟢 Baixa</option>
                  <option value="Média">🟡 Média</option>
                  <option value="Alta">🔴 Alta</option>
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

          {/* Campo 3: Responsável (Input com Menu Suspenso & Cadastro Automático) */}
          <div className="relative" ref={dropdownRef}>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0B3B95]" />
                Responsável *
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Selecione ou digite um novo nome
              </span>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                required
                value={responsible}
                onChange={(e) => {
                  setResponsible(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Quem executa"
                autoComplete="off"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all placeholder:text-slate-400"
              />

              {/* Dropdown Toggle Chevron */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-[#0B3B95] cursor-pointer"
                title="Abrir lista de responsáveis"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#0B3B95]' : ''}`} />
              </button>
            </div>

            {/* Menu Suspenso (Dropdown) com Responsáveis Cadastrados & Opção de Novo */}
            {isDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100 animate-in fade-in-50 duration-150">
                
                {/* Header info */}
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Responsáveis Cadastrados</span>
                  <span className="text-slate-400">{responsiblesList.length} disponíveis</span>
                </div>

                {/* Option to create new if typed text is not empty and not existing */}
                {trimmed && !isExactMatch && trimmed.toLowerCase() !== 'mariana' && (
                  <button
                    type="button"
                    onClick={() => handleAddNewResponsible(trimmed)}
                    className="w-full px-3.5 py-2.5 text-left text-xs bg-orange-50/80 hover:bg-orange-100 text-[#E25822] font-semibold flex items-center justify-between transition-colors border-b border-orange-100 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastrar novo: <strong>"{trimmed}"</strong></span>
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs">
                      Automático
                    </span>
                  </button>
                )}

                {/* List of Responsibles */}
                <div className="py-1">
                  {filteredResponsibles.length > 0 ? (
                    filteredResponsibles.map((item) => {
                      const isSelected = item.toLowerCase() === trimmed.toLowerCase();
                      const isAtila = item.toLowerCase() === 'átila' || item.toLowerCase() === 'atila';

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectResponsible(item)}
                          className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-[#0B3B95] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              isAtila
                                ? 'bg-orange-100 text-[#E25822]'
                                : 'bg-blue-100 text-[#0B3B95]'
                            }`}>
                              {item.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{item}</span>
                            {isAtila && (
                              <span className="text-[10px] bg-orange-100 text-[#E25822] font-semibold px-1.5 py-0.2 rounded-md">
                                Padrão
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-[#0B3B95] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3.5 py-3 text-xs text-slate-400 text-center">
                      Nenhum responsável com esse nome cadastrado ainda.
                    </div>
                  )}
                </div>

                {/* Footer helper */}
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-400 text-center">
                  Qualquer novo nome digitado será cadastrado automaticamente ao salvar.
                </div>
              </div>
            )}
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
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

          {/* Footer Actions (Inside the scrollable form or sticky at bottom) */}
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
