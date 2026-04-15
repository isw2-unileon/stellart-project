import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; 
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getLoggedUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
};

export const registerUser = async (email, password, fullName,addressObj, bankObj) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                address: addressObj,
                bank: bankObj,
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
    
    if (data?.user) {
        const fullName = data.user.user_metadata?.full_name;
        if (fullName) {
            try {
                // Only create profile if it doesn't exist yet.
                // Avoids overwriting avatar_url/biography with null on every login.
                const existing = await getProfile(data.user.id);
                if (!existing) {
                    await fetch(`${BACKEND_URL}/profiles/${data.user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            profile: {
                                id: data.user.id,
                                full_name: fullName,
                                email: data.user.email || "",
                                avatar_url: data.user.user_metadata?.avatar_url || null
                            },
                            skills: []
                        }),
                    });
                }
            } catch (e) {
                console.error("Profile sync error:", e);
            }
        }
    }
    
    return data;
};

export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const submitContact = async ({ name, email, subject, message }) => {
    const response = await fetch(`${BACKEND_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
    });
    if (!response.ok) throw new Error('Failed to submit contact form');
};

export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

  const { error } = await supabase.storage
    .from('artworks')        
    .upload(fileName, file);

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error("Could not generate public URL");
  }

  return urlData.publicUrl;
};

export const uploadAvatar = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileName = `${Date.now()}_${file.name}`;

  const { error } = await supabase.storage
    .from('profile_avatars')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('profile_avatars')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error("Could not generate public URL");
  }

  return urlData.publicUrl;
};

export const getProfile = async (userId) => {
  const response = await fetch(`${BACKEND_URL}/profiles/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) return null;
  return response.json();
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
            email: profileData.email || "",
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

export const getWishlist = async (userId) => {
    const response = await fetch(`${BACKEND_URL}/profiles/${userId}/wishlist`);
    if (!response.ok) return [];
    return response.json();
};

export const addToWishlist = async (userId, artworkId) => {
    const response = await fetch(`${BACKEND_URL}/profiles/${userId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork_id: artworkId }),
    });
    if (!response.ok) {
        const text = await response.text();
        console.error('addToWishlist error:', text);
        throw new Error(text);
    }
};

export const removeFromWishlist = async (userId, artworkId) => {
    const response = await fetch(`${BACKEND_URL}/profiles/${userId}/wishlist/${artworkId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from wishlist');
};

export const searchArtworks = async (query) => {
    try {
        
        const response = await fetch(`${BACKEND_URL}/artworks/search?q=${encodeURIComponent(query)}`);
        
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

// Commission APIs
export const createCommission = async (commissionData) => {
    const response = await fetch(`${BACKEND_URL}/commissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commissionData),
    });
    if (!response.ok) throw new Error('Failed to create commission');
    return response.json();
};

export const getCommission = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get commission');
    return response.json();
};

export const getBuyerCommissions = async (buyerId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/buyer?buyer_id=${buyerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get commissions');
    return response.json();
};

export const getArtistCommissions = async (artistId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/artist?artist_id=${artistId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get commissions');
    return response.json();
};

export const acceptCommission = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}/accept`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to accept commission');
};

export const denyCommission = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}/deny`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to deny commission');
};

export const startCommission = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}/start`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to start commission');
};

export const submitForReview = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}/submit-review`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to submit for review');
};

export const approveWork = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}/approve`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve work');
};

export const cancelCommission = async (id) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${id}/cancel`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cancel commission');
};

// Payments
export const createAdvancePayment = async (paymentData) => {
    const response = await fetch(`${BACKEND_URL}/commissions/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to create payment');
    return response.json();
};

export const getAdvancePayment = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/payment`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    return response.json();
};

export const markPaymentPaid = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/payment/mark-paid`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark payment as paid');
};

export const releasePayment = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/payment/release`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to release payment');
};

