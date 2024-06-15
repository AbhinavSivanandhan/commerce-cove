import db from '../db/index.js';

export const getActiveCartItems = async (user_id) => {
  const result = await db.query(
    `SELECT c.product_id, p.description, p.price, c.quantity, p.instock 
     FROM cart c 
     JOIN product p ON c.product_id = p.product_id 
     WHERE c.user_id = $1 AND c.status = 'active'`,
    [user_id]
  );
  return result.rows;
};

export const insertOrder = async (user_id, product_id, quantity, total_price, address, contact_details) => {
  const result = await db.query(
    `INSERT INTO order_history (user_id, product_id, quantity, total_price, address, contact_details) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, product_id, quantity, total_price, address, contact_details]
  );
  return result.rows[0];
};

export const deleteActiveCartItems = async (user_id) => {
  await db.query(`DELETE FROM cart WHERE user_id = $1 AND status = 'active'`, [user_id]);
};