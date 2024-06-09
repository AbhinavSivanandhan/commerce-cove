import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/v1/cart/view', {
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

  const checkout = () => {
    const token = localStorage.getItem('token');
    const address = prompt('Enter your address');
    const contact_details = prompt('Enter your contact details');
    if (!address || !contact_details) return;

    axios.post('http://localhost:5000/api/v1/cart/checkout', { address, contact_details }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      alert('Order placed successfully');
      navigate('/');
    })
    .catch(error => {
      console.error('Error checking out', error);
      alert('Error checking out');
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Cart</h1>
      <ul>
        {cartItems.map(item => (
          <li key={item.cart_id}>
            {item.description} - ${item.price} x {item.quantity} {item.instock ? '' : '(Out of Stock)'}
          </li>
        ))}
      </ul>
      <button onClick={checkout}>Checkout</button>
    </div>
  );
};

export default Cart;
