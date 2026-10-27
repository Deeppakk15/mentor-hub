import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mentorhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mentorhub_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('mentorhub_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('mentorhub_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('mentorhub_token', newToken);
      localStorage.setItem('mentorhub_user', JSON.stringify(userData));

      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('mentorhub_token', newToken);
      localStorage.setItem('mentorhub_user', JSON.stringify(userData));

      toast.success('Account created successfully!');
      return userData;
    } catch (error) {
      let msg = error.response?.data?.message;
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        msg = error.response.data.errors.join('; ');
      }
      if (!msg) {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          msg = 'Backend server is unreachable. Please verify server is running on port 5000.';
        } else {
          msg = 'Registration failed. Please check your details.';
        }
      }
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mentorhub_token');
    localStorage.removeItem('mentorhub_user');
    toast.info('You have logged out.');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('mentorhub_user', JSON.stringify(updatedUserData));
  };

  // 1-Click Demo account quick-switcher helper
  const switchDemoAccount = async (role, specificEmail = null) => {
    let email = 'harsh.singh@college.edu';
    let password = 'student123';

    if (role === 'faculty') {
      email = specificEmail || 'dr.harikesh@college.edu';
      password = 'faculty123';
    } else if (role === 'admin') {
      email = specificEmail || 'admin@college.edu';
      password = 'admin123';
    } else if (specificEmail) {
      email = specificEmail;
    }

    return login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
