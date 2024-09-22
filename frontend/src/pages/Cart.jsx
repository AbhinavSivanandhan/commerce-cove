import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import CartItemsList from '../components/CartComponents/CartItemsList';
import CartSummary from '../components/CartComponents/CartSummary';
import CheckoutModal from '../components/CartComponents/CheckoutModal';
const Cart = () => {
  const stripePromise = loadStripe('pk_test_51PWMd8Ron26oqThkOjUtJ4jPGKy9qPogXwxOyBQ3ENGV7QJO5uFzXm7m62KypNy2VkyOSYohOQRcs0spHsjsisq3003vNjNB7O');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState('');
  const [contact_details, setContactDetails] = useState('');
  const [confirm_check, setConfirmCheck] = useState(false);
  const [error, setError] = useState('');
  const [codChecked, setCodChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5001/api/v1/carts/view', {
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
    console.log(cartItems);
  };

  const handleDelete = (product_id) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:5001/api/v1/carts/delete/${product_id}`, {
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
      toast.error('Failed to delete item from cart');
    });
  };

  const handleCheckoutClick = () => {
    setShowModal(true);
  };

  const handleCODToggle = () => {
    setCodChecked(!codChecked);
  };

  const makePayment = async (orderIds) => {
    const stripe = await stripePromise;
    const inStockItems = cartItems.filter(item => item.instock);

    const body = {
      products: inStockItems,
      orderIds: orderIds
    };
    const headers = {
      "Content-Type": "application/json"
    }
    try {
    const response = await fetch(`http://localhost:5001/create-checkout-session`,{
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    const session = await response.json();
    const result = stripe.redirectToCheckout({
      sessionId:session.id
    });
    if(result.error){
      console.log(result.error.message);
      return false;
    }
    return true;
  } catch(error){
    console.error('Error during payment:', error);
    return false;
    }
  }
  const updateOrderStatus = (orderIds, status) => {
    const token = localStorage.getItem('token');
    const data = {
      orderIds,
      status
    }
    console.log('data payload of update:',JSON.stringify(data, null, 2));
    axios
    .put('http://localhost:5001/api/v1/orders/updateStatus', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
    })
    .then(response => {
      console.log(response);
      console.log('Order status updated successfully', response.data);

    })
    .catch(error => {
      console.error('Error updating order status', error);
      setLoading(false);
    });

  }
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let orderIds = [];
    const inStockItems = cartItems.filter(item => item.instock);
    if (!address) {
      setError('Address is required.');
      toast.error('Address is required.');
      return;
    }
    
    if (!contact_details) {
      setError('Contact details are required.');
      toast.error('Contact details are required.');
      return;
    }

    if (!address || !contact_details || inStockItems.length === 0) {
      setError('All fields are required and at least one in-stock item must be in cart.');
      toast.error('All fields are required and at least one in-stock item must be in cart.');
      return;
    }

    if (!confirm_check) {
      setError('Confirm your details!');
      toast.error('Confirm your details!');
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:5001/api/v1/orders/checkout`, { address, contact_details, inStockItems }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // alert('Order placed successfully');
      console.log(JSON.stringify(response.data.orders, null, 2));
      // Extracting order IDs
      orderIds = response.data.orders.map(order => order.order_id);
      console.log('Order IDs:', orderIds);
      
      setShowModal(false);
      if (!codChecked) {
        const paymentSuccessful = await makePayment(orderIds);
        if (paymentSuccessful) {
          // Do not update the order status here, it will be updated via success page
          console.log('Redirected to Stripe checkout');
        }
      } else {
        // Directly update the order status if COD is selected
        await updateOrderStatus(orderIds, 'cod');
        toast.success('Order placed successfully with COD');
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking out', error);
      setError(error.response ? error.response.data.message : 'Error checking out');
      toast.error('Error checking out');
    }
  };  

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-3xl mb-4">Cart</h1>
      <CartItemsList cartItems={cartItems} onQuantityChange={handleQuantityChange} onDelete={handleDelete} />
      <CartSummary total={total} codChecked={codChecked} onCODToggle={handleCODToggle} onCheckoutClick={handleCheckoutClick} />
      <CheckoutModal showModal={showModal} address={address} setAddress={setAddress} contact_details={contact_details} setContactDetails={setContactDetails} confirm_check={confirm_check} setConfirmCheck={setConfirmCheck} onSubmit={handleCheckoutSubmit} onCancel={() => setShowModal(false)} />
    </div>
  );
};

export default Cart;
