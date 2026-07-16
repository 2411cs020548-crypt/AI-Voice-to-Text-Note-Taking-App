/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const apiResponse = response.data;
      if (apiResponse.success && apiResponse.data) {
        if (apiResponse.data.otpRequired) {
          return { success: true, otpRequired: true, email: apiResponse.data.email };
        }
        const { token: jwtToken, ...userDetails } = apiResponse.data;
        
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userDetails));
        
        setToken(jwtToken);
        setUser(userDetails);
        return { success: true, message: apiResponse.message };
      }
      return { success: false, message: apiResponse.message || 'Login failed' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      return { success: false, message: errorMsg };
    }
  };

  const register = async (name, email, phoneNumber, password, confirmPassword) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, phoneNumber, password, confirmPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message: errorMsg };
    }
  };

  const verifyRegistrationOtp = async (email, otp) => {
    try {
      const response = await api.post('/api/auth/verify-registration-otp', { email, otp });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Verification failed. Try again.';
      return { success: false, message: errorMsg };
    }
  };

  const verifyLoginOtp = async (email, otp) => {
    try {
      const response = await api.post('/api/auth/verify-login-otp', { email, otp });
      const apiResponse = response.data;
      if (apiResponse.success && apiResponse.data) {
        const { token: jwtToken, ...userDetails } = apiResponse.data;
        
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userDetails));
        
        setToken(jwtToken);
        setUser(userDetails);
        return { success: true, message: apiResponse.message };
      }
      return { success: false, message: apiResponse.message || 'Verification failed' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Verification failed. Try again.';
      return { success: false, message: errorMsg };
    }
  };

  const resendOtp = async (email, purpose) => {
    try {
      const response = await api.post('/api/auth/resend-otp', { email, purpose });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to resend OTP. Try again.';
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      if (response.data.success && response.data.data) {
        const updatedUser = response.data.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch {
      // If profile fetching fails, logout is usually handled by the 401 interceptor
    }
  };

  useEffect(() => {
    const handleAuthLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    
    if (token) {
      getProfile();
    }
    
    setLoading(false);

    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      register,
      verifyRegistrationOtp,
      verifyLoginOtp,
      resendOtp,
      logout,
      refreshProfile: getProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
