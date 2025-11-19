
import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Substitua estas strings pelos valores do seu Painel Supabase
// (Settings -> API -> Project URL & anon public key)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_ANON_PUBLICA';

export const supabase = createClient(supabaseUrl, supabaseKey);
