import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default to 'customer'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/v1/accounts/register', { username, password, role });
      setLoading(false);
      navigate('/login');
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert('Registration failed');
    }
  };

  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Register</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col border-2 border-sky-bg-400 rounded-xl w-fit p-4'>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Username</label>
          <input
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Password</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-500'>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          >
            <option value='customer'>Customer</option>
            <option value='seller'>Seller</option>
            <option value='admin'>Admin</option>
          </select>
        </div>
        <button className='p-2 bg-sky-300 m-8' onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default Register;
