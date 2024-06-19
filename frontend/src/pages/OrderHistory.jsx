import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import Header from '../components/Header';

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
          .get(`http://localhost:5000/api/v1/orders?page=${currentPage}&limit=${limit}`, {
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
      alert('Valid order ID should be numeric');
      setError('Valid order ID should be numeric');
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/v1/orders/${searchId}`, {
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
  
  return (
    <>
    <Header />
    <div className='p-4'>
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
              {Array.from({ length: totalPages }, (_, index) => (
                <button 
                  key={index + 1} 
                  onClick={() => handlePageChange(index + 1)} 
                  className={`px-3 py-1 mx-1 ${index + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
    </div>
    </>
  )
}

export default OrderHistory

/*
const Home = () => {
 
  const handleSearch = () => {
    if (searchId.trim() === '') {
      fetchProducts();
      return;
    }
    else if (isNaN(searchId)) {
      alert('Valid Product ID should be numeric');
      setError('Valid Product ID should be numeric');
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/v1/products/${searchId}`)
      .then((response) => {
        if (response.data.data.product) {
          setProducts([response.data.data.product]);
          setTotalPages(1);
          setError('');
        } else {
          setProducts([]);
          setError('No records found with that ID. Click on cancel to view the full list again.');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching product by ID:', error);
        setLoading(false);
        setProducts([]);
        setError('No records found with that ID. Click on cancel to view the full list again.');
      });
  };

  const handleCancelSearch = () => {
    setSearchId('');
    setCurrentPage(1);
    fetchProducts();
    setError('');
  };
  return (
    <>
      <Header />
      <div className='p-4'>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl my-8">Products List</h1>
          {role !== 'customer' && (
          <Link to='/products/create'>
            <MdOutlineAddBox className='text-sky-800 text-4xl' />
          </Link>
          )}
        </div>
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Search by Product ID"
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
                <th className='border border-slate-600 rounded-md'>SNo</th>
                <th className='border border-slate-600 rounded-md max-md:hidden'>Product Id</th>
                <th className='border border-slate-600 rounded-md'>Description</th>
                <th className='border border-slate-600 rounded-md max-md:hidden'>In Stock</th>
                <th className='border border-slate-600 rounded-md max-md:hidden'>Company Name</th>
                <th className='border border-slate-600 rounded-md'>Price</th>
                <th className='border border-slate-600 rounded-md'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.product_id} className='h-8'>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {(currentPage - 1) * limit + index + 1}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                    {product.product_id}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {product.description}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                    {product.instock ? 'Yes' : 'No'}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                    {product.companyname}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    {product.price}
                  </td>
                  <td className='border border-slate-700 rounded-md text-center'>
                    <div className="flex justify-center gap-x-4">
                      <Link to={`/products/details/${product.product_id}`}>
                        <BsInfoCircle className='text-2x1 text-green-800' />
                      </Link>
                      {role !== 'customer' && (
                      <>
                      <Link to={`/products/edit/${product.product_id}`}>
                        <AiOutlineEdit className='text-2x1 text-yellow-600' />
                      </Link>
                      <Link to={`/products/delete/${product.product_id}`}>
                        <MdOutlineDelete className='text-2x1 text-red-600' />
                      </Link>
                      </>
                      )}
                      <button 
                        onClick={() => handleAddToCart(product.product_id)} 
                        className='bg-emerald-500 text-white px-1 py-0.25 rounded'>
                        <MdOutlineAddShoppingCart />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='flex justify-center mt-4'>
              {Array.from({ length: totalPages }, (_, index) => (
                <button 
                  key={index + 1} 
                  onClick={() => handlePageChange(index + 1)} 
                  className={`px-3 py-1 mx-1 ${index + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;

*/