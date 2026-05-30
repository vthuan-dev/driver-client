import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('customer_token');
    const savedUser = localStorage.getItem('customer_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const res = await authAPI.login({ phone, password });
    const { token: t, user: u } = res.data;
    if (u.role !== 'customer') {
      throw new Error('Tài khoản này không phải tài khoản khách hàng');
    }
    localStorage.setItem('customer_token', t);
    localStorage.setItem('customer_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const register = async (name: string, phone: string, password: string) => {
    const res = await authAPI.customerRegister({ name, phone, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('customer_token', t);
    localStorage.setItem('customer_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
