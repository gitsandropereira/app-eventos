
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Em produção (Vercel/Netlify), use Variáveis de Ambiente.
// Localmente, você pode editar as strings abaixo.

// Função helper para acessar variáveis de ambiente de forma segura sem crashar
const getEnvVar = (key: string, fallback: string) => {
    try {
        // Usa optional chaining para evitar erro se env for undefined
        return (import.meta as any)?.env?.[key] || fallback;
    } catch (e) {
        return fallback;
    }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://SEU_PROJETO.supabase.co');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'SUA_CHAVE_ANON_PUBLICA');

// Flag para verificar se o Supabase está configurado corretamente
export const isSupabaseConfigured = !supabaseUrl.includes('SEU_PROJETO') && !supabaseKey.includes('SUA_CHAVE');

if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase não configurado. O app rodará em MODO DEMO (Offline) usando LocalStorage.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
