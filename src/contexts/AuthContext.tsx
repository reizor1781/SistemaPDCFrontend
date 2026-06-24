import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['view_all', 'upload_plans', 'delete_plans', 'manage_users', 'manage_attractions', 'approve_plans', 'edit_specs', 'add_comments', 'view_maintenance', 'manage_maintenance'],
  engineer: ['view_all', 'upload_plans', 'manage_attractions', 'approve_plans', 'edit_specs', 'add_comments', 'view_maintenance', 'manage_maintenance'],
  technician: ['view_all', 'add_comments', 'view_maintenance', 'manage_maintenance'],
  operator: ['view_all'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('pcp_user');
    return storedUser ? JSON.parse(storedUser) as User : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pcp_token'));

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token: apiToken, user: apiUser } = await api.login(email, password);
      setUser(apiUser);
      setToken(apiToken);
      localStorage.setItem('pcp_user', JSON.stringify(apiUser));
      localStorage.setItem('pcp_token', apiToken);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de autenticación',
      };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pcp_user');
    localStorage.removeItem('pcp_token');
  }, []);

  const hasPermission = useCallback((action: string) => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(action) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
