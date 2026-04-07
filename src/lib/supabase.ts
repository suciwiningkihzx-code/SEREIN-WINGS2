import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || supabaseUrl.includes('placeholder');

if (isPlaceholder) {
  console.warn('Supabase URL or Anon Key is missing or invalid. Please check your environment variables.');
}

const supabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: !isPlaceholder,
      persistSession: !isPlaceholder,
      detectSessionInUrl: !isPlaceholder,
      storageKey: 'serein-wings-auth-token',
      flowType: 'pkce'
    }
  }
);

export const isSupabaseConfigured = !isPlaceholder;

// Helper to wrap supabase calls and prevent "Failed to fetch" on placeholders
export const supabase = new Proxy(supabaseClient, {
  get(target, prop: string) {
    const value = (target as any)[prop];
    if (['from', 'auth', 'storage'].includes(prop) && !isSupabaseConfigured) {
      console.warn(`Supabase is not configured. Skipping ${prop} operation.`);
      // Return a mock that handles common patterns
      return () => ({
        select: () => ({ 
          eq: () => ({ 
            single: () => Promise.resolve({ data: null, error: null }), 
            order: () => Promise.resolve({ data: [], error: null }) 
          }), 
          order: () => Promise.resolve({ data: [], error: null }) 
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
        signUp: () => Promise.reject(new Error('Supabase not configured')),
        signOut: () => Promise.resolve({ error: null }),
      });
    }
    return typeof value === 'function' ? value.bind(target) : value;
  }
});
