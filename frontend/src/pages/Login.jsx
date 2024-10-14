import React, { useState } from 'react';
import axios from 'axios';
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
      const response = await axios.post('http://localhost:5001/api/v1/accounts/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setLoading(false);
      toast.success('Welcome!');
      navigate('/');
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error('Invalid Credentials!');
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
        </div>
      </div>
    </div>
  );
};

export default Login;
