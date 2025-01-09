import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api/v1', // Replace with your API base URL
  withCredentials: true, // Automatically send cookies with requests
});

export default axiosInstance;
