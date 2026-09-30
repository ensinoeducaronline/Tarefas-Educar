import { Task } from '../types';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Educar+2026',
  token: 'educar-admin-auth-token-2026-secure',
  user: {
    username: 'admin',
    name: 'Administrador Colégio Educar',
    role: 'admin',
    school: 'Colégio Educar'
  }
};

export const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-101',
    description: 'Prender ventilador do grupo 2, Sala de Ángelica',
    level: 'Alta',
    responsible: 'Átila',
    dueDate: '2026-10-01',
    status: 'Pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

export const DEFAULT_RESPONSIBLES: string[] = [
  'Átila',
  'Prof. Carlos Eduardo & Equipe de Ciências',
  'Roberto Mendes (TI / Suporte)',
  'Secretaria Acadêmica - Beatriz Rocha',
  'Coordenação de Segurança Escolar',
  'Diretoria Pedagógica - Helena Vasconcelos',
  'Clara Nogueira (Bibliotecária)'
];
