/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskLevel, TaskStatus, AdminUser, NotificationItem, FilterState } from './types';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { LoginModal } from './components/LoginModal';
import { TaskModal } from './components/TaskModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ToastContainer } from './components/ToastContainer';
import { AboutModal } from './components/AboutModal';
import { EducarLogo } from './components/EducarLogo';
import { playNotificationSound } from './utils/audio';
import { 
  Plus, 
  RotateCw, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Authentication State
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('educar_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('educar_admin_token') || null;
  });

  // Modals & Drawers
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // View mode: 'kanban' or 'list'
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Real-time notifications & sound state
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('educar_sound_enabled') !== 'false';
  });

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'Todos',
    level: 'Todos',
    responsible: '',
    dateFilter: 'todos',
    sortBy: 'dueDateAsc'
  });

  // Save sound preference
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('educar_sound_enabled', String(next));
      return next;
    });
  };

  // Helper to add toast and notification log
  const pushNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications((prev) => [newItem, ...prev.slice(0, 49)]); // keep last 50
    setToasts((prev) => [newItem, ...prev.slice(0, 2)]); // show max 3 toasts concurrently

    if (soundEnabled) {
      playNotificationSound();
    }

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== newItem.id));
    }, 5000);
  }, [soundEnabled]);

  // Fetch initial tasks from backend
  const fetchTasks = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Não foi possível carregar as tarefas');
      const data = await response.json();
      setTasks(data.tasks || []);
      setError(null);
    } catch (err: any) {
      console.error('Fetch tasks error:', err);
      setError('Erro ao sincronizar com o servidor em nuvem.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load & token validation
  useEffect(() => {
    fetchTasks();

    if (token) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) {
            handleLogout();
          }
        })
        .catch(() => {});
    }
  }, [fetchTasks]);

  // SSE (Server-Sent Events) for real-time cloud connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'CONNECTED') {
            setIsConnected(true);
          } else if (payload.type === 'TASK_CREATED') {
            const newTask: Task = payload.data.task;
            setTasks((prev) => {
              if (prev.some((t) => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
            pushNotification({
              title: 'Nova Tarefa Criada',
              message: payload.data.message || `Tarefa cadastrada: ${newTask.description}`,
              type: 'create',
              taskId: newTask.id
            });
          } else if (payload.type === 'TASK_STATUS_CHANGED') {
            const updatedTask: Task = payload.data.task;
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
            pushNotification({
              title: `Tarefa movida para ${payload.data.newStatus}`,
              message: payload.data.message || `Status alterado para ${payload.data.newStatus}`,
              type: 'status',
              taskId: updatedTask.id
            });
          } else if (payload.type === 'TASK_UPDATED') {
            const updatedTask: Task = payload.data.task;
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
            pushNotification({
              title: 'Tarefa Atualizada',
              message: payload.data.message || `Tarefa atualizada: ${updatedTask.description}`,
              type: 'update',
              taskId: updatedTask.id
            });
          } else if (payload.type === 'TASK_DELETED') {
            const taskId: string = payload.data.taskId;
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            pushNotification({
              title: 'Tarefa Removida',
              message: payload.data.message || 'Uma tarefa foi excluída pelo administrador.',
              type: 'delete',
              taskId
            });
          } else if (payload.type === 'TASKS_RESET') {
            setTasks(payload.data.tasks);
            pushNotification({
              title: 'Quadro Restaurado',
              message: payload.data.message,
              type: 'system'
            });
          }
        } catch (e) {
          console.error('SSE message parse error:', e);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        if (eventSource) {
          eventSource.close();
        }
        // Attempt reconnect after 3 seconds
        reconnectTimeout = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [pushNotification]);

  // Auth Handlers
  const handleLoginSuccess = (newToken: string, user: AdminUser) => {
    setToken(newToken);
    setAdmin(user);
    localStorage.setItem('educar_admin_token', newToken);
    localStorage.setItem('educar_admin_user', JSON.stringify(user));
    pushNotification({
      title: 'Administrador Autenticado',
      message: `Bem-vindo(a), ${user.name}! Modo de edição habilitado.`,
      type: 'system'
    });
  };

  const handleLogout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('educar_admin_token');
    localStorage.removeItem('educar_admin_user');
    pushNotification({
      title: 'Sessão Finalizada',
      message: 'Você agora está navegando no modo público de visualização.',
      type: 'system'
    });
  };

  // Task Operations (Admin Only)
  const handleSaveTask = async (taskData: {
    description: string;
    level: TaskLevel;
    responsible: string;
    dueDate: string;
    status?: TaskStatus;
  }) => {
    if (!token) {
      setIsLoginOpen(true);
      throw new Error('Você precisa estar logado como administrador.');
    }

    if (taskToEdit) {
      // Update existing task
      const response = await fetch(`/api/tasks/${taskToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao atualizar tarefa.');
      }
      setTaskToEdit(null);
    } else {
      // Create new task
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao criar tarefa.');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        // Revert on error
        fetchTasks(true);
      }
    } catch {
      fetchTasks(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        fetchTasks(true);
      }
    } catch {
      fetchTasks(true);
    }
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenCreate = () => {
    if (!admin) {
      setIsLoginOpen(true);
      return;
    }
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  // Filter & Sort calculation
  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Compute week bounds
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));

    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];
    const currentYearMonth = todayStr.substring(0, 7);

    return tasks
      .filter((task) => {
        // Search text
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchDesc = task.description.toLowerCase().includes(query);
          const matchResp = task.responsible.toLowerCase().includes(query);
          if (!matchDesc && !matchResp) return false;
        }

        // Status
        if (filters.status !== 'Todos' && task.status !== filters.status) {
          return false;
        }

        // Level
        if (filters.level !== 'Todos' && task.level !== filters.level) {
          return false;
        }

        // Responsible
        if (filters.responsible && task.responsible !== filters.responsible) {
          return false;
        }

        // Date Filter
        if (filters.dateFilter === 'vencidas') {
          if (task.status === 'Concluída' || task.dueDate >= todayStr) return false;
        } else if (filters.dateFilter === 'hoje') {
          if (task.dueDate !== todayStr) return false;
        } else if (filters.dateFilter === 'esta_semana') {
          if (task.dueDate < startOfWeekStr || task.dueDate > endOfWeekStr) return false;
        } else if (filters.dateFilter === 'este_mes') {
          if (!task.dueDate.startsWith(currentYearMonth)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'dueDateAsc') {
          return a.dueDate.localeCompare(b.dueDate);
        } else if (filters.sortBy === 'dueDateDesc') {
          return b.dueDate.localeCompare(a.dueDate);
        } else if (filters.sortBy === 'level') {
          const priorityWeight: Record<TaskLevel, number> = { Alta: 3, Média: 2, Baixa: 1 };
          return (priorityWeight[b.level] || 0) - (priorityWeight[a.level] || 0);
        } else {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [tasks, filters]);

  // Notifications read/clear handlers
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Sticky Navbar */}
      <Navbar
        admin={admin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenNewTask={handleOpenCreate}
        isConnected={isConnected}
        unreadCount={unreadNotificationsCount}
        onToggleNotifications={() => setIsNotificationDrawerOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Hero Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-[#E25822]">
                Gestão Integrada
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-[#0B3B95]">
                Colégio Educar
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              Painel de Acompanhamento de Tarefas
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Acompanhamento transparente das atividades pedagógicas, administrativas e operacionais do Colégio Educar em tempo real.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => fetchTasks(false)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#0B3B95] transition-colors shadow-2xs cursor-pointer"
              title="Recarregar tarefas da nuvem"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0B3B95]' : ''}`} />
            </button>

            {admin ? (
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-[#E25822] hover:bg-[#d04915] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nova Tarefa</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 bg-[#0B3B95] hover:bg-[#08296a] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Connection/Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchTasks()}
              className="font-bold underline cursor-pointer hover:text-amber-900"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Stats Overview Cards */}
        <StatsCards
          tasks={tasks}
          activeStatusFilter={filters.status}
          activeDateFilter={filters.dateFilter}
          onSelectFilter={(status, dateFilter) => {
            setFilters((prev) => ({
              ...prev,
              status,
              dateFilter: dateFilter || 'todos'
            }));
          }}
        />

        {/* Search, Filter Bar and View Mode Switcher */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          tasks={tasks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredTasks.length}
          totalCount={tasks.length}
        />

        {/* Admin Instructions Banner when in Admin Mode */}
        {admin && (
          <div className="mb-4 p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#0B3B95] font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#E25822]" />
              <span>Controle Administrativo Habilitado: Arraste os cartões para mudar o status ou use os botões rápidos.</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Usuário ativo: <strong>{admin.username}</strong>
            </span>
          </div>
        )}

        {/* Tasks Views: Kanban Board or List */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-[#0B3B95] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-semibold text-slate-600">Carregando tarefas escolares...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={filteredTasks}
            isAdmin={Boolean(admin)}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onOpenNewTask={handleOpenCreate}
          />
        ) : (
          <ListView
            tasks={filteredTasks}
            isAdmin={Boolean(admin)}
            onEditTask={handleOpenEdit}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) for Logged Admin */}
      {admin && (
        <button
          onClick={handleOpenCreate}
          className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#E25822] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Cadastrar Nova Tarefa"
          aria-label="Cadastrar Nova Tarefa"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <EducarLogo size="sm" showSlogan={false} />
          
          <div className="text-center sm:text-left">
            <span className="font-semibold text-slate-700">Colégio Educar</span> — Construindo valores através da educação e organização pedagógica.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-xs text-[#0B3B95] hover:underline font-semibold"
            >
              Ajuda & Acesso
            </button>
            <span>•</span>
            <span className="text-[11px] text-slate-400">
              {new Date().getFullYear()} © Todos os direitos reservados.
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        initialTask={taskToEdit}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearAll={handleClearNotifications}
        isConnected={isConnected}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
        isAdmin={Boolean(admin)}
      />

      {/* Real-time Toasts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
