import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import { toast } from 'react-toastify';

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
    axiosInstance
      .get(`/orders/myOrders?page=${currentPage}&limit=${limit}`)
      .then((response) => {
        setOrders(response.data.data.orders || []);
        setTotalPages(response.data.data.totalPages || 1);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order history:', error);
        setLoading(false);
        toast.error('Error fetching orders.');
      });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    if (searchId.trim() === '') {
      fetchOrderHistory();
      return;
    }
    if (isNaN(searchId)) {
      toast.error('Valid order ID should be numeric');
      setError('Valid order ID should be numeric');
      return;
    }

    setLoading(true);
    axiosInstance
      .get(`/orders/${searchId}`)
      .then((response) => {
        if (response.data.data.order) {
          setOrders([response.data.data.order]);
          setTotalPages(1);
          setError('');
        } else {
          setOrders([]);
          setError('No records found with that ID. Click on cancel to view the full list again.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching order by ID:', error);
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
      buttons.push(1);
      if (currentPage > 3) buttons.push('...');
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) buttons.push(i);
      if (currentPage < totalPages - 2) buttons.push('...');
      buttons.push(totalPages);
    }
    return buttons;
  };

  return (
    <>
      <Header />
      <div className="p-4">
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
            <table className="w-full border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="border border-slate-600 rounded-md">S No.</th>
                  <th className="border border-slate-600 rounded-md">Order ID</th>
                  <th className="border border-slate-600 rounded-md">Transaction ID</th>
                  <th className="border border-slate-600 rounded-md max-md:hidden">Product ID</th>
                  <th className="border border-slate-600 rounded-md">Quantity</th>
                  <th className="border border-slate-600 rounded-md">Status</th>
                  <th className="border border-slate-600 rounded-md">Total Price</th>
                  <th className="border border-slate-600 rounded-md max-md:hidden">Address</th>
                  <th className="border border-slate-600 rounded-md max-md:hidden">Contact Details</th>
                  <th className="border border-slate-600 rounded-md">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.order_id} className="h-8">
                    <td className="border border-slate-700 rounded-md text-center">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center">
                      {order.order_id}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center">
                      {order.transaction_id || 'N/A'}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center max-md:hidden">
                      {order.product_id}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center">
                      {order.quantity}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center">
                      {order.status}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center">
                      {order.total_price}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center max-md:hidden">
                      {order.address}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center max-md:hidden">
                      {order.contact_details}
                    </td>
                    <td className="border border-slate-700 rounded-md text-center">
                      Call Customer care
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center mt-4">
              {getPaginationButtons().map((page, index) =>
                page === '...' ? (
                  <span key={index} className="px-3 py-1 mx-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 mx-1 ${
                      page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
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
  );
};

export default OrderHistory;
