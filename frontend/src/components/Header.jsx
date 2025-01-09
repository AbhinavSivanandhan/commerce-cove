import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { fetchUserStatus } from '../api/authApi'; // Import fetchUserStatus API
import { FaShoppingCart } from "react-icons/fa";
import { IoReceiptSharp } from "react-icons/io5";
import { toast } from 'react-toastify';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await fetchUserStatus(); // Call the fetchUserStatus API
        if (user) {
          setIsLoggedIn(true);
          setUsername(user.username); // Update the username
        } else {
          setIsLoggedIn(false);
          setUsername('');
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        setIsLoggedIn(false);
        setUsername('');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/accounts/logout'); // Call the backend to clear cookies
      toast.success('Logged out successfully!');
      setIsLoggedIn(false);
      setUsername('');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
      {/* Logo/Brand */}
      <div className="text-2xl font-bold">
        <Link 
          to="/" 
          className="text-gray-100 transition-transform duration-300 transform hover:scale-105 hover:text-fuchsia-300 hover:shadow-lg active:scale-95 outline-none hover:outline hover:outline-2 hover:outline-gray-400 px-4 py-2 rounded-full"
        >
          CommerceCove
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex items-center">
        {isLoggedIn ? (
          <>
            <Link to="/cart">
              <button className="bg-gray-700 text-white px-4 py-2 rounded-full flex items-center hover:bg-gray-600 transition-all duration-300 shadow-md">
                <FaShoppingCart className="mr-2" />Cart
              </button>
            </Link>
            <Link to="/orderhistory" className="ml-4">
              <button className="bg-gray-700 text-white px-4 py-2 rounded-full flex items-center hover:bg-gray-600 transition-all duration-300 shadow-md">
                <IoReceiptSharp className="mr-2" />Orders
              </button>
            </Link>
            <span className="ml-4 text-gray-300 font-semibold">{username}</span>
            <button 
              onClick={handleLogout} 
              className="ml-4 px-4 py-2 bg-indigo-700 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="ml-4 px-4 py-2 bg-indigo-700 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-md">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-all duration-300 shadow-md">
                Register
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
