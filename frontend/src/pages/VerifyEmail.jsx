import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const verify = async () => {
      try {
        await axiosInstance.get(`/accounts/verify-email?token=${token}`);
        toast.success('Your email has been successfully verified! You can now log in.');
        navigate('/login');
      } catch (error) {
        console.error('Error verifying email:', error);
        toast.error('Email verification failed or the token has expired. Please try again.');
      }
    };

    if (token) {
      verify();
    }
  }, [token, navigate]);

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            {token ? 'Verifying Your Email...' : 'No Token Provided'}
          </h1>
          <p className="text-gray-600">
            {token
              ? 'Please wait while we verify your email. This process will be completed shortly.'
              : 'It seems you do not have a verification token. If you haven’t received a verification email, please check your spam folder or try registering again.'}
          </p>
          <div className="mt-6 space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-fuchsia-500 text-white py-2 rounded-md hover:bg-fuchsia-600 transition"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
            >
              Browse Without Logging In
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
