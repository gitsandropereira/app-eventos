
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

// --- Helper to map Supabase User to App User ---
const mapUser = (sbUser: any): User => ({
  id: sbUser.id,
  name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Usuário',
  email: sbUser.email || '',
});

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<User | { error: string }> => {
    // --- FALLBACK: LOCAL STORAGE MODE ---
    if (!isSupabaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula delay
        const users = JSON.parse(localStorage.getItem('me_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('me_session', user.id);
            return { id: user.id, name: user.name, email: user.email };
        }
        return { error: 'Credenciais inválidas (Modo Demo)' };
    }

    // --- REAL: SUPABASE MODE ---
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
            if (error.message === 'Invalid login credentials') return { error: 'Email ou senha incorretos.' };
            return { error: error.message };
        }

        if (data.user) {
          return mapUser(data.user);
        }
        return { error: 'Erro desconhecido ao logar.' };
    } catch (err) {
        console.error("Auth Network Error:", err);
        return { error: 'Erro de conexão.' };
    }
  },

  // Cadastro
  register: async (name: string, email: string, password: string): Promise<User | { error: string }> => {
    // --- FALLBACK: LOCAL STORAGE MODE ---
    if (!isSupabaseConfigured) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const users = JSON.parse(localStorage.getItem('me_users') || '[]');
        
        if (users.find((u: any) => u.email === email)) {
            return { error: 'Email já cadastrado (Modo Demo)' };
        }

        const newUser = { id: crypto.randomUUID(), name, email, password };
        users.push(newUser);
        localStorage.setItem('me_users', JSON.stringify(users));
        localStorage.setItem('me_session', newUser.id);
        
        // Seed initial data for demo
        seedLocalData(newUser.id, name, email);
        
        return { id: newUser.id, name: newUser.name, email: newUser.email };
    }

    // --- REAL: SUPABASE MODE ---
    try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) return { error: error.message };
        if (data.user) return mapUser(data.user);
        
        return { error: 'Erro ao criar conta.' };
    } catch (err) {
        console.error("Auth Network Error:", err);
        return { error: 'Erro de conexão.' };
    }
  },

  logout: async () => {
    if (!isSupabaseConfigured) {
        localStorage.removeItem('me_session');
        return;
    }
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.error("Logout error", e);
    }
  },

  // Verifica sessão atual
  getCurrentUser: async (): Promise<User | null> => {
    // --- FALLBACK ---
    if (!isSupabaseConfigured) {
        const userId = localStorage.getItem('me_session');
        if (userId) {
            const users = JSON.parse(localStorage.getItem('me_users') || '[]');
            const user = users.find((u: any) => u.id === userId);
            if (user) return { id: user.id, name: user.name, email: user.email };
        }
        return null;
    }

    // --- REAL ---
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return mapUser(session.user);
    } catch (e) {
        console.warn("Session check failed:", e);
    }
    return null;
  }
};

// Helper to seed local data in Demo Mode
const seedLocalData = (userId: string, name: string, email: string) => {
    const initialData = {
        profile: {
            name: name,
            category: 'Profissional de Eventos',
            email: email,
            themeColor: '#4F46E5',
            monthlyGoal: 10000
        },
        proposals: [
            { id: '1', clientName: 'Alice Santos', eventName: 'Casamento Civil', amount: 2500, status: 'Enviada', date: new Date().toISOString() }
        ],
        events: [],
        clients: [],
        transactions: []
    };
    localStorage.setItem(`me_data_${userId}`, JSON.stringify(initialData));
};
