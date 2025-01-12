import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/accounts/reset-password', { token, newPassword });
      setLoading(false);
      toast.success('Password reset successfully!');
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message || 'Error resetting password.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>
        <div>
          <label className="block mb-2 text-sm font-medium">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 mt-4 rounded"
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className="text-center mt-4">
          <a href="/request-password-reset" className="text-blue-500 underline">
            Request a new reset link
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
