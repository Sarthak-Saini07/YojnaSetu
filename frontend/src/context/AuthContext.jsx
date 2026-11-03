import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user and persistent profile from MongoDB on mount or token change
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to restore session from token:', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const accessToken = res.data.access_token;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);

    // Retrieve fresh user document and profile from MongoDB
    const userData = res.data.user;
    setUser(userData);
    return userData;
  };

  const register = async (email, password, fullName = '', phone = '', initialProfile = null) => {
    // Strictly register with role="user"
    const payload = {
      email,
      password,
      name: fullName,
      full_name: fullName,
      phone: phone || null,
      role: 'user',
      ...(initialProfile ? { profile: initialProfile } : {}),
    };

    await api.post('/auth/register', payload);
    // Automatic login to restore session and profile
    return await login(email, password);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    // Save to persistent MongoDB collection
    await api.put('/profile', profileData);
    // Refresh user state from MongoDB
    const freshUserRes = await api.get('/auth/me');
    setUser(freshUserRes.data);
    return freshUserRes.data;
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        return res.data;
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
    return null;
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
        updateProfile,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
