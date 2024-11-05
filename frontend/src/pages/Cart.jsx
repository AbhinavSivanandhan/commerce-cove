import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
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
    console.log("Token retrieved from localStorage:", token);

    const inStockItems = cartItems.filter(item => item.instock);
    console.log("Filtered in-stock items:", inStockItems);

    try {
        console.log("Attempting to enqueue reservation with checkout details:", {
            address,
            contact_details,
            inStockItems
        });

        const response = await axios.post(
            `http://localhost:5001/api/v1/orders/checkout`,
            { address, contact_details, inStockItems },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Reservation response received:", response.data);

        const { transaction_id } = response.data;
        console.log(`Reservation enqueued with transaction ID: ${transaction_id}`);

        let retryCount = 0;
        const maxRetries = 5; // Set max retries
        const interval = setInterval(async () => {
            try {
                console.log(`Attempting to check status of transaction ${transaction_id}, Retry count: ${retryCount}`);

                const statusResponse = await axios.get(
                    `http://localhost:5001/api/v1/orders/status/${transaction_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                console.log("Status response received:", statusResponse.data);

                if (statusResponse.data.status === 'accepted') {
                    console.log(`Reservation accepted for transaction ID: ${transaction_id}`);
                    clearInterval(interval);
                    const orderIds = statusResponse.data.orders.map(order => order.order_id);
                    console.log('Order IDs:', orderIds);

                    // Proceed to payment if applicable
                    if (!codChecked) {
                        console.log("Proceeding to payment with order IDs:", orderIds);
                        const paymentSuccessful = await makePayment(orderIds);
                        if (paymentSuccessful) {
                            console.log('Redirected to Stripe checkout');
                        } else {
                            console.log("Payment unsuccessful.");
                        }
                    } else {
                        console.log("Placing order with COD for order IDs:", orderIds);
                        await updateOrderStatus(orderIds, 'cod');
                        toast.success('Order placed successfully with COD');
                        navigate('/');
                    }
                } else if (statusResponse.data.status === 'failed') {
                    console.log(`Reservation failed for transaction ID: ${transaction_id}`);
                    clearInterval(interval);
                    toast.error('Reservation failed. Please try again.');
                } else {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        console.log("Max retries reached. Stopping status checks for transaction ID:", transaction_id);
                        clearInterval(interval);
                        toast.error("Unable to confirm reservation. Please try again later.");
                    }
                }
            } catch (error) {
                console.error("Error checking order status for transaction ID:", transaction_id, "Error:", error);
                clearInterval(interval);
                toast.error("Error checking reservation status.");
            }
        }, 5000); // Poll every 5 seconds
    } catch (error) {
        console.error('Error during checkout process:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error request made but no response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        toast.error('Error checking out');
    }
};

 

  if (loading) return <p>Loading...</p>;

  return (
    <>
    <Header />
    <div className="p-4">
      {/* <BackButton text="Return home" /> */}
      <h1 className="text-3xl mb-4">Cart</h1>
      <CartItemsList cartItems={cartItems} onQuantityChange={handleQuantityChange} onDelete={handleDelete} />
      <CartSummary total={total} codChecked={codChecked} onCODToggle={handleCODToggle} onCheckoutClick={handleCheckoutClick} />
      <CheckoutModal showModal={showModal} address={address} setAddress={setAddress} contact_details={contact_details} setContactDetails={setContactDetails} confirm_check={confirm_check} setConfirmCheck={setConfirmCheck} onSubmit={handleCheckoutSubmit} onCancel={() => setShowModal(false)} />
    </div>
    </>
  );
};

export default Cart;
