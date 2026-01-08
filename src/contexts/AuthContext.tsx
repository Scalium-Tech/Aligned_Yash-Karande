import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { clearDashboardData } from '@/lib/clearDashboardData';
import { migrateUserData } from '@/lib/dataMigration';
interface Profile {
  id: string;
  full_name: string;
  onboarding_completed: boolean;
  is_pro?: boolean;
  plan_type?: string;
  razorpay_payment_id?: string;
  payment_date?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, paymentInfo?: { paymentId: string; planType: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; onboardingCompleted?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Helper function to create profile if it doesn't exist
    const ensureProfile = async (userId: string, userMetadata?: any) => {
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return; // Profile already exists
      }

      // Check for pending profile data from signup
      const pendingProfileStr = localStorage.getItem('pending_profile');
      if (pendingProfileStr) {
        try {
          const pendingProfile = JSON.parse(pendingProfileStr);
          if (pendingProfile.id === userId) {
            // Create profile from pending data
            await supabase.from('profiles').insert(pendingProfile);
            localStorage.removeItem('pending_profile');
            return;
          }
        } catch (e) {
          console.error('Error parsing pending profile:', e);
        }
      }

      // Fallback: create profile from user metadata
      if (userMetadata?.full_name) {
        const profileData = {
          id: userId,
          full_name: userMetadata.full_name,
          onboarding_completed: false,
          ...(userMetadata.is_pro && {
            is_pro: true,
            plan_type: userMetadata.plan_type,
            razorpay_payment_id: userMetadata.razorpay_payment_id,
            payment_date: new Date().toISOString(),
          })
        };
        await supabase.from('profiles').insert(profileData);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          // For SIGNED_IN event (after email confirmation), ensure profile exists
          if (event === 'SIGNED_IN') {
            await ensureProfile(session.user.id, session.user.user_metadata);
          }
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Run data migration for existing users on session restore
        migrateUserData(session.user.id);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, paymentInfo?: { paymentId: string; planType: string }) => {
    // Clear any existing dashboard data to ensure new users start fresh
    clearDashboardData();

    const redirectUrl = `${window.location.origin}/onboarding/step-1`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          ...(paymentInfo && {
            is_pro: true,
            plan_type: paymentInfo.planType,
            razorpay_payment_id: paymentInfo.paymentId,
          })
        }
      }
    });

    if (error) {
      return { error };
    }

    // Store pending profile data in localStorage for creation after email confirmation
    // This is needed because with email confirmation enabled, user isn't authenticated yet
    if (data.user) {
      const pendingProfile = {
        id: data.user.id,
        full_name: fullName,
        onboarding_completed: false,
        ...(paymentInfo && {
          is_pro: true,
          plan_type: paymentInfo.planType,
          razorpay_payment_id: paymentInfo.paymentId,
          payment_date: new Date().toISOString(),
        })
      };
      localStorage.setItem('pending_profile', JSON.stringify(pendingProfile));
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error };
    }

    // Fetch profile and migrate data for existing users
    if (data.user) {
      // Run data migration for existing users
      migrateUserData(data.user.id);

      const profileData = await fetchProfile(data.user.id);
      return {
        error: null,
        onboardingCompleted: profileData?.onboarding_completed ?? false
      };
    }

    return { error: null, onboardingCompleted: false };
  };

  const signOut = async () => {
    // NOTE: We no longer clear dashboard data on sign out.
    // This preserves user data between sessions so existing users
    // see their data immediately when they log back in.
    // Data is only cleared on NEW user sign up.
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore errors - user may already be logged out or network issue
      console.warn('Sign out error (ignored):', error);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPasswordForEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      resetPasswordForEmail,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
