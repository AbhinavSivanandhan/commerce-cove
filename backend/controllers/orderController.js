import { getActiveCartItems, insertOrder, deleteActiveCartItems } from '../models/orderModel.js';

export const viewCart = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const cartItems = await getActiveCartItems(userId);
    res.status(200).json({ status: 'success', data: cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error fetching cart' });
  }
};

export const checkoutCart = async (req, res) => {
  const { address, contact_details, inStockItems } = req.body;
  const user_id = req.user.user_id;

  try {
    const orderPromises = inStockItems.map(item => 
      insertOrder(user_id, item.product_id, item.quantity, item.price * item.quantity, address, contact_details)
    );
    const orders = await Promise.all(orderPromises);
    await deleteActiveCartItems(user_id);
    res.status(201).json({ status: 'success', data: orders });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error processing order' });
  }
};
