import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchUserStatus } from '../api/authApi'; // Ensure this API is properly implemented
import Spinner from './Spinner'; // Optional: Display spinner while checking auth

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: null, isVerified: null });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await fetchUserStatus(); // Fetch user status from API
        setAuthStatus({ isAuthenticated: !!user, isVerified: user?.verified });
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthStatus({ isAuthenticated: false, isVerified: false });
      }
    };

    checkAuth();
  }, []);

  // While authentication is being checked, show a loading spinner
  if (authStatus.isAuthenticated === null) {
    return <Spinner />;
  }

  // Redirect to login if not authenticated
  if (!authStatus.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to email verification page if not verified
  if (authStatus.isAuthenticated && authStatus.isVerified === false) {
    return <Navigate to="/verify-email" />;
  }

  // Render protected content if authenticated and verified
  return children;
};

export default ProtectedRoute;
