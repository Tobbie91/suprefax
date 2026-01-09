import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Computed
  isAuthenticated: boolean;
  role: UserRole | null;
  isAdmin: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata: { full_name: string; phone?: string }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;

  // Profile methods
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;

  // Initialization
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isInitialized: false,

      // Computed getters (accessed as properties)
      get isAuthenticated() {
        return !!get().user;
      },

      get role() {
        return get().profile?.role || null;
      },

      get isAdmin() {
        const role = get().profile?.role;
        return role === 'admin' || role === 'super_admin';
      },

      // Setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      // Auth methods
      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({ user: data.user, session: data.session });
          await get().fetchProfile();

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, metadata) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          });

          if (error) throw error;

          // User will need to confirm email before we set session
          if (data.user && data.session) {
            set({ user: data.user, session: data.session });
            await get().fetchProfile();
          }

          return { error: null };
        } catch (error) {
          return { error: error as Error };
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({ user: null, session: null, profile: null });
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      updatePassword: async (password) => {
        try {
          const { error } = await supabase.auth.updateUser({ password });

          if (error) throw error;
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Profile methods
      fetchProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          set({ profile: data });
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      },

      updateProfile: async (updates) => {
        const { user, profile } = get();
        if (!user) return { error: new Error('Not authenticated') };

        try {
          // Use type assertion to bypass strict typing since Database types may not be generated
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

          if (error) throw error;
          set({ profile: data ?? profile });
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },

      // Initialization
      initialize: async () => {
        try {
          // Get initial session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            set({ user: session.user, session });
            await get().fetchProfile();
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            set({ user: session?.user || null, session });

            if (session?.user) {
              await get().fetchProfile();
            } else {
              set({ profile: null });
            }
          });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Initialize auth on app start
useAuthStore.getState().initialize();
