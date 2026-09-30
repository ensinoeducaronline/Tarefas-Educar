import React from 'react';
import { FilterState, Task, TaskLevel, TaskStatus } from '../types';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  Calendar, 
  User, 
  Flame, 
  CheckSquare,
  ArrowUpDown
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  tasks: Task[];
  viewMode: 'kanban' | 'list';
  onViewModeChange: (mode: 'kanban' | 'list') => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  tasks,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount
}) => {
  // Extract distinct responsibles
  const uniqueResponsibles = Array.from(
    new Set(tasks.map((t) => t.responsible).filter(Boolean))
  ).sort();

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.status !== 'Todos' ||
    filters.level !== 'Todos' ||
    filters.responsible !== '' ||
    filters.dateFilter !== 'todos';

  const resetFilters = () => {
    onFilterChange({
      search: '',
      status: 'Todos',
      level: 'Todos',
      responsible: '',
      dateFilter: 'todos',
      sortBy: 'dueDateAsc'
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-6 space-y-4">
      {/* Top row: Search input + View mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-[#0B3B95]" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Pesquisar por descrição, responsável ou palavras-chave..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700"
            >
              Limpar
            </button>
          )}
        </div>

        {/* View Mode Toggle & Reset */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#0B3B95] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#0B3B95] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              title="Limpar todos os filtros"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer border border-red-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Second row: Dropdown Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
        
        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-[#0B3B95]" />
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'Todos' | TaskStatus })}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B95]"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">🟡 Pendente</option>
            <option value="Executando">🔵 Executando</option>
            <option value="Concluída">🟢 Concluída</option>
          </select>
        </div>

        {/* Nível Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#E25822]" />
            Nível
          </label>
          <select
            value={filters.level}
            onChange={(e) => onFilterChange({ ...filters, level: e.target.value as 'Todos' | TaskLevel })}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B95]"
          >
            <option value="Todos">Todos os Níveis</option>
            <option value="Alta">🔴 Alta Prioridade</option>
            <option value="Média">🟡 Média</option>
            <option value="Baixa">🟢 Baixa</option>
          </select>
        </div>

        {/* Responsável Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <User className="w-3 h-3 text-[#0B3B95]" />
            Responsável
          </label>
          <select
            value={filters.responsible}
            onChange={(e) => onFilterChange({ ...filters, responsible: e.target.value })}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B95]"
          >
            <option value="">Todos os Responsáveis</option>
            {uniqueResponsibles.map((resp) => (
              <option key={resp} value={resp}>
                {resp}
              </option>
            ))}
          </select>
        </div>

        {/* Data Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#E25822]" />
            Prazo de Entrega
          </label>
          <select
            value={filters.dateFilter}
            onChange={(e) => onFilterChange({ ...filters, dateFilter: e.target.value as any })}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B95]"
          >
            <option value="todos">Todos os Prazos</option>
            <option value="vencidas">⚠️ Vencidas</option>
            <option value="hoje">📅 Vencem Hoje</option>
            <option value="esta_semana">🗓️ Esta Semana</option>
            <option value="este_mes">🗓️ Este Mês</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            Ordenar Por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B95]"
          >
            <option value="dueDateAsc">Prazo: Mais próximas primeiro</option>
            <option value="dueDateDesc">Prazo: Mais distantes</option>
            <option value="level">Prioridade (Alta → Baixa)</option>
            <option value="newest">Mais recentes cadastradas</option>
          </select>
        </div>

      </div>

      {/* Filter summary status pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div>
          Exibindo <span className="font-bold text-[#0B3B95]">{filteredCount}</span> de{' '}
          <span className="font-bold text-slate-700">{totalCount}</span> tarefas
          {hasActiveFilters && <span className="text-[#E25822] font-semibold ml-1.5">(Filtros aplicados)</span>}
        </div>

        {/* Quick status quick chips */}
        <div className="hidden md:flex items-center gap-1">
          {(['Todos', 'Pendente', 'Executando', 'Concluída'] as const).map((st) => (
            <button
              key={st}
              onClick={() => onFilterChange({ ...filters, status: st })}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                filters.status === st
                  ? 'bg-[#0B3B95] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
