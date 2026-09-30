import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Task Interface
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

// Data storage configuration
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'tasks.json');

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    description: 'Elaboração e revisão das provas do Simulado Geral do Ensino Médio (1º e 2º Bimestres)',
    level: 'Alta',
    responsible: 'Átila',
    dueDate: '2026-10-08',
    status: 'Executando',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'task-102',
    description: 'Planejamento e organização dos estandes da Feira de Ciências e Tecnologia Educar 2026',
    level: 'Alta',
    responsible: 'Prof. Carlos Eduardo & Equipe de Ciências',
    dueDate: '2026-10-15',
    status: 'Pendente',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'task-103',
    description: 'Manutenção preventiva dos equipamentos dos Laboratórios de Informática e Robótica',
    level: 'Média',
    responsible: 'Roberto Mendes (TI / Suporte)',
    dueDate: '2026-10-05',
    status: 'Executando',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'task-104',
    description: 'Envio do boletim informativo mensal aos pais e responsáveis sobre o calendário escolar',
    level: 'Média',
    responsible: 'Secretaria Acadêmica - Beatriz Rocha',
    dueDate: '2026-10-02',
    status: 'Pendente',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'task-105',
    description: 'Treinamento de primeiros socorros e brigada de incêndio para equipe docente e colaboradores',
    level: 'Baixa',
    responsible: 'Coordenação de Segurança Escolar',
    dueDate: '2026-10-25',
    status: 'Pendente',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'task-106',
    description: 'Reunião de alinhamento pedagógico e acolhimento dos novos alunos do Fundamental II',
    level: 'Alta',
    responsible: 'Diretoria Pedagógica - Helena Vasconcelos',
    dueDate: '2026-09-28',
    status: 'Concluída',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    createdBy: 'admin'
  },
  {
    id: 'task-107',
    description: 'Atualização do acervo bibliográfico e catálogo digital da Biblioteca Educar',
    level: 'Baixa',
    responsible: 'Clara Nogueira (Bibliotecária)',
    dueDate: '2026-09-29',
    status: 'Concluída',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdBy: 'admin'
  }
];

function loadTasks(): Task[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading tasks file:', error);
  }
  // If file doesn't exist or fails, write initial tasks
  saveTasks(INITIAL_TASKS);
  return INITIAL_TASKS;
}

function saveTasks(tasks: Task[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving tasks file:', error);
  }
}

let tasksCache: Task[] = loadTasks();

// Responsibles storage configuration
const RESPONSIBLES_FILE = path.resolve(DATA_DIR, 'responsibles.json');

function loadResponsibles(): string[] {
  let list: string[] = [];
  try {
    if (fs.existsSync(RESPONSIBLES_FILE)) {
      list = JSON.parse(fs.readFileSync(RESPONSIBLES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading responsibles file:', e);
  }

  // Strictly exclude 'Mariana' as requested by the user
  list = list.filter((item) => item.trim().toLowerCase() !== 'mariana');

  // Ensure 'Átila' is always registered and prominent
  if (!list.includes('Átila')) {
    list.unshift('Átila');
  }

  return Array.from(new Set(list));
}

function saveResponsibles(list: string[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RESPONSIBLES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving responsibles file:', e);
  }
}

let responsiblesCache: string[] = loadResponsibles();
saveResponsibles(responsiblesCache);

function registerResponsibleIfNew(name: string): boolean {
  const clean = name.trim();
  if (!clean) return false;
  if (!responsiblesCache.includes(clean)) {
    responsiblesCache.push(clean);
    saveResponsibles(responsiblesCache);
    broadcastEvent('RESPONSIBLE_ADDED', {
      responsible: clean,
      responsibles: responsiblesCache
    });
    return true;
  }
  return false;
}

// SSE (Server-Sent Events) clients
interface SSEClient {
  id: number;
  res: Response;
}
let sseClients: SSEClient[] = [];
let nextClientId = 1;

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      // Ignore write errors for dropped connections
    }
  });
}

// Simple Admin Auth Token
const ADMIN_TOKEN = 'educar-admin-auth-token-2026-secure';

function verifyAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso restrito ao administrador do Colégio Educar.' });
    return;
  }
  const token = authHeader.substring(7);
  if (token !== ADMIN_TOKEN) {
    res.status(403).json({ error: 'Token administrativo inválido ou expirado.' });
    return;
  }
  next();
}

// API Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'Educar+2026') {
    res.json({
      success: true,
      token: ADMIN_TOKEN,
      user: {
        username: 'admin',
        name: 'Administrador Colégio Educar',
        role: 'admin',
        school: 'Colégio Educar'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais incorretas. Usuário ou senha inválidos.'
    });
  }
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === `Bearer ${ADMIN_TOKEN}`) {
    res.json({
      valid: true,
      user: {
        username: 'admin',
        name: 'Administrador Colégio Educar',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ valid: false });
  }
});

// Real-time SSE Endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = nextClientId++;
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send handshake message
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Conectado em tempo real ao Colégio Educar', clientId })}\n\n`);

  // Periodic heartbeat / ping every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'PING' })}\n\n`);
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Responsibles Endpoints (Public GET, Admin Write)
app.get('/api/responsibles', (_req: Request, res: Response) => {
  res.json({
    responsibles: responsiblesCache,
    total: responsiblesCache.length
  });
});

