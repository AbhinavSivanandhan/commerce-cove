import React from 'react';
const jwt_decode = (await import('jwt-decode')).default;
import { toast } from 'react-toastify';

const isTokenExpired = async (token) => {
  try {
    const decoded = jwt_decode(token);
    return decoded.exp * 1000 < Date.now(); // Check if the token has expired
  } catch {
    return true; // Treat decoding errors as an expired token
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    // Show a toast message if the user is not logged in or the token is expired
    //toast.error('You need to log in for full access. Session expired or not logged in.');
    return children; // Allow access to the page, but with limited functionality
  }

  return children; // If the token is valid, render the children normally
};

export default ProtectedRoute;
