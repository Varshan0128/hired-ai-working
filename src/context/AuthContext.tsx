// AuthContext.tsx (replace the whole file with this)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Backend API configuration
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' // Update this for production
  : 'http://127.0.0.1:8000';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { display_name: string }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && (error as any).code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const convertToUser = (supabaseUser: SupabaseUser, userProfile?: Profile): User => {
    const displayName =
      (userProfile && (userProfile.display_name || undefined)) ||
      (supabaseUser.user_metadata && (supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name)) ||
      (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'User');

    return {
      id: supabaseUser.id,
      name: typeof displayName === 'string' ? displayName : 'User',
      email: supabaseUser.email || '',
      createdAt: (supabaseUser as any).created_at || '',
      avatar: userProfile?.avatar_url || (supabaseUser.user_metadata as any)?.avatar_url,
    };
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session?.user) {
          setIsAuthenticated(true);

          // Defer profile fetching to avoid potential conflicts
          setTimeout(async () => {
            await fetchProfile(session.user.id);
          }, 0);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        setIsAuthenticated(true);

        // Defer profile fetching to avoid potential conflicts
        setTimeout(async () => {
          await fetchProfile(session.user.id);
        }, 0);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update user when session or profile changes
  useEffect(() => {
    if (session?.user) {
      const updatedUser = convertToUser(session.user, profile || undefined);
      setUser(updatedUser);
    }
  }, [session, profile]);

  // -------------------------
  // Admin signup: create user with confirmed email via backend
  // -------------------------
  const signup = async (email: string, password: string) => {
    try {
      // Call backend endpoint to create user with confirmed email
      const response = await fetch(`${BACKEND_URL}/api/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Signup error:', data);
        return { error: new Error(data.detail || 'Signup failed') };
      }

      // User created successfully with confirmed email
      console.log('Signup result data:', data);
      
      // Now sign in the user automatically since email is already confirmed
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        // User was created but we couldn't sign them in automatically
        return { error: new Error('Account created but automatic sign-in failed. Please try logging in.') };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return { error: err };
    }
  };

  // -------------------------
  // Login: validate credentials and session
  // (Email confirmation check remains for users created via old flow)
  // -------------------------
  const login = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // On v2 signInWithPassword returns { data: { user, session }, error }
      const { data, error } = result as any;

      if (error) {
        console.error('Login error:', error);
        return { error };
      }

      const signedUser = data?.user;
      const signedSession = data?.session;

      // If no session, login failed (likely wrong credentials)
      if (!signedSession) {
        return { error: new Error('Unable to sign in. Check email and password.') };
      }

      // Enforce email confirmation: check common possible fields
      const confirmedAt = (signedUser && (signedUser.confirmed_at || signedUser.email_confirmed_at || signedUser.confirmation_sent_at && null)) ?? null;
      // Note: some Supabase setups don't expose a "confirmed" timestamp in the user object;
      // we check both common fields above. If your instance differs, update this check accordingly.

      // If user is not confirmed (no confirmed_at / email_confirmed_at), sign them out and return error
      if (!signedUser || (!signedUser.confirmed_at && !signedUser.email_confirmed_at)) {
        // Force sign out - do not keep unverified session
        await supabase.auth.signOut();
        return { error: new Error('Please verify your email before logging in. Check your inbox for the confirmation link.') };
      }

      // If everything is okay, session will be handled by the auth state listener above
      return { error: null };
    } catch (err) {
      console.error('Unexpected login error:', err);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = 'https://hired-ai-working.vercel.app/';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });

      if (error) {
        console.error('OAuth signin error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected OAuth error:', err);
      return { error: err };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: { display_name: string }) => {
    if (!session?.user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', session.user.id);

    if (!error) {
      // Refresh profile data
      await fetchProfile(session.user.id);
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isAuthenticated,
      isLoading,
      login,
      signup,
      signInWithGoogle,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
