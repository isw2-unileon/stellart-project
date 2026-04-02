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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const submitContact = async ({ name, title, message }) => {
    const response = await fetch(`${BACKEND_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, title, message }),
    });
    if (!response.ok) throw new Error('Failed to submit contact form');
};

export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileName = `${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from('artworks')        
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error("Could not generate public URL");
  }

  return urlData.publicUrl;
};

export const getMasterSkills = async() => {
    const response = await fetch(`${BACKEND_URL}/profiles/master-skills`, {
        method: 'GET',
        headers:  { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to get master skills');
    return response.json();
}


export const getProfileSkills = async (userId) => {
    const response = await fetch(`${BACKEND_URL}/profiles/${userId}/skills`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error('Failed to fetch user skills');
    return response.json();
};

export const updateProfileAndSkills = async (userId, profileData, skillsData) => {
    const payload = {
        profile: {
            id: userId,
            full_name: profileData.fullName,
            biography: profileData.biography,
            avatar_url: profileData.avatarUrl
        },
        skills: skillsData
    };

    const response = await fetch(`${BACKEND_URL}/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error('Failed to update profile and skills');
    
    return true; 
};

export const searchArtworks = async (query) => {
    try {
        const response = await fetch(`http://localhost:3000/api/artworks/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching artworks:', error);
        throw error;
    }
};
