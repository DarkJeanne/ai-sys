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

  const login = async ({ username, password, rememberMe}) => {
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

//     localStorage.setItem('user', JSON.stringify(userWithToken));
//     localStorage.setItem('token', access_token);
//   } catch (error) {
//     console.error('Login failed:', error);
//     throw error;
//   }
// };
    if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', access_token);
      } else {
        sessionStorage.setItem('user', JSON.stringify(userWithToken));
        sessionStorage.setItem('token', access_token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem('user');
  // };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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