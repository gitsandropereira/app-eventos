
import { useState, useEffect } from 'react';
import type { Proposal, FinancialKPI, Event, Client, BusinessProfile, Transaction, ServicePackage, Supplier, Notification, MonthlyMetric } from '../types';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

export const useMockData = (userId?: string) => {
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

  // --- FETCH DATA (HYBRID) ---
  const fetchData = async () => {
    if (!userId) return;

    // === MODE: LOCAL STORAGE (DEMO) ===
    if (!isSupabaseConfigured) {
        const localKey = `me_data_${userId}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
            const data = JSON.parse(raw);
            setBusinessProfile(data.profile || {});
            setProposals(data.proposals || []);
            setClients(data.clients || []);
            setEvents(data.events?.map((e: any) => ({...e, date: new Date(e.date)})) || []);
            setTransactions(data.transactions || []);
            setServices(data.services || []);
            setSuppliers(data.suppliers || []);
            calculateKPIs(data.proposals || [], data.transactions || [], data.profile?.monthlyGoal || 10000);
        }
        return;
    }

    // === MODE: SUPABASE (REAL) ===
    try {
        // 1. Fetch Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileData) {
            setBusinessProfile({
                name: profileData.name,
                category: profileData.category,
                phone: profileData.phone,
                email: profileData.email,
                pixKeyType: profileData.pix_key_type,
                pixKey: profileData.pix_key,
                themeColor: profileData.theme_color,
                contractTerms: profileData.contract_terms,
                logoUrl: profileData.logo_url,
                monthlyGoal: profileData.monthly_goal,
                bio: profileData.bio,
                instagram: profileData.instagram,
                website: profileData.website,
                slug: profileData.slug,
                messageTemplates: profileData.message_templates
            });
        }

        // 2. Fetch Clients
        const { data: clientsData } = await supabase.from('clients').select('*');
        if (clientsData) {
            setClients(clientsData.map((c: any) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                email: c.email,
                proposals: 0, 
                events: 0
            })));
        }

        // 3. Fetch Proposals
        const { data: proposalsData } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
        if (proposalsData) {
            setProposals(proposalsData.map((p: any) => ({
                id: p.id,
                clientName: p.client_name,
                eventName: p.event_name,
                amount: p.amount,
                status: p.status,
                date: p.date
            })));
        }

        // 4. Fetch Events
        const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (eventsData) {
            setEvents(eventsData.map((e: any) => ({
                id: e.id,
                title: e.title,
                date: new Date(e.date + 'T00:00:00'),
                type: e.type,
                clientName: e.client_name,
                location: e.location,
                startTime: e.start_time,
                endTime: e.end_time,
                checklist: e.checklist || [],
                timeline: e.timeline || [],
                costs: e.costs || [],
                amount: e.amount
            })));
        }

        // 5. Fetch Transactions
        const { data: transData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        if (transData) {
            setTransactions(transData.map((t: any) => ({
                id: t.id,
                description: t.description,
                clientName: t.client_name,
                amount: t.amount,
                date: t.date,
                status: t.status,
                proposalId: t.proposal_id
            })));
        }
        
        // 6. Fetch Services & Suppliers
        const { data: servData } = await supabase.from('services').select('*');
        if (servData) setServices(servData);

        const { data: supData } = await supabase.from('suppliers').select('*');
        if (supData) setSuppliers(supData);

        calculateKPIs(proposalsData || [], transData || [], profileData?.monthly_goal || 10000);

    } catch (error) {
        console.error("Error fetching Supabase data:", error);
    }
  };

  const calculateKPIs = (props: any[], trans: any[], goal: number) => {
      const totalPending = trans.filter((t: any) => t.status === 'pending').reduce((acc: number, t: any) => acc + t.amount, 0);
      const totalPaid = trans.filter((t: any) => t.status === 'paid').reduce((acc: number, t: any) => acc + t.amount, 0);
      
      setKpis([
        { label: 'A Receber', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending), change: '0%', isPositive: true },
        { label: 'Recebido (Mês)', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid), change: '0%', isPositive: true },
        { label: 'Propostas Ativas', value: props.length.toString(), change: '0', isPositive: true },
        { label: 'Meta Mensal', value: `${Math.round((totalPaid/(goal || 1))*100)}%`, change: 'vs Meta', isPositive: true },
      ]);

      setHistoricalRevenue([
          { month: 'Set', revenue: totalPaid * 0.8 },
          { month: 'Out', revenue: totalPaid }
      ]);
  };

  // --- SAVE LOCAL HELPER ---
  const saveLocal = (key: string, newData: any) => {
      if (!userId) return;
      const localKey = `me_data_${userId}`;
      const current = JSON.parse(localStorage.getItem(localKey) || '{}');
      const updated = { ...current, [key]: newData };
      localStorage.setItem(localKey, JSON.stringify(updated));
  };

  useEffect(() => {
    if (userId) {
        fetchData();
        
        if (isSupabaseConfigured) {
            const channel = supabase.channel('schema-db-changes')
                .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
                .subscribe();
            return () => { supabase.removeChannel(channel); }
        }
    }
  }, [userId]);

  // --- ACTIONS (HYBRID) ---

  // 2. CLIENTS (Hoist this up because proposals need it)
  const addNewClient = async (client: any) => {
      if (!isSupabaseConfigured) {
          const newCl = { ...client, id: Date.now().toString(), proposals: 0, events: 0 };
          const newClients = [newCl, ...clients];
          setClients(newClients);
          saveLocal('clients', newClients);
          return;
      }
      await supabase.from('clients').insert({
          user_id: userId,
          name: client.name,
          phone: client.phone,
          email: client.email
      });
      fetchData();
  };

  // 1. PROPOSALS
  const addProposal = async (prop: Proposal) => {
      // Check if client exists, if not create them
      const existingClient = clients.find(c => c.name.toLowerCase() === prop.clientName.toLowerCase());
      if (!existingClient && prop.clientName) {
          await addNewClient({
              name: prop.clientName,
              phone: '', // No phone data from proposal modal yet
              email: ''
          });
      }

      if (!isSupabaseConfigured) {
          const newProps = [prop, ...proposals];
          setProposals(newProps);
          saveLocal('proposals', newProps);
          return;
      }
      const { data } = await supabase.from('proposals').insert({
          user_id: userId,
          client_name: prop.clientName,
          event_name: prop.eventName,
          amount: prop.amount,
          status: prop.status,
          date: prop.date
      }).select().single();
      if (data) fetchData();
  };

  const updateProposal = async (prop: Proposal) => {
      // Optimistic Update: Update UI immediately
      const newProps = proposals.map(p => p.id === prop.id ? prop : p);
      setProposals(newProps);

      if (!isSupabaseConfigured) {
          saveLocal('proposals', newProps);
          return;
      }
      await supabase.from('proposals').update({
          status: prop.status,
          amount: prop.amount
      }).eq('id', prop.id);
      // fetchData(); // Optional: We rely on optimistic update + subscription
  };

  // 3. PROFILE
  const updateProfile = async (profile: BusinessProfile) => {
      setBusinessProfile(profile); // Optimistic
      
      if (!isSupabaseConfigured) {
          saveLocal('profile', profile);
          return;
      }
      await supabase.from('profiles').update({
          name: profile.name,
          category: profile.category,
          phone: profile.phone,
          email: profile.email,
          pix_key: profile.pixKey,
          pix_key_type: profile.pixKeyType,
          theme_color: profile.themeColor,
          contract_terms: profile.contractTerms,
          logo_url: profile.logoUrl,
          monthly_goal: profile.monthlyGoal,
          bio: profile.bio,
          instagram: profile.instagram,
          website: profile.website,
          message_templates: profile.messageTemplates
      }).eq('id', userId);
  };

  // 4. TRANSACTIONS
  const updateTransStatus = async (id: string, status: string) => {
      if (!isSupabaseConfigured) {
          const newTrans = transactions.map(t => t.id === id ? { ...t, status: status as any } : t);
          setTransactions(newTrans);
          saveLocal('transactions', newTrans);
          return;
      }
      await supabase.from('transactions').update({ status }).eq('id', id);
      fetchData();
  };

  // 5. SUPPLIERS
  const addNewSupplier = async (sup: any) => {
       if (!isSupabaseConfigured) {
           const newSup = { ...sup, id: Date.now().toString() };
           const newSups = [newSup, ...suppliers];
           setSuppliers(newSups);
           saveLocal('suppliers', newSups);
           return;
       }
       await supabase.from('suppliers').insert({
          user_id: userId,
          name: sup.name,
          category: sup.category,
          phone: sup.phone
       });
       fetchData();
  };

  const deleteSup = async (id: string) => {
      if (!isSupabaseConfigured) {
          const newSups = suppliers.filter(s => s.id !== id);
          setSuppliers(newSups);
          saveLocal('suppliers', newSups);
          return;
      }
      await supabase.from('suppliers').delete().eq('id', id);
      fetchData();
  };

  // 6. EVENTS
  const toggleTask = async (eventId: string, taskId: string) => {
     const event = events.find(e => e.id === eventId);
     if (!event || !event.checklist) return;
     
     const updatedChecklist = event.checklist.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
     setEvents(prev => prev.map(e => e.id === eventId ? { ...e, checklist: updatedChecklist } : e));

     if (!isSupabaseConfigured) {
         const newEvents = events.map(e => e.id === eventId ? { ...e, checklist: updatedChecklist } : e);
         saveLocal('events', newEvents);
         return;
     }

     await supabase.from('events').update({ checklist: updatedChecklist }).eq('id', eventId);
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
    setProposals: (val: any) => {
        if (typeof val === 'function') {
             const dummyPrev: Proposal[] = [];
             const res = val(dummyPrev);
             if (res.length > 0) addProposal(res[0]);
        }
    }, 
    updateProposal, // EXPORTED NOW
    setClients: (val: any) => {
         if (typeof val === 'function') {
             const res = val([]);
             if (res.length > 0) addNewClient(res[0]);
         }
    },
    setBusinessProfile: updateProfile,
    updateTransactionStatus: updateTransStatus,
    addService: async (s: any) => { 
        if(!isSupabaseConfigured){ 
            const newS = [...services, {...s, id: Date.now().toString()}]; 
            setServices(newS); saveLocal('services', newS); return; 
        }
        await supabase.from('services').insert({...s, user_id: userId}); fetchData(); 
    },
    deleteService: async (id: string) => { 
        if(!isSupabaseConfigured){ 
            const newS = services.filter(s => s.id !== id); 
            setServices(newS); saveLocal('services', newS); return; 
        }
        await supabase.from('services').delete().eq('id', id); fetchData(); 
    },
    addSupplier: addNewSupplier,
    deleteSupplier: deleteSup,
    markNotificationRead: (id: string) => {},
    toggleEventTask: toggleTask,
    updateMonthlyGoal: (amount: number) => updateProfile({ ...businessProfile, monthlyGoal: amount }),
    addEventCost: async (eventId: string, cost: any) => {
        const event = events.find(e => e.id === eventId);
        const newCosts = [...(event?.costs || []), { ...cost, id: Date.now().toString() }];
        
        if(!isSupabaseConfigured) {
            const newEvents = events.map(e => e.id === eventId ? { ...e, costs: newCosts } : e);
            setEvents(newEvents); saveLocal('events', newEvents); return;
        }
        await supabase.from('events').update({ costs: newCosts }).eq('id', eventId);
        fetchData();
    },
    deleteEventCost: async (eventId: string, costId: string) => {
         const event = events.find(e => e.id === eventId);
         const newCosts = event?.costs?.filter(c => c.id !== costId) || [];
         
         if(!isSupabaseConfigured) {
            const newEvents = events.map(e => e.id === eventId ? { ...e, costs: newCosts } : e);
            setEvents(newEvents); saveLocal('events', newEvents); return;
         }
         await supabase.from('events').update({ costs: newCosts }).eq('id', eventId);
         fetchData();
    },
    addTimelineItem: async (eventId: string, item: any) => {
        const event = events.find(e => e.id === eventId);
        const newTimeline = [...(event?.timeline || []), { ...item, id: Date.now().toString() }];
        
        if(!isSupabaseConfigured) {
            const newEvents = events.map(e => e.id === eventId ? { ...e, timeline: newTimeline } : e);
            setEvents(newEvents); saveLocal('events', newEvents); return;
        }
        await supabase.from('events').update({ timeline: newTimeline }).eq('id', eventId);
        fetchData();
    },
    deleteTimelineItem: async (eventId: string, itemId: string) => {
         const event = events.find(e => e.id === eventId);
         const newTimeline = event?.timeline?.filter(t => t.id !== itemId) || [];
         
         if(!isSupabaseConfigured) {
            const newEvents = events.map(e => e.id === eventId ? { ...e, timeline: newTimeline } : e);
            setEvents(newEvents); saveLocal('events', newEvents); return;
         }
         await supabase.from('events').update({ timeline: newTimeline }).eq('id', eventId);
         fetchData();
    }
  };
};
