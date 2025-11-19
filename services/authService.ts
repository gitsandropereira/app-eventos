
import { User, BusinessProfile, Proposal, Event, Client, Transaction, ServicePackage, Supplier, Notification, ProposalStatus, MonthlyMetric, MessageTemplates } from '../types';

const USERS_KEY = 'me_users';
const SESSION_KEY = 'me_session';

// --- Seed Data for New Users ---

const initialProposals: Proposal[] = [
  { id: '1', clientName: 'Alice Johnson', eventName: 'Casamento Alice & Bob', amount: 4500, status: ProposalStatus.Closing, date: '2024-09-15' },
  { id: '2', clientName: 'Carlos Silva', eventName: 'Aniversário de 15 Anos', amount: 2800, status: ProposalStatus.Sent, date: '2024-10-20' },
];

const today = new Date();
const initialEvents: Event[] = [
    { 
        id: 'e1', 
        title: 'Casamento Alice & Bob', 
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), 
        type: 'Fotografia',
        clientName: 'Alice Johnson',
        location: 'Buffet Splendore, Av. Paulista 1000',
        startTime: '18:00',
        endTime: '02:00',
        amount: 4500,
        checklist: [
            { id: 't1', text: 'Carregar baterias das câmeras', done: false },
            { id: 't2', text: 'Confirmar lista de fotos protocolares', done: true },
        ],
        timeline: [
            { id: 'tl1', time: '18:00', title: 'Chegada da Equipe', description: 'Montagem de equipamento' },
        ],
        costs: [
            { id: 'c1', description: 'Uber (Ida e Volta)', amount: 80, category: 'Transporte' }
        ]
    }
];

const initialClients: Client[] = [
  { id: 'c1', name: 'Alice Johnson', phone: '(11) 98765-4321', email: 'alice.j@email.com', proposals: 1, events: 1 },
  { id: 'c2', name: 'Carlos Silva', phone: '(21) 91234-5678', proposals: 1, events: 1 },
];

const initialTemplates: MessageTemplates = {
    proposalSend: "Olá {cliente}! 👋\n\nAqui está o link da proposta para o evento *{evento}*.\n\nVocê pode conferir todos os detalhes, valores e assinar digitalmente por aqui: {link}\n\nQualquer dúvida, estou à disposição!",
    reviewRequest: "Olá {cliente}! 👋\n\nEspero que tenha gostado do meu trabalho no evento *{evento}*! Foi um prazer participar desse momento.\n\nVocê poderia me deixar uma avaliação? Isso me ajuda muito a continuar crescendo! ⭐⭐⭐⭐⭐",
    timelineShare: "*CRONOGRAMA - {evento}*\n📅 Data: {data}\n\n{cronograma}\n\nGerado por Mil Eventos"
};

const initialProfile: BusinessProfile = {
  name: 'Minha Empresa de Eventos',
  category: 'Serviços para Eventos',
  phone: '(11) 99999-8888',
  email: 'contato@exemplo.com.br',
  pixKeyType: 'CNPJ',
  pixKey: '00.000.000/0001-00',
  themeColor: '#4F46E5', // Indigo-600
  contractTerms: '1. O CONTRATADO compromete-se a prestar os serviços descritos.\n2. O cancelamento deve ser feito com 30 dias de antecedência.',
  monthlyGoal: 10000,
  bio: 'Apaixonados por realizar sonhos e entregar o melhor serviço para o seu evento.',
  messageTemplates: initialTemplates
};

const initialTransactions: Transaction[] = [
    { id: 't1', description: 'Sinal - Casamento Alice', clientName: 'Alice Johnson', amount: 2250, date: '2024-09-15', status: 'paid', proposalId: '1' },
];

const initialServices: ServicePackage[] = [
    { id: 's1', name: 'Pacote Básico', price: 1500, description: 'Serviço essencial por 4 horas.' },
    { id: 's2', name: 'Pacote Premium', price: 3000, description: 'Serviço completo com extras.' },
];

const initialSuppliers: Supplier[] = [
    { id: 's1', name: 'João Freela', category: 'Equipe', phone: '(11) 99999-0001' },
];

const initialNotifications: Notification[] = [
    { id: 'n1', title: 'Bem-vindo!', message: 'Configure seu perfil em Ajustes para começar.', type: 'info', read: false, time: 'Agora' },
];

const historicalRevenue: MonthlyMetric[] = [
    { month: 'Jan', revenue: 0 },
    { month: 'Fev', revenue: 0 },
    { month: 'Mar', revenue: 0 },
];

export const getSeedData = (userName: string) => ({
    proposals: initialProposals,
    events: initialEvents,
    clients: initialClients,
    profile: { ...initialProfile, name: userName || initialProfile.name },
    transactions: initialTransactions,
    services: initialServices,
    suppliers: initialSuppliers,
    notifications: initialNotifications,
    historicalRevenue: historicalRevenue,
    kpis: [
        { label: 'A Receber', value: 'R$ 0,00', change: '0%', isPositive: true },
        { label: 'Recebido (Mês)', value: 'R$ 0,00', change: '0%', isPositive: true },
        { label: 'Propostas Ativas', value: '2', change: '0', isPositive: true },
        { label: 'Conversão', value: '0%', change: '0%', isPositive: true },
    ]
});

// --- Auth Functions ---

export const authService = {
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  register: (name: string, email: string, password: string): User | { error: string } => {
    const users = authService.getUsers();
    if (users.find(u => u.email === email)) {
      return { error: 'Email já cadastrado.' };
    }

    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email,
      password // In a real app, hash this!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Seed data for new user
    const seedData = getSeedData(name);
    localStorage.setItem(`me_data_${newUser.id}`, JSON.stringify(seedData));

    return newUser;
  },

  login: (email: string, password: string): User | { error: string } => {
    const users = authService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { error: 'Credenciais inválidas.' };
    }

    localStorage.setItem(SESSION_KEY, user.id);
    return user;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    // We intentionally do NOT clear `me_data_UserID` so data persists for next login
  },

  getCurrentUser: (): User | null => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    
    const users = authService.getUsers();
    return users.find(u => u.id === userId) || null;
  }
};