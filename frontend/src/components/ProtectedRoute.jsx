import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchUserStatus } from '../api/authApi'; // Ensure this API is properly implemented
import Spinner from './Spinner'; // Optional: Display spinner while checking auth

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchUserStatus(); // Fetch user status from API
        setIsAuthenticated(!!user); // Set auth state based on user presence
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // While authentication is being checked, show a loading spinner
  if (isAuthenticated === null) {
    return <Spinner />;
  }

  // Navigate to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
