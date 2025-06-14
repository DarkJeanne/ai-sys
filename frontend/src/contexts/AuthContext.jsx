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
      
      // Lấy thông tin người dùng từ API (bao gồm vai trò)
      try {
        const userResponse = await api.get('/auth/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        // Lưu thông tin người dùng với token và vai trò
        const userWithToken = { 
          username, 
          token: access_token,
          role: userResponse.data.role || 'user' // Lưu vai trò người dùng
        };
        
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', access_token);
      } catch (userError) {
        console.error('Error fetching user details:', userError);
        // Nếu không lấy được thông tin người dùng, vẫn đăng nhập nhưng không có vai trò
        const userWithToken = { username, token: access_token };
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', access_token);
      }
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
  };

  // Hàm cập nhật vai trò người dùng
  const refreshUserRole = async () => {
    if (!user || !user.token) return;
    
    try {
      // Lấy thông tin người dùng từ API
      const userResponse = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      // Cập nhật thông tin người dùng với vai trò mới
      const updatedUser = { 
        ...user,
        role: userResponse.data.role || user.role || 'user'
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('User role refreshed:', updatedUser.role);
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing user role:', error);
      return user;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, refreshUserRole }}>
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