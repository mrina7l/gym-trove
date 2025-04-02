
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
      // This would be a real API call in a production app
      // For demo purposes, just mock a successful login
      const mockUser: User = {
        id: '1',
        email,
        name: 'Demo User',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
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
      // This would be a real API call in a production app
      // For demo purposes, just mock a successful signup
      const mockUser: User = {
        id: '1',
        email,
        name,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
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
      // This would be a real API call in a production app
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
