// frontend/src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // For logout request

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // To check initial auth status

  // Function to simulate backend checking if token is valid
  // This is typically done by making a request to a /verify-token or /me endpoint
  // which verifies the token in the httpOnly cookie.
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual backend endpoint to verify token
      // This endpoint would read the httpOnly cookie, verify the token, and return user data
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        withCredentials: true,
      });
      if (response.data.success) { // Assuming your /me endpoint sends success: true
        setIsLoggedIn(true);
        setUser(response.data.user); // Set user data from backend
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      // console.error('Auth check failed:', error); // Log for debugging, but keep silent in prod
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on component mount to check if user is already logged in (e.g., on page refresh)
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    // You might also want to store some non-sensitive user data in localStorage if needed
    // localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Make a request to the backend logout endpoint to clear the httpOnly cookie
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true,
      });
      setIsLoggedIn(false);
      setUser(null);
      // Clear all localStorage on logout
      localStorage.clear();
      console.log('Logged out successfully on client and server.');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend logout fails, clear client-side state for UX
      setIsLoggedIn(false);
      setUser(null);
      // Clear all localStorage on logout
      localStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};