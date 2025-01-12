import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/accounts/login', { username, password });
      setLoading(false);
      toast.success('Welcome!');
      navigate('/'); // Redirect to the home page
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
      if (errorMessage.includes('Email not verified')) {
        navigate('/verify-email');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl p-12 bg-white rounded-xl shadow-xl">
        <BackButton />
        <h1 className="text-4xl font-semibold text-gray-800 text-center mb-8">Login</h1>
        {loading && <Spinner />}
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 focus:border-fuchsia-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 focus:border-fuchsia-500"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-fuchsia-500 text-white py-3 rounded-md hover:bg-fuchsia-600 transition"
          >
            Login
          </button>
          <div className="text-center mt-6">
            <span className="text-gray-700">Don't have an account?</span>{' '}
            <Link to="/register">
              <button className="ml-2 text-fuchsia-500 hover:underline">Register</button>
            </Link>
          </div>
          <div className="text-center mt-4">
            <span className="text-gray-700">Forgot your password?</span>{' '}
            <Link to="/request-password-reset">
              <button className="ml-2 text-fuchsia-500 hover:underline">
                Reset Password
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