export const createRemainingPayment = async (paymentData) => {
    const response = await fetch(`${BACKEND_URL}/commissions/remaining-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to create remaining payment');
    return response.json();
};

export const getRemainingPayment = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/remaining-payment`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    return response.json();
};

export const markRemainingPaymentPaid = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/remaining-payment/mark-paid`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark remaining payment as paid');
};

// Work Uploads
export const uploadWork = async (uploadData) => {
    const response = await fetch(`${BACKEND_URL}/commissions/work-uploads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData),
    });
    if (!response.ok) throw new Error('Failed to upload work');
    return response.json();
};

export const getWorkUploads = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/work-uploads`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get work uploads');
    return response.json();
};

// Revisions
export const requestRevision = async (revisionData) => {
    const response = await fetch(`${BACKEND_URL}/commissions/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revisionData),
    });
    if (!response.ok) throw new Error('Failed to request revision');
    return response.json();
};

export const getRevisions = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/revisions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get revisions');
    return response.json();
};

export const approveRevision = async (revisionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/revisions/${revisionId}/approve`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve revision');
};

export const rejectRevision = async (revisionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/revisions/${revisionId}/reject`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reject revision');
};

export const respondToRevision = async (revisionId, responseNotes) => {
    const response = await fetch(`${BACKEND_URL}/commissions/revisions/${revisionId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revision_id: revisionId, response_notes: responseNotes }),
    });
    if (!response.ok) throw new Error('Failed to respond to revision');
};

// Refunds
export const createRefund = async (refundData) => {
    const response = await fetch(`${BACKEND_URL}/commissions/refunds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundData),
    });
    if (!response.ok) throw new Error('Failed to create refund');
    return response.json();
};

export const getRefund = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/refund`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    return response.json();
};

export const processRefund = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/refund/process`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to process refund');
};

// Chat Messages
export const sendMessage = async (messageData) => {
    const response = await fetch(`${BACKEND_URL}/commissions/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
};

export const getMessages = async (commissionId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/messages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get messages');
    return response.json();
};

export const markMessagesRead = async (commissionId, userId) => {
    const response = await fetch(`${BACKEND_URL}/commissions/${commissionId}/messages/read?user_id=${userId}`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark messages as read');
};

// Profile with open commissions
export const getArtistsWithOpenCommissions = async () => {
    const response = await fetch(`${BACKEND_URL}/profiles/open-commissions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch artists');
    return response.json();
};

export const updateOpenCommissions = async (userId, openCommissions) => {
    const response = await fetch(`${BACKEND_URL}/profiles/${userId}/open-commissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open_commissions: openCommissions }),
    });
    
    if (!response.ok) throw new Error('Failed to update open commissions');
    return true;
};

export const reportArtwork = async (artworkId, reporterId, reason) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artworks/${artworkId}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reporterId, reason })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send report');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error reporting artwork:", error);
        throw error;
    }
};

export const likeArtwork = async (artworkId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artworks/${artworkId}/like`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to like artwork');
        return await response.json();
    } catch (error) {
        console.error("Error liking artwork:", error);
        throw error;
    }
};

export const getTrendingArtworks = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artworks/trending`);
        if (!response.ok) throw new Error('Failed to fetch trending');
        return await response.json();
    } catch (error) {
        console.error("Error fetching trending artworks:", error);
        return [];
    }
};

export const unlikeArtwork = async (artworkId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/artworks/${artworkId}/unlike`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to unlike artwork');
        return true;
    } catch (error) {
        console.error("Error unliking artwork:", error);
        throw error;
    }
};

export const getArtworksByArtist = async (artistId) => {
    try {
        const response = await fetch(`${BACKEND_URL}/artworks/artist/${artistId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch artist artworks');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching artist artworks:", error);
        return [];
    }
};

export const deleteArtworkImage = async (imageUrl) => {
    
    if (!imageUrl) return;

    const fileName = imageUrl.split('/').pop();

    const { data, error } = await supabase.storage
        .from('artworks') 
        .remove([fileName]);

    if (error) {
        throw error;
    }
    return data;
};

export const deleteArtwork = async (artworkId) => {
    const response = await fetch(`${BACKEND_URL}/artworks/${artworkId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete artwork');
};