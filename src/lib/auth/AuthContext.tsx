'use client';

// src/lib/auth/AuthContext.tsx
// Context Provider cho xác thực người dùng

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  gradeId?: number;
  avatarUrl?: string;
}

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName: string, gradeId?: number) => Promise<void>;
  logout: () => Promise<void>;
}

// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook để sử dụng context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Props cho AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin người dùng hiện tại khi component được mount
  useEffect(() => {
    async function loadUserFromSession() {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserFromSession();
  }, []);

  // Hàm đăng nhập
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }
      
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng ký
  const register = async (username: string, email: string, password: string, fullName: string, gradeId?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, fullName, gradeId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại');
      }
      
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Đăng xuất thất bại');
      }
      
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Vẫn xóa user khỏi state ngay cả khi API thất bại
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
