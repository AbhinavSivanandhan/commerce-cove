import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { fetchUserStatus } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Spinner from '../components/Spinner';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import CartItemsList from '../components/CartComponents/CartItemsList';
import CartSummary from '../components/CartComponents/CartSummary';
import CheckoutModal from '../components/CartComponents/CheckoutModal';

const Cart = () => {
  const stripePromise = loadStripe('pk_test_51PWMd8Ron26oqThkOjUtJ4jPGKy9qPogXwxOyBQ3ENGV7QJO5uFzXm7m62KypNy2VkyOSYohOQRcs0spHsjsisq3003vNjNB7O');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState('');
  const [contact_details, setContactDetails] = useState('');
  const [confirm_check, setConfirmCheck] = useState(false);
  const [error, setError] = useState('');
  const [codChecked, setCodChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/carts/view');
        setCartItems(response.data.data || []);
      } catch (error) {
        console.error('Error fetching cart', error);
        toast.error('Failed to fetch cart items.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
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
    const updatedItems = cartItems.map((item) =>
      item.product_id === product_id ? { ...item, quantity: parseInt(quantity) } : item
    );
    setCartItems(updatedItems);
  };

  const handleDelete = async (product_id) => {
    try {
      await axiosInstance.delete(`/carts/delete/${product_id}`);
      setCartItems(cartItems.filter((item) => item.product_id !== product_id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error deleting item', error);
      toast.error('Failed to delete item from cart');
    }
  };

  const handleCheckoutClick = () => {
    setShowModal(true);
  };

  const handleCODToggle = () => {
    setCodChecked(!codChecked);
  };

  const makePayment = async (orderIds) => {
    const stripe = await stripePromise;
    const inStockItems = cartItems.filter((item) => item.instock);

    const body = { products: inStockItems, orderIds };
    try {
      const response = await axiosInstance.post('/create-checkout-session', body);
      const session = await response.data;
      const result = stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        console.error(result.error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error during payment:', error);
      return false;
    }
  };

  const updateOrderStatus = async (orderIds, status) => {
    const data = { orderIds, status };
    try {
      await axiosInstance.put('/orders/updateStatus', data);
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status', error);
      toast.error('Failed to update order status');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const inStockItems = cartItems.filter((item) => item.instock);

    try {
      const response = await axiosInstance.post('/orders/checkout', {
        address,
        contact_details,
        inStockItems,
      });

      const { transaction_id } = response.data;

      let retryCount = 0;
      const maxRetries = 5;

      const interval = setInterval(async () => {
        try {
          const statusResponse = await axiosInstance.get(`/orders/status/${transaction_id}`);
          const statusData = statusResponse.data;

          if (statusData.status === 'accepted') {
            clearInterval(interval);
            const orderIds = statusData.orders.map((order) => order.order_id);

            if (!codChecked) {
              const paymentSuccessful = await makePayment(orderIds);
              if (!paymentSuccessful) setLoading(false);
            } else {
              await updateOrderStatus(orderIds, 'cod');
              toast.success('Order placed successfully with COD');
              navigate('/');
            }
          } else if (statusData.status === 'failed' || retryCount >= maxRetries) {
            clearInterval(interval);
            toast.error('Reservation failed. Please try again.');
          }
        } catch (error) {
          console.error('Error checking order status', error);
          clearInterval(interval);
          toast.error('Error checking reservation status.');
        } finally {
          setLoading(false);
        }
      }, 5000);
    } catch (error) {
      console.error('Error during checkout process:', error);
      toast.error('Error checking out');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="p-4">
        {loading && <Spinner />}
        <h1 className="text-3xl mb-4">Cart</h1>
        <CartItemsList
          cartItems={cartItems}
          onQuantityChange={handleQuantityChange}
          onDelete={handleDelete}
        />
        <CartSummary
          total={total}
          codChecked={codChecked}
          onCODToggle={handleCODToggle}
          onCheckoutClick={handleCheckoutClick}
        />
        <CheckoutModal
          showModal={showModal}
          address={address}
          setAddress={setAddress}
          contact_details={contact_details}
          setContactDetails={setContactDetails}
          confirm_check={confirm_check}
          setConfirmCheck={setConfirmCheck}
          onSubmit={handleCheckoutSubmit}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </>
  );
};

export default Cart;
