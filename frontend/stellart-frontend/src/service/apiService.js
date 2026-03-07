import { createClient } from '@supabase/supabase-js';

// Se instancia el cliente solo una vez.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
console.log("Url de supabase: ", supabaseUrl);
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getLoggedUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
};