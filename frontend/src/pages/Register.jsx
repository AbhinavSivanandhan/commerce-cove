import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/v1/accounts/register', { username, password, role });
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl p-12 bg-white rounded-xl shadow-xl">
        <BackButton />
        <h1 className="text-4xl font-semibold text-gray-800 text-center mb-8">Register</h1>
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
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-gray-100 border border-gray-300 focus:border-fuchsia-500"
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleRegister}
            className="w-full bg-fuchsia-500 text-white py-3 rounded-md hover:bg-fuchsia-600 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
