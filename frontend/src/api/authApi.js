import axiosInstance from './axiosInstance';

// Fetch the current user's status from the backend
export const fetchUserStatus = async () => {
  try {
    const response = await axiosInstance.get('/accounts/status');
    return response.data.user; // Return the user object (including role)
  } catch (error) {
    console.error('Error fetching user status:', error);
    return null;
  }
};
