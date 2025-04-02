
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to get Supabase session
  const getSessionData = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  };

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Check admin status
        if (parsedUser && parsedUser.email === 'admin@example.com') {
          setIsAdmin(true);
          console.log('Admin user detected from localStorage');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    
    // Also check Supabase session
    getSessionData().then(session => {
      if (session) {
        const email = session.user.email;
        if (email === 'admin@example.com') {
          setIsAdmin(true);
          console.log('Admin user detected from Supabase session');
        }
      }
    });
    
    setIsLoading(false);
  }, []);

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log('Checking admin status for:', user.email);
      // For simplicity, we'll check if the email is admin@example.com
      const isUserAdmin = user.email === 'admin@example.com';
      console.log('Is admin?', isUserAdmin);
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // If failed with Supabase (likely during development), fall back to mock login
        console.log('Falling back to mock login:', error.message);
        
        // Mock login for development
        const mockUser: User = {
          id: '1',
          email,
          name: 'Demo User',
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else if (data.user) {
        // Successful Supabase login
        const authenticatedUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || 'User',
        };
        
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
      }
      
      // Set admin status if email is admin@example.com
      const isUserAdmin = email === 'admin@example.com';
      console.log('Login: Is admin?', isUserAdmin, 'Email:', email);
      setIsAdmin(isUserAdmin);
      
      toast({
        title: 'Login successful',
        description: isUserAdmin ? 'Welcome back, Admin!' : 'Welcome back!',
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Try to sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        // If failed with Supabase, fall back to mock signup
        console.log('Falling back to mock signup:', error.message);
        
        // Mock signup for development
        const mockUser: User = {
          id: '1',
          email,
          name,
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
      } else if (data.user) {
        // Successful Supabase signup
        const authenticatedUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || name,
        };
        
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
      }
      
      // Set admin status if email is admin@example.com
      const isUserAdmin = email === 'admin@example.com';
      console.log('Signup: Is admin?', isUserAdmin, 'Email:', email);
      setIsAdmin(isUserAdmin);
      
      toast({
        title: 'Signup successful',
        description: isUserAdmin ? 'Admin account has been created' : 'Your account has been created',
      });
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out from Supabase:', error);
      }
      
      // Clear local storage and state
      localStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, signup, logout, checkAdminStatus }}>
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