app.post('/api/responsibles', verifyAdmin, (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Nome do responsável é obrigatório.' });
    return;
  }
  const isNew = registerResponsibleIfNew(name);
  res.status(201).json({
    success: true,
    isNew,
    name: name.trim(),
    responsibles: responsiblesCache
  });
});

app.delete('/api/responsibles/:name', verifyAdmin, (req: Request, res: Response) => {
  const target = decodeURIComponent(req.params.name).trim().toLowerCase();
  responsiblesCache = responsiblesCache.filter((r) => r.trim().toLowerCase() !== target);
  saveResponsibles(responsiblesCache);
  broadcastEvent('RESPONSIBLE_REMOVED', {
    removed: req.params.name,
    responsibles: responsiblesCache
  });
  res.json({ success: true, responsibles: responsiblesCache });
});

// Tasks Endpoints (Public GET, Admin Write)
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json({
    tasks: tasksCache,
    total: tasksCache.length,
    serverTime: new Date().toISOString()
  });
});

app.post('/api/tasks', verifyAdmin, (req: Request, res: Response) => {
  const { description, level, responsible, dueDate, createdAt } = req.body;

  if (!description || !description.trim()) {
    res.status(400).json({ error: 'A Descrição da Tarefa é obrigatória.' });
    return;
  }
  if (!['Baixa', 'Média', 'Alta'].includes(level)) {
    res.status(400).json({ error: 'O Nível deve ser Baixa, Média ou Alta.' });
    return;
  }
  if (!responsible || !responsible.trim()) {
    res.status(400).json({ error: 'O Responsável pela tarefa é obrigatório.' });
    return;
  }
  if (!dueDate || !dueDate.trim()) {
    res.status(400).json({ error: 'A Data de Entrega é obrigatória.' });
    return;
  }

  // Automatically register responsible if new
  registerResponsibleIfNew(responsible);

  const newTask: Task = {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    description: description.trim(),
    level,
    responsible: responsible.trim(),
    dueDate: dueDate.trim(),
    status: 'Pendente',
    createdAt: (createdAt && typeof createdAt === 'string') ? createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  };

  tasksCache.unshift(newTask);
  saveTasks(tasksCache);

  broadcastEvent('TASK_CREATED', {
    task: newTask,
    message: `Nova tarefa adicionada: "${newTask.description.slice(0, 45)}..." por Admin`,
    admin: 'admin'
  });

  res.status(201).json({ success: true, task: newTask });
});

app.put('/api/tasks/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, level, responsible, dueDate, status } = req.body;

  const index = tasksCache.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Tarefa não encontrada.' });
    return;
  }

  const current = tasksCache[index];
  const oldStatus = current.status;

  if (responsible) {
    registerResponsibleIfNew(responsible);
  }

  const updated: Task = {
    ...current,
    description: description !== undefined ? description.trim() : current.description,
    level: level !== undefined ? level : current.level,
    responsible: responsible !== undefined ? responsible.trim() : current.responsible,
    dueDate: dueDate !== undefined ? dueDate.trim() : current.dueDate,
    status: status !== undefined ? status : current.status,
    updatedAt: new Date().toISOString()
  };

  tasksCache[index] = updated;
  saveTasks(tasksCache);

  broadcastEvent('TASK_UPDATED', {
    task: updated,
    oldStatus,
    newStatus: updated.status,
    message: `Tarefa atualizada: "${updated.description.slice(0, 45)}..."`
  });

  res.json({ success: true, task: updated });
});

app.patch('/api/tasks/:id/status', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pendente', 'Executando', 'Concluída'].includes(status)) {
    res.status(400).json({ error: 'Status inválido. Deve ser Pendente, Executando ou Concluída.' });
    return;
  }

  const index = tasksCache.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Tarefa não encontrada.' });
    return;
  }

  const task = tasksCache[index];
  const oldStatus = task.status;
  task.status = status;
  task.updatedAt = new Date().toISOString();

  saveTasks(tasksCache);

  broadcastEvent('TASK_STATUS_CHANGED', {
    task,
    oldStatus,
    newStatus: status,
    message: `Tarefa movida de [${oldStatus}] para [${status}]`
  });

  res.json({ success: true, task });
});

app.delete('/api/tasks/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tasksCache.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Tarefa não encontrada.' });
    return;
  }

  const removed = tasksCache.splice(index, 1)[0];
  saveTasks(tasksCache);

  broadcastEvent('TASK_DELETED', {
    taskId: id,
    task: removed,
    message: `Tarefa excluída: "${removed.description.slice(0, 45)}..."`
  });

  res.json({ success: true, taskId: id });
});

// Seed/Reset endpoint for testing
app.post('/api/tasks/reset', verifyAdmin, (_req: Request, res: Response) => {
  tasksCache = [...INITIAL_TASKS];
  saveTasks(tasksCache);
  broadcastEvent('TASKS_RESET', {
    tasks: tasksCache,
    message: 'Quadro de tarefas restaurado com dados de demonstração.'
  });
  res.json({ success: true, tasks: tasksCache });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Setup Vite in middleware mode for hot development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Colégio Educar Server rodando na porta ${PORT}`);
  });
}

startServer();
