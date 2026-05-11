import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  handleOAuthCallback: (params: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Auto-refresh session when app comes to foreground
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email: string, password: string, username: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: username } },
    });
    if (error) throw error;
  }

  async function signInWithOAuth(provider: 'google' | 'github') {
    const redirectUri = makeRedirectUri({ scheme: 'glide', path: 'auth/callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUri },
    });
    if (error) throw error;
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    }
  }

  async function handleOAuthCallback(params: Record<string, any>) {
    if (params.access_token && params.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: params.access_token as string,
        refresh_token: params.refresh_token as string,
      });
      if (error) throw error;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithEmail,
        signUp,
        signInWithOAuth,
        handleOAuthCallback,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
