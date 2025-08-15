import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AdminUser } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkIsAdmin: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkIsAdmin(session.user.email || '').then(isAdmin => {
          if (!isAdmin) {
            signOut();
          }
        });
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isAdmin = await checkIsAdmin(session.user.email || '');
          if (!isAdmin) {
            await signOut();
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  const checkIsAdmin = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error || !data) {
        setAdminUser(null);
        return false;
      }
      
      setAdminUser(data as AdminUser);
      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, adminUser, loading, signOut, checkIsAdmin }}>
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