import React, { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { toast } from 'react-toastify';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    let orderIds;
    try {
      const orderIdsString = decodeURIComponent(urlParams.get('orderIds'));
      console.log('Encoded orderIds:', orderIdsString);
      orderIds = JSON.parse(orderIdsString);
      console.log('Parsed orderIds:', orderIds);    } catch (error) {
      console.error('Error parsing orderIds:', error);
      return;
    }
    const updateOrderStatus = async (orderIds) => {
      const token = localStorage.getItem('token');
      const data = {
        orderIds,
        status: 'paid'
      };
      try {
        await axiosInstance.put('http://localhost:5001/api/v1/orders/updateStatus', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        console.log('Order status updated successfully');
        toast.success('Order placed and payment successful! We\'ll be shipping out to you soon!');

      } catch (error) {
        console.error('Error updating order status', error);
      }
    };

    if (sessionId && orderIds) {
      updateOrderStatus(orderIds);
    } else {
      console.error('Missing session ID or order IDs');
    }
    const timeoutId = setTimeout(() => {
      navigate('/');
    }, 5001);
    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <>
    <Header /> 
    <div className='min-h-screen flex flex-col items-center justify-center bg-green-500'>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Success!</h1>
        <p className="text-lg mb-4">
          Your order has been placed and the payment has been completed successfully.
        </p>
        <p className="text-lg">
          You will be redirected to the Home page in a few seconds.
        </p>
      </div>
    </div>
    </>
  );
};

export default Success;
