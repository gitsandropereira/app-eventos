
export enum ProposalStatus {
  Sent = 'Enviada',
  Analysis = 'Em Análise',
  Closing = 'Fechamento',
  Closed = 'Fechada',
  Lost = 'Perdida',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain password. Storing here for simulation.
}

export interface Proposal {
  id: string;
  clientName: string;
  eventName: string;
  amount: number;
  status: ProposalStatus;
  date: string;
}

export interface FinancialKPI {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface EventTask {
  id: string;
  text: string;
  done: boolean;
}

export interface TimelineItem {
    id: string;
    time: string;
    title: string;
    description?: string;
}

export interface EventCost {
  id: string;
  description: string;
  amount: number;
  category: 'Equipe' | 'Transporte' | 'Alimentação' | 'Equipamento' | 'Outros';
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'DJ' | 'Fotografia' | 'Decoração' | 'Assessoria' | 'Outros';
  clientName?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  checklist?: EventTask[];
  timeline?: TimelineItem[];
  amount?: number; // Revenue from proposal
  costs?: EventCost[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  proposals: number;
  events: number;
}

export interface Supplier {
    id: string;
    name: string;
    category: 'Equipe' | 'Transporte' | 'Alimentação' | 'Equipamento' | 'Outros';
    phone: string;
}

export interface MessageTemplates {
    proposalSend: string;
    reviewRequest: string;
    timelineShare: string;
}

export interface BusinessProfile {
  name: string;
  category: string;
  phone: string;
  email: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Aleatória';
  pixKey: string;
  themeColor: string;
  contractTerms: string;
  logoUrl?: string;
  monthlyGoal?: number;
  // Marketing fields
  bio?: string;
  instagram?: string;
  website?: string;
  slug?: string; // username for the link
  // Templates
  messageTemplates?: MessageTemplates;
}

export interface Transaction {
  id: string;
  description: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  proposalId?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  description: string;
  
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  time: string;
}

export interface MonthlyMetric {
    month: string;
    revenue: number;
}