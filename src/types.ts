export type TaskLevel = 'Baixa' | 'Média' | 'Alta';
export type TaskStatus = 'Pendente' | 'Executando' | 'Concluída';

export interface Task {
  id: string;
  description: string;
  level: TaskLevel;
  responsible: string;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AdminUser {
  username: string;
  name: string;
  role: string;
  school: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'create' | 'status' | 'update' | 'delete' | 'system';
  read: boolean;
  taskId?: string;
}

export interface FilterState {
  search: string;
  status: 'Todos' | TaskStatus;
  level: 'Todos' | TaskLevel;
  responsible: string;
  dateFilter: 'todos' | 'vencidas' | 'hoje' | 'esta_semana' | 'este_mes';
  sortBy: 'dueDateAsc' | 'dueDateDesc' | 'level' | 'newest';
}
