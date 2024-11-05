import { insertOrder, getOrderById, getAllOrders, getMyOrders, updateOrderStatusById, getOrderByTransactionId, updateOrderStatusByTransactionId } from '../models/orderModel.js';
import {deleteActiveCartItems} from '../models/cartModel.js';
import { v4 as uuidv4 } from 'uuid';
import { enqueueReservation } from '../services/queueService.js';

// Controller to get order status by transaction ID
export const getOrderStatusByTransactionIdController = async (req, res) => {
  const { transaction_id } = req.params;
  console.log(`Received request for order status with transaction_id: ${transaction_id}`);

  try {
    const orders = await getOrderByTransactionId(transaction_id);

    if (!orders || orders.length === 0) {
      console.log(`No orders found for transaction_id: ${transaction_id}`);
      return res.status(404).json({ message: 'Order not found', transaction_id });
    }

    console.log(`Order(s) found for transaction_id: ${transaction_id}. Order count: ${orders.length}`);
    res.status(200).json({
      status: orders[0].status,
      orders,
    });
  } catch (error) {
    console.error('Error retrieving order status:', error.message); // Log just the error message for clarity
    console.error('Full error details:', error); // Log full error for debugging
    res.status(500).json({ message: 'Error retrieving order status', error: error.message });
  }
};

export const updateReservationStatusController = async (req, res) => {
  const { transaction_id, status } = req.body;

  try {
    // Update to 'accepted' or 'failed' based on reservation outcome
    const newStatus = status === 'accepted' ? 'accepted' : 'failed';
    await updateOrderStatusByTransactionId(transaction_id, newStatus);

    // Clear cart items if reservation successful
    if (status === 'accepted') {
      const orders = await getOrderByTransactionId(transaction_id);
      const user_id = orders[0].user_id;
      await deleteActiveCartItems(user_id);
      console.log('successful reservation');
      res.status(200).json({ status: 'success', orders });
    } else {
      console.log('failed reservation '+status);
      res.status(200).json({ status: 'failure', message: 'Reservation could not be fulfilled' });
    }
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ status: 'error', message: 'Error updating reservation status' });
  }
};

export const checkoutCart = async (req, res) => {
  const { address, contact_details, inStockItems } = req.body;
  const user_id = req.user.user_id;
  const transaction_id = uuidv4();

  try {
    // Create pending orders for each item in the cart
    const orderPromises = inStockItems.map(item => {
      return insertOrder(
        user_id,
        item.product_id,
        item.quantity,
        item.price * item.quantity,
        address,
        contact_details,
        transaction_id,
        'pending' // Status is now explicitly set to pending
      );
    });

    const orders = await Promise.all(orderPromises);
    console.log(`Orders created with transaction ID: ${transaction_id}`);

    // Enqueue reservation requests
    for (const item of inStockItems) {
      await enqueueReservation({
        user_id,
        product_id: item.product_id,
        quantity: item.quantity,
        transaction_id,
      });
    }

    res.status(200).json({
      status: 'pending',
      message: 'Orders created and reservation requests enqueued',
      transaction_id,
      orders
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Error processing checkout' });
  }
};


export const getAllOrdersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { rows: orders, rowCount } = await getAllOrders(limit, offset);
    const totalPages = Math.ceil(rowCount / limit);    
    res.status(200).json({ 
      status: "success", 
      data: { 
        orders, 
        totalPages, 
        currentPage: page 
      } 
    });
    } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getMyOrdersController = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    console.log('Fetching orders for user:', user_id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    console.log(`Pagination info - Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
    
    const { rows: orders, rowCount } = await getMyOrders(user_id, limit, offset);
    
    console.log(`Orders fetched: ${orders.length}`);
    const totalPages = Math.ceil(rowCount / limit);

    res.status(200).json({ 
      status: "success", 
      data: { 
        orders, 
        totalPages, 
        currentPage: page 
      } 
    });
  } catch (error) {
    console.error('Error getting my orders:', error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};


export const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderById(id);
    res.status(200).json({ status: "success", data: { order } });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    const updatePromises = orderIds.map(orderId => updateOrderStatusById(orderId, status));
    const updatedOrders = await Promise.all(updatePromises);
    res.status(200).json({ status: 'success', data: { orders: updatedOrders } });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
