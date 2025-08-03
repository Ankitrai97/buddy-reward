import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is a password recovery flow
    const urlParams = new URLSearchParams(window.location.search);
    const isRecoveryFlow = urlParams.get('type') === 'recovery' || 
                          urlParams.get('access_token') || 
                          urlParams.get('refresh_token');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // If this is a recovery flow, don't auto-login
        if (isRecoveryFlow && event === 'SIGNED_IN') {
          console.log('Intercepting recovery auto-login, redirecting to reset password');
          // Store the recovery session temporarily
          localStorage.setItem('recovery_session', JSON.stringify(session));
          // Sign out immediately to prevent auto-login
          await supabase.auth.signOut();
          // Redirect to reset password page
          window.location.href = '/reset-password' + window.location.search;
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !isRecoveryFlow) {
          // Fetch user role
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              setUserRole(roleData?.role || null);
            } catch (error) {
              console.error('Error fetching user role:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // Only check for existing session if not in recovery flow
    if (!isRecoveryFlow) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role for existing session
          setTimeout(async () => {
            try {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              setUserRole(roleData?.role || null);
            } catch (error) {
              console.error('Error fetching user role:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }

    // Check if user already exists (Supabase returns user but no session for existing emails)
    if (data.user && !data.session) {
      const customError = { message: "You already have an account with this email. Please sign in instead." };
      toast({
        title: "Account already exists",
        description: customError.message,
        variant: "destructive"
      });
      return { error: customError };
    }

    toast({
      title: "Check your email",
      description: "Please check your email for a confirmation link."
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link that expires in 15 minutes."
      });
    }

    return { error };
  };

  const updatePassword = async (password: string) => {
    // Try to get recovery session from localStorage first
    const recoverySessionStr = localStorage.getItem('recovery_session');
    let recoverySession = null;
    
    if (recoverySessionStr) {
      try {
        recoverySession = JSON.parse(recoverySessionStr);
      } catch (e) {
        console.error('Failed to parse recovery session:', e);
      }
    }

    // Use recovery session if available, otherwise current session
    const sessionToUse = recoverySession || session;
    
    if (!sessionToUse?.access_token) {
      const error = { message: "No valid session found for password reset" };
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }

    // Set the session temporarily to perform the password update
    if (recoverySession) {
      await supabase.auth.setSession({
        access_token: recoverySession.access_token,
        refresh_token: recoverySession.refresh_token
      });
    }

    const { error } = await supabase.auth.updateUser({ password });

    // Clean up recovery session
    localStorage.removeItem('recovery_session');

    if (error) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
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