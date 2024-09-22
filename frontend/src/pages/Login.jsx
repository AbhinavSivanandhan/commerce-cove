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
      localStorage.setItem('role', response.data.role); // Store the user's role in localStorage
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
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Login</h1>
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
        <button className='p-2 bg-sky-300 m-8' onClick={handleLogin}>Login</button>
        <div className='text-center'>
          <span className='text-gray-500'>Don't have an account?</span>
          <Link to='/register'>
            <button className='p-2 bg-sky-300 m-8'>Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
