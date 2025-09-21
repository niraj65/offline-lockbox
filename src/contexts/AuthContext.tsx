import React, { createContext, useContext, useEffect, useState } from 'react';
import { vaultExists, getMasterPasswordValidation } from '@/lib/storage';
import { validateMasterPassword } from '@/lib/encryption';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasVault: boolean;
  login: (masterPassword: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVault, setHasVault] = useState(false);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const vaultExistsResult = await vaultExists();
      setHasVault(vaultExistsResult);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (masterPassword: string): Promise<boolean> => {
    try {
      const validationData = await getMasterPasswordValidation();
      
      if (!validationData) {
        return false;
      }

      const isValid = validateMasterPassword(masterPassword, validationData);
      
      if (isValid) {
        setIsAuthenticated(true);
        // Store password in memory for current session
        (window as any).__masterPassword = masterPassword;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Clear password from memory
    delete (window as any).__masterPassword;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    hasVault,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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