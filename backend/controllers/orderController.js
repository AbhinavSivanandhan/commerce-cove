import { insertOrder, getOrderById, getAllOrders, getMyOrders, updateOrderStatusById } from '../models/orderModel.js';
import { v4 as uuidv4 } from 'uuid';
import {deleteActiveCartItems} from '../models/cartModel.js'

export const checkoutCart = async (req, res) => {
  const { address, contact_details, inStockItems } = req.body;
  const user_id = req.user.user_id;

  // Generate a unique transaction ID for this checkout session
  const transaction_id = uuidv4();

  try {
    // Pass transaction_id to each insertOrder call
    const orderPromises = inStockItems.map(item => 
      insertOrder(user_id, item.product_id, item.quantity, item.price * item.quantity, address, contact_details, transaction_id)
    );

    const orders = await Promise.all(orderPromises);

    // Delete items from cart if orders are successfully placed
    await deleteActiveCartItems(user_id);

    // Return the transaction_id for reference
    res.status(201).json({ status: 'success', orders, transaction_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error processing order' });
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

export const updateOrderStatusController = async (req,res) => {
  try {
    const { orderIds, status } = req.body; // Change orderId to orderIds
    const updatePromises = orderIds.map(orderId => updateOrderStatusById(orderId, status)); // Create an array of promises
    const updatedOrders = await Promise.all(updatePromises); // Wait for all promises to resolve
    res.status(200).json({ status: "success", data: { orders: updatedOrders } });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
}
