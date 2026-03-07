import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getLoggedUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
};

export const registerUser = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) throw error;
    return data;
};

export const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

