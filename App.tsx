
import React, { useState, useMemo, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Proposals from './components/Proposals';
import Agenda from './components/Agenda';
import Clients from './components/Clients';
import Finance from './components/Finance';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import EventDetail from './components/EventDetail';
import Auth from './components/Auth';
import { useMockData } from './hooks/useMockData';
import { authService } from './services/authService';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';
import { CogIcon, BellIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from './components/icons';
import { Proposal, Client, Event, ProposalStatus, User } from './types';

type View = 'dashboard' | 'proposals' | 'agenda' | 'clients' | 'finance' | 'settings';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
      const saved = localStorage.getItem('me_theme');
      return (saved as Theme) || 'dark';
  });
  
  const [draftProposal, setDraftProposal] = useState<Partial<Proposal> | undefined>(undefined);

  useEffect(() => {
      // 1. Check active session
      authService.getCurrentUser().then(currentUser => {
          setUser(currentUser);
          setLoading(false);
      });

      // 2. Listen for auth changes (Only works if Supabase is configured)
      if (isSupabaseConfigured) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
              if (session?.user) {
                  setUser({
                      id: session.user.id,
                      name: session.user.user_metadata.name || 'Usuário',
                      email: session.user.email || ''
                  });
              } else {
                  // Do not auto logout if in demo mode as session is manual
                  if (isSupabaseConfigured) setUser(null);
              }
          });
          return () => subscription.unsubscribe();
      }
  }, []);

  // Apply theme
  useEffect(() => {
      const root = window.document.documentElement;
      if (theme === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
      localStorage.setItem('me_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const { 
    proposals, kpis, events, clients, businessProfile, transactions, notifications, historicalRevenue, suppliers, services,
    setProposals, setClients, setBusinessProfile, updateTransactionStatus, markNotificationRead, toggleEventTask,
    updateMonthlyGoal, addEventCost, deleteEventCost, addSupplier, deleteSupplier, updateProposal, addService, deleteService
  } = useMockData(user?.id);

  const allScheduledEvents = useMemo(() => {
      const closedProposalsAsEvents: Event[] = proposals
          .filter(p => p.status === ProposalStatus.Closed)
          .map(p => {
              const dateParts = p.date.toString().split('T')[0].split('-');
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]);
              const day = parseInt(dateParts[2]);
              return {
                  id: `prop-${p.id}`,
                  title: `(Contrato) ${p.eventName}`,
                  date: new Date(year, month - 1, day),
                  type: 'Outros',
                  clientName: p.clientName,
                  amount: p.amount,
                  startTime: '00:00',
                  endTime: '23:59'
              } as Event;
          });
      return [...events, ...closedProposalsAsEvents];
  }, [events, proposals]);

  const addProposal = (newProposal: Proposal) => setProposals((prev: any) => [newProposal, ...prev]);
  const addClient = (newClientData: Omit<Client, 'id' | 'proposals' | 'events'>) => setClients((prev: any) => [{...newClientData}, ...prev]);
  const handleEventClick = (event: Event) => setSelectedEvent(event);

  const handleTaskToggle = (taskId: string) => {
      if (selectedEvent) {
          toggleEventTask(selectedEvent.id, taskId);
          if (selectedEvent.checklist) {
            setSelectedEvent({
                ...selectedEvent,
                checklist: selectedEvent.checklist.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
            });
          }
      }
  };

  const handleAddCost = (eventId: string, cost: any) => {
      addEventCost(eventId, cost);
      if (selectedEvent && selectedEvent.id === eventId) {
          const newCost = { ...cost, id: `temp-${Date.now()}` };
          setSelectedEvent({ ...selectedEvent, costs: [...(selectedEvent.costs || []), newCost] });
      }
  };

  const handleDeleteCost = (eventId: string, costId: string) => {
      deleteEventCost(eventId, costId);
      if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent({ ...selectedEvent, costs: selectedEvent.costs?.filter(c => c.id !== costId) });
      }
  };

  const handleMagicCreate = (data: any) => {
      setDraftProposal(data);
      setCurrentView('proposals');
  };
  
  const handleLogout = async () => {
      try {
        await authService.logout();
      } finally {
        setUser(null);
      }
  };
  
  const handleLogin = (loggedInUser: User, isNewUser?: boolean) => {
      setUser(loggedInUser);
      if (isNewUser) {
          setCurrentView('settings');
      } else {
          setCurrentView('dashboard');
      }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard kpis={kpis} events={events} onEventClick={handleEventClick} onMagicCreate={handleMagicCreate} privacyMode={privacyMode} />;
      case 'proposals': return <Proposals initialProposals={proposals} onAddProposal={addProposal} onUpdateProposal={updateProposal} businessProfile={businessProfile} draftProposal={draftProposal} onClearDraft={() => setDraftProposal(undefined)} existingEvents={allScheduledEvents} privacyMode={privacyMode} services={services} />;
      case 'agenda': return <Agenda events={allScheduledEvents} onEventClick={handleEventClick} />;
      case 'clients': return <Clients clients={clients} onAddClient={addClient} suppliers={suppliers} onAddSupplier={addSupplier} onDeleteSupplier={deleteSupplier} />;
      case 'finance': return <Finance transactions={transactions} onUpdateStatus={updateTransactionStatus} historicalData={historicalRevenue} businessProfile={businessProfile} onUpdateGoal={updateMonthlyGoal} privacyMode={privacyMode} />;
      case 'settings': return <Settings profile={businessProfile} onSave={setBusinessProfile} onLogout={handleLogout} services={services} onAddService={addService} onDeleteService={deleteService} />;
      default: return <Dashboard kpis={kpis} events={events} onEventClick={handleEventClick} onMagicCreate={handleMagicCreate} privacyMode={privacyMode} />;
    }
  };

  const getTitle = () => {
      switch(currentView) {
          case 'dashboard': return `Olá, ${businessProfile.name ? businessProfile.name.split(' ')[0] : 'Profissional'}!`;
          case 'settings': return 'Configurações';
          default: return 'Painel de Controle';
      }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-white">Carregando...</div>;
  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased transition-colors duration-200">
      <main className="pb-20">
        <div className="p-4 sm:p-6">
          <header className="mb-6 flex justify-between items-center relative">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Mil Eventos</h1>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm">{getTitle()}</p>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    {privacyMode ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
                <div className="relative">
                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                        <BellIcon className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800 transform translate-x-1/4 -translate-y-1/4"></span>}
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">Notificações</span>
                                <span className="text-xs text-gray-500">{unreadCount > 0 ? `${unreadCount} novas` : 'Nenhuma nova'}</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map(n => (
                                    <div key={n.id} onClick={() => markNotificationRead(n.id)} className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${n.read ? 'opacity-60' : 'bg-indigo-50 dark:bg-indigo-500/5'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm font-semibold ${n.type === 'success' ? 'text-green-600 dark:text-green-400' : n.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>{n.title}</p>
                                            <span className="text-[10px] text-gray-400">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
                                    </div>
                                ))}
                                {notifications.length === 0 && <div className="p-4 text-center text-xs text-gray-500">Nenhuma notificação.</div>}
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={() => setCurrentView('settings')} className={`p-2 rounded-full transition-colors shadow-sm border border-transparent ${currentView === 'settings' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-700'}`}>
                    <CogIcon className="w-5 h-5" />
                </button>
                {businessProfile.logoUrl && <img src={businessProfile.logoUrl} alt="Logo" className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500 shadow-sm" />}
            </div>
          </header>
          {isNotificationsOpen && <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>}
          {renderView()}
          {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} onToggleTask={handleTaskToggle} onAddCost={handleAddCost} onDeleteCost={handleDeleteCost} privacyMode={privacyMode} suppliers={suppliers} />}
        </div>
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};
export default App;
