// AuthContext.tsx (replace the whole file with this)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Robust backend API configuration: uses env var if present, otherwise relative path
const BACKEND_BASE = (typeof process !== "undefined" && process.env?.REACT_APP_BACKEND_URL)
  ? process.env.REACT_APP_BACKEND_URL.replace(/\/$/, "")
  : ""; // empty -> use relative path

// Robust backend call function
async function createUserViaBackend({ email, password }: { email: string; password: string }) {
  // Build URL: if BACKEND_BASE is empty, this becomes /api/admin/create-user (same origin)
  const url = `${BACKEND_BASE}/api/admin/create-user`.replace(/(^\/+)?/, "/");
  console.log("[Signup] attempting backend create at:", url);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch (err) {
    // Network-level error (e.g. ERR_CONNECTION_REFUSED)
    console.error("[Signup] network error calling backend create-user:", err);
    throw new Error("BACKEND_UNREACHABLE");
  }

  // parse JSON safely
  let body = null;
  try {
    body = await res.json();
  } catch (parseErr) {
    console.warn("[Signup] could not parse JSON response:", parseErr);
  }

  if (!res.ok) {
    const msg = body?.message || body?.detail || `Backend Error: ${res.status}`;
    const err = new Error(msg);
    (err as any).serverBody = body;
    (err as any).status = res.status;
    throw err;
  }

  return body; // expected shape: { ok: true, user: {...} }
}

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
  signup: (email: string, password: string) => Promise<{ error: any; requiresEmailConfirmation?: boolean }>;
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
  // Falls back to regular signup if backend is unavailable
  // -------------------------
  const signup = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { error: new Error("Please enter email and password.") };
      }

      const payload = { email, password };
      console.log('[Signup] payload:', payload);

      // Try backend first
      try {
        const backendResp = await createUserViaBackend(payload);
        console.log('[Signup] backendResp:', backendResp);
        
        // Now sign in the user automatically since email is already confirmed
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Auto sign-in error:', signInError);
          return { error: new Error('Account created but automatic sign-in failed. Please try logging in.') };
        }

        return { error: null };
      } catch (backendErr: any) {
        console.warn('[Signup] backend error:', backendErr?.message || backendErr);
        // If backend unreachable explicitly, try fallback signup
        if (backendErr.message === "BACKEND_UNREACHABLE") {
          console.log('[Signup] Backend unreachable, trying fallback signup...');
        } else {
          // backend returned 4xx/5xx — present server message but do not reset step
          console.log('[Signup] Backend server error, trying fallback signup...');
        }
        // Continue to fallback to client signup
      }

      // fallback: use existing client-side signup (e.g., supabase.auth.signUp)
      try {
        const { data, error: supError } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: {
            emailRedirectTo: window.location.origin + '/auth',
          },
        });
        console.log('[Signup] fallback supabase response:', data, supError);
        if (supError) {
          return { error: new Error(supError.message || 'Signup fallback failed.') };
        }
        return { error: null, requiresEmailConfirmation: true };
      } catch (err) {
        console.error('[Signup] fallback exception:', err);
        return { error: new Error('An unexpected error occurred during signup.') };
      }
    } catch (err) {
      console.error('[Signup] unexpected error:', err);
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
