import db from '../db/index.js';

export const viewCart = async (req, res) => {
  const userId = req.user.user_id; // Assuming you have user info in req.user from some authentication middleware

  try {
    const result = await db.query(
      `SELECT c.cart_id, p.description, p.price, c.quantity, p.instock 
       FROM cart c 
       JOIN product p ON c.product_id = p.product_id 
       WHERE c.user_id = $1 AND c.status = 'active'`,
      [userId]
    );
    res.status(200).json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error fetching cart' });
  }
};

export const checkoutCart = async (req, res) => {
  console.log('ordercont-checkoutCart');
  const { address, contact_details, inStockItems } = req.body;
  const user_id = req.user.user_id;
  console.log('inStockItems');
  console.log(inStockItems);
  try {
    const orderPromises = inStockItems.map(item => 
      db.query(
        `INSERT INTO order_history (user_id, product_id, quantity, total_price, address, contact_details) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [user_id, item.product_id, item.quantity, item.price * item.quantity, address, contact_details]
      )
    );
    const orders = await Promise.all(orderPromises);
    await db.query(`DELETE FROM cart WHERE user_id = $1 AND status = 'active'`, [user_id]);
    res.status(201).json({ status: 'success', data: orders.map(order => order.rows[0]) });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error processing order' });
  }
};
