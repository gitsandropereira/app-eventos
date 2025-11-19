
import { useState, useEffect, useRef } from 'react';
import type { Proposal, FinancialKPI, Event, Client, BusinessProfile, Transaction, ServicePackage, Notification, MonthlyMetric, EventCost, Supplier, TimelineItem } from '../types';
import { getSeedData } from '../services/authService';

export const useMockData = (userId?: string) => {
  // Initialize state with empty defaults. Real data loads in useEffect.
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({} as BusinessProfile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [kpis, setKpis] = useState<FinancialKPI[]>([]);
  const [historicalRevenue, setHistoricalRevenue] = useState<MonthlyMetric[]>([]);
  
  const isLoaded = useRef(false);

  // Load data from localStorage when userId changes
  useEffect(() => {
    if (!userId) return;
    
    const storageKey = `me_data_${userId}`;
    const savedDataStr = localStorage.getItem(storageKey);
    
    let data;
    if (savedDataStr) {
      data = JSON.parse(savedDataStr);
      
      // Hydrate Dates (JSON stores dates as strings)
      if (data.events) {
        data.events = data.events.map((e: any) => ({
            ...e,
            date: new Date(e.date)
        }));
      }
    } else {
      // Fallback (should happen in register, but safe guard)
      data = getSeedData('Usuário');
    }

    setProposals(data.proposals || []);
    setEvents(data.events || []);
    setClients(data.clients || []);
    setBusinessProfile(data.profile || {});
    setTransactions(data.transactions || []);
    setServices(data.services || []);
    setSuppliers(data.suppliers || []);
    setNotifications(data.notifications || []);
    setHistoricalRevenue(data.historicalRevenue || []);
    setKpis(data.kpis || []);

    isLoaded.current = true;

  }, [userId]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!userId || !isLoaded.current) return;

    const dataToSave = {
        proposals,
        events, // Dates will be stringified automatically
        clients,
        profile: businessProfile,
        transactions,
        services,
        suppliers,
        notifications,
        historicalRevenue,
        kpis
    };

    localStorage.setItem(`me_data_${userId}`, JSON.stringify(dataToSave));
  }, [userId, proposals, events, clients, businessProfile, transactions, services, suppliers, notifications, historicalRevenue, kpis]);


  // --- Actions (Wrapped setters) ---

  const updateTransactionStatus = (id: string, status: 'paid' | 'pending' | 'overdue') => {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addService = (service: Omit<ServicePackage, 'id'>) => {
      setServices(prev => [...prev, { ...service, id: `s${Date.now()}` }]);
  };
  
  const deleteService = (id: string) => {
      setServices(prev => prev.filter(s => s.id !== id));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
      setSuppliers(prev => [...prev, { ...supplier, id: `sup${Date.now()}` }]);
  };

  const deleteSupplier = (id: string) => {
      setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const toggleEventTask = (eventId: string, taskId: string) => {
      setEvents(prev => prev.map(e => {
          if (e.id !== eventId) return e;
          if (!e.checklist) return e;
          return {
              ...e,
              checklist: e.checklist.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
          }
      }));
  };

  const updateMonthlyGoal = (amount: number) => {
      setBusinessProfile(prev => ({ ...prev, monthlyGoal: amount }));
  };

  const addEventCost = (eventId: string, cost: Omit<EventCost, 'id'>) => {
    setEvents(prev => prev.map(e => {
        if (e.id !== eventId) return e;
        const newCost: EventCost = { ...cost, id: `c${Date.now()}` };
        return { ...e, costs: [...(e.costs || []), newCost] };
    }));
  };

  const deleteEventCost = (eventId: string, costId: string) => {
      setEvents(prev => prev.map(e => {
          if (e.id !== eventId) return e;
          return { ...e, costs: e.costs?.filter(c => c.id !== costId) };
      }));
  };

  const addTimelineItem = (eventId: string, item: Omit<TimelineItem, 'id'>) => {
      setEvents(prev => prev.map(e => {
          if (e.id !== eventId) return e;
          const newItem: TimelineItem = { ...item, id: `tl${Date.now()}` };
          const updatedTimeline = [...(e.timeline || []), newItem].sort((a, b) => a.time.localeCompare(b.time));
          return { ...e, timeline: updatedTimeline };
      }));
  };

  const deleteTimelineItem = (eventId: string, itemId: string) => {
      setEvents(prev => prev.map(e => {
          if (e.id !== eventId) return e;
          return { ...e, timeline: e.timeline?.filter(t => t.id !== itemId) };
      }));
  };

  return { 
    proposals, 
    kpis, 
    events, 
    clients,
    businessProfile,
    transactions,
    services,
    suppliers,
    notifications,
    historicalRevenue,
    setProposals, 
    setClients,
    setBusinessProfile,
    updateTransactionStatus,
    addService,
    deleteService,
    addSupplier,
    deleteSupplier,
    markNotificationRead,
    toggleEventTask,
    updateMonthlyGoal,
    addEventCost,
    deleteEventCost,
    addTimelineItem,
    deleteTimelineItem
  };
};