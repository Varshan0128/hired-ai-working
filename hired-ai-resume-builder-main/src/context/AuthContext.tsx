
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

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

      if (error && error.code !== 'PGRST116') {
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
    const displayName = userProfile?.display_name || 
                       supabaseUser.user_metadata?.full_name || 
                       supabaseUser.user_metadata?.name || 
                       supabaseUser.email?.split('@')[0] || 
                       'User';

    return {
      id: supabaseUser.id,
      name: displayName,
      email: supabaseUser.email || '',
      createdAt: supabaseUser.created_at,
      avatar: userProfile?.avatar_url || supabaseUser.user_metadata?.avatar_url
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

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signup = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
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
