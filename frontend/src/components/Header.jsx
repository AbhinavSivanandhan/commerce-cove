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
    console.log('Token from localStorage:', token); // Debugging line

    if (token) {
      // console.log('Sending request to /api/v1/accounts/status'); // Debugging line
      axios.get('http://localhost:5001/api/v1/accounts/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          // console.log('Response from /api/v1/accounts/status:', response); // Debugging line
          // console.log(response);
          if (response.data.user) {
            setIsLoggedIn(true);
            setUsername(response.data.user.username);
            console.log('User is logged in:', response.data.user.username); // Debugging line
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
    <header className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-300">
      <div className="text-2xl font-bold">
        <Link to="/" className="text-gray-900">CommerceCove</Link> {/* Replace with your logo and homepage link */}
      </div>
      <div className="flex items-center">
        {isLoggedIn ? (
          <>
            <Link to='/cart'>
              <button className='bg-stone-950 text-white px-4 py-2 rounded flex items-center'>
                <FaShoppingCart className="mr-2" />Cart
              </button>
            </Link>
            <Link to='/orderhistory'>
              <button className='bg-stone-950 text-white px-4 py-2 rounded flex items-center'>
                <IoReceiptSharp className="mr-2" />Orders
              </button>
            </Link>
            <span className="ml-4 text-gray-700">{username}</span>
            <button onClick={handleLogout} className="ml-4 px-4 py-2 bg-blue-950 text-white rounded hover:bg-blue-700">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
              Login
            </Link>
            <Link to="/register" className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
