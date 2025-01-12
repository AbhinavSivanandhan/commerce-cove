import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/accounts/request-password-reset', { email });
      setLoading(false);
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      setLoading(false);
      toast.error('Error sending password reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>
        <div>
          <label className="block mb-2 text-sm font-medium">Email Address</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 mt-4 rounded"
          onClick={handleRequestReset}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
