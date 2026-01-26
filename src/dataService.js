import { supabase } from './supabaseClient';

export const dataService = {
    // Key-based local storage (for speed or when offline)
    getLocal: (key, email) => {
        const saved = localStorage.getItem(`${key}_${email}`);
        if (!saved) return [];
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error(`Error parsing localStorage key ${key}_${email}:`, e);
            return [];
        }
    },

    setLocal: (key, email, data) => {
        try {
            console.log(`Setting local storage for ${key}_${email}`, data);
            localStorage.setItem(`${key}_${email}`, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving to localStorage ${key}_${email}:`, e);
        }
    },

    // Supabase - Cloud Storage
    saveToCloud: async (userId, patients, photos) => {
        if (!supabase) {
            console.warn('Supabase not configured. Cloud save skipped.');
            return;
        }

        try {
            // This is a simplified example. In a real app, you'd have proper tables.
            // For now, we simulate storing the whole state for that user.
            const { error } = await supabase
                .from('user_data')
                .upsert({
                    user_id: userId,
                    patients: patients,
                    photos: photos,
                    updated_at: new Date()
                }, { onConflict: 'user_id' });

            if (error) throw error;
            console.log('Successfully saved data to Supabase for user:', userId);
        } catch (err) {
            console.error('Error saving to Supabase:', err.message);
        }
    },

    loadFromCloud: async (userId) => {
        if (!supabase) {
            console.warn('Supabase not configured. Cloud load skipped.');
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('patients, photos')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

            if (data) {
                console.log('Successfully loaded data from Supabase for user:', userId);
            } else {
                console.log('No existing cloud data found for user:', userId);
            }

            return data;
        } catch (err) {
            console.error('Error loading from Supabase:', err.message);
            return null;
        }
    }
};
