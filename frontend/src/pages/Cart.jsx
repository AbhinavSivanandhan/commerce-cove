import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/v1/carts/view', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      setCartItems(response.data.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching cart', error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const totalAmount = cartItems.reduce((acc, item) => {
      if (item.instock) {
        return acc + item.price * item.quantity;
      }
      return acc;
    }, 0);

    setTotal(totalAmount);

  }, [cartItems]);



  const handleQuantityChange = (product_id, quantity) => {
    const updatedItems = cartItems.map(item => 
      item.product_id === product_id ? { ...item, quantity: parseInt(quantity) } : item
    );
    setCartItems(updatedItems);
  };

  const handleDelete = (product_id) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:5000/api/v1/carts/delete/${product_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('Item deleted', response);
      setCartItems(cartItems.filter(item => item.product_id !== product_id));
    })
    .catch(error => {
      console.error('Error deleting item', error);
    });
  };

  const handleCheckoutClick = () => {
    setShowModal(true);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const inStockItems = cartItems.filter(item => item.instock);

    if (!address || !contactDetails || inStockItems.length === 0) {
      setError('All fields are required and at least one in-stock item must be in cart.');
      alert('All fields are required and at least one in-stock item must be in cart.');
      return;
    }

    axios.post(`http://localhost:5000/api/v1/orders/checkout`, { address, contact_details: contactDetails, inStockItems }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      alert('Order placed successfully');
      setShowModal(false);
      navigate('/');
    })
    .catch(error => {
      console.error('Error checking out', error);
      setError(error.response ? error.response.data.message : 'Error checking out');
      alert('Error checking out');
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl mb-4">Cart</h1>
      <ul className="space-y-4">
        {cartItems.map(item => (
          <li key={item.product_id} className="p-4 border rounded shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{item.description}</h2>
              <p className="text-gray-600">${item.price} x {item.quantity}</p>
              {item.instock ? (
                <select value={item.quantity} onChange={(e) => handleQuantityChange(item.product_id, e.target.value)} className="border border-gray-300 rounded p-1">
                    {[...Array(10).keys()].map(i => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              ) : (
                <p className="text-red-600">(Out of Stock)</p>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => handleDelete(item.product_id)} className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
            </div>
          </li>
))}
      </ul>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Total: ${total.toFixed(2)}</h2>
        <button onClick={handleCheckoutClick} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Checkout
        </button>
      </div>
      {showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Checkout</h2>
          <form onSubmit={handleCheckoutSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Contact Details</label>
              <input
                type="text"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 w-full"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default Cart;
