import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Naudojame tiesioginį URL vietoj process.env
const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Patikrinti, ar vartotojas jau prisijungęs (localStorage)
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
      
      // Sukonfigūruoti Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${foundUser.token}`;
    }
    setLoading(false);
  }, []);

  // Prisijungimo funkcija
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/users/login`, { email, password });
      const loggedInUser = response.data;
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // Sukonfigūruoti Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${loggedInUser.token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Prisijungimo klaida');
      throw new Error(err.response?.data?.message || 'Prisijungimo klaida');
    } finally {
      setLoading(false);
    }
  };

  // Registracijos funkcija
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/users/register`, { name, email, password });
      const registeredUser = response.data;
      
      setUser(registeredUser);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      
      // Sukonfigūruoti Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${registeredUser.token}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registracijos klaida');
      throw new Error(err.response?.data?.message || 'Registracijos klaida');
    } finally {
      setLoading(false);
    }
  };

  // Atsijungimo funkcija
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook naudojimui
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
}; 