import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart } from "react-icons/fa";
import { IoReceiptSharp } from "react-icons/io5";
import { toast } from 'react-toastify';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // console.log('useEffect triggered'); // Debugging line
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    //console.log('Token from localStorage:', token); // Debugging line

    if (token) {
      // console.log('Sending request to /api/v1/accounts/status'); // Debugging line
      axios.get('http://localhost:5001/api/v1/accounts/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          // console.log('Response from /api/v1/accounts/status:', response); // Debugging line
          // console.log(response);
          if (response.data.user) {
            setIsLoggedIn(true);
            setUsername(response.data.user.username);
            //console.log('User is logged in:', response.data.user.username); // Debugging line
          } else {
            setIsLoggedIn(false);
            setUsername('');
            console.log('User is not logged in'); // Debugging line
          }
        })
        .catch(error => {
          console.error('Error checking auth status:', error);
          setIsLoggedIn(false);
          setUsername('');
        });
    } else {
      console.log('No token found in localStorage'); // Debugging line
      setIsLoggedIn(false);
      setUsername('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    toast.success('Logged Out!');

    navigate('/');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
      {/* Dark matte header with a subtle gradient */}
      <div className="text-2xl font-bold">
        <Link 
          to="/" 
          className="text-gray-100 transition-transform duration-300 transform hover:scale-105 hover:text-fuchsia-300 hover:shadow-lg active:scale-95 outline-none hover:outline hover:outline-2 hover:outline-gray-400 px-4 py-2 rounded-full"
        >
          CommerceCove
        </Link>
      </div>
      <div className="flex items-center">
        {isLoggedIn ? (
          <>
            <Link to='/cart'>
              <button className='bg-gray-700 text-white px-4 py-2 rounded-full flex items-center hover:bg-gray-600 transition-all duration-300 shadow-md'>
                <FaShoppingCart className="mr-2" />Cart
              </button>
            </Link>
            <Link to='/orderhistory' className="ml-4">
              <button className='bg-gray-700 text-white px-4 py-2 rounded-full flex items-center hover:bg-gray-600 transition-all duration-300 shadow-md'>
                <IoReceiptSharp className="mr-2" />Orders
              </button>
            </Link>
            <span className="ml-4 text-gray-300 font-semibold">{username}</span>
            <button onClick={handleLogout} className="ml-4 px-4 py-2 bg-indigo-700 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-md">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="ml-4 px-4 py-2 bg-indigo-700 text-white rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-md">
              Login
            </Link>
            <Link to="/register" className="ml-4 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition-all duration-300 shadow-md">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
