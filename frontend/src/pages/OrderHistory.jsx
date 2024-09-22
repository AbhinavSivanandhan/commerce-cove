import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchId, setSearchId] = useState('');
    const [error, setError] = useState('');
    const limit = 10;
    useEffect(() => {
      fetchOrderHistory();
    }, [currentPage]);
    const fetchOrderHistory = () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        axios
          .get(`http://localhost:5001/api/v1/orders/myOrders?page=${currentPage}&limit=${limit}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            setOrders(response.data.data.orders);
            setTotalPages(response.data.data.totalPages);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      };
  
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };
  

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (searchId.trim() === '') {
      fetchOrderHistory();
      return;
    }
    else if (isNaN(searchId)) {
      toast.error('Valid order ID should be numeric');
      setError('Valid order ID should be numeric');
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:5001/api/v1/orders/${searchId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        if (response.data.data.order) {
          setOrders([response.data.data.order]);
          setTotalPages(1);
          setError('');
        } else {
          setProducts([]);
          setError('No records found with that ID. Click on cancel to view the full list again.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching order by ID:', error);
        setLoading(false);
        setOrders([]);
        setError('No records found with that ID. Click on cancel to view the full list again.');
      });
  };
  const handleCancelSearch = () => {
    setSearchId('');
    setCurrentPage(1);
    fetchOrderHistory();
    setError('');
  };
  const getPaginationButtons = () => {
    const buttons = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1); // always show the first page

      if (currentPage > 3) {
        buttons.push('...');
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }

      if (currentPage < totalPages - 2) {
        buttons.push('...');
      }

      buttons.push(totalPages); // always show the last page
    }

    return buttons;
  };
  
  return (
    <>
    <Header />
    <div className='p-4'>
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl my-8">Orders List</h1>

      </div>
      <div className="flex mb-4">
          <input
            type="text"
            placeholder="Search by Order ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 mr-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Search
          </button>
          <button
            onClick={handleCancelSearch}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <Spinner />
        ) : (
          <>
            <table className='w-full border-separate border-spacing-2'>
            <thead>
              <tr>
                <th className='border border-slate-600 rounded-md'>S No.</th>
                <th className='border border-slate-600 rounded-md'>order_id</th>
                <th className='border border-slate-600 rounded-md max-md:hidden'>product_id</th>
                <th className='border border-slate-600 rounded-md'>quantity</th>
                <th className='border border-slate-600 rounded-md'>Status</th>
                <th className='border border-slate-600 rounded-md'>Total Price</th>
                <th className='border border-slate-600 rounded-md max-md:hidden'>address</th>
                <th className='border border-slate-600 rounded-md max-md:hidden'>contact_details</th>
                <th className='border border-slate-600 rounded-md'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.order_id} className='h-8'>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {(currentPage - 1) * limit + index + 1}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                    {order.order_id}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {order.product_id}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                    {order.quantity}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                    {order.status}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {order.total_price}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {order.address}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {order.contact_details}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                      Call Customer care
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <div className='flex justify-center mt-4'>
              {getPaginationButtons().map((page, index) =>
                page === '...' ? (
                  <span key={index} className='px-3 py-1 mx-1'>
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 mx-1 ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </>
        )}
    </div>
    </>
  )
}

export default OrderHistory
