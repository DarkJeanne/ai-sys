import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async ({ username, password }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/auth/login/user', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      const userWithToken = { username, token: access_token };
      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', access_token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  const register = async ({ username, password, email, role }) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        password,
        email,
        Role: "user"
      });

      const { access_token } = response.data;
      const userWithToken = { username, token: access_token };
      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', access_token);
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('📦 Backend returned:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  };

  const updateProfile = async ({ username, password, newPassword, newEmail }) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      if (newPassword) formData.append('new_password', newPassword);

      const response = await api.post('/auth/update-profile', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${user?.token}`,
        }
      });

      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register,updateProfile }}>
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