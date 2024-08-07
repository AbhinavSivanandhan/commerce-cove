import db from '../db/index.js';

export const insertOrder = async (user_id, product_id, quantity, total_price, address, contact_details) => {
  const result = await db.query(
    `INSERT INTO order_history (user_id, product_id, quantity, total_price, address, contact_details) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [user_id, product_id, quantity, total_price, address, contact_details]
  );
  return result.rows[0];
};

export const getAllOrders = async (limit, offset) => {
  const result = await db.query('SELECT * FROM order_history LIMIT $1 OFFSET $2', [limit, offset]);
  const total = await db.query('SELECT COUNT(*) FROM order_history');
  return { rows: result.rows, rowCount: parseInt(total.rows[0].count, 10) };
};

export const getMyOrders = async (user_id, limit, offset) => {
  const result = await db.query('SELECT * FROM order_history where user_id=$1 LIMIT $2 OFFSET $3', [user_id, limit, offset]);
  const total = await db.query('SELECT COUNT(*) FROM order_history where user_id=$1',[user_id]);
  return { rows: result.rows, rowCount: parseInt(total.rows[0].count, 10) };
};

export const getOrderById = async (order_id) => {
  const result = await db.query('SELECT * FROM order_history WHERE order_id = $1', [order_id]);
  return result.rows[0];
};

export const updateOrderStatusById = async (orderId, status) => {
  const result = await db.query('UPDATE order_history SET status = $2 WHERE order_id = $1 RETURNING *;', [orderId, status]);
  return result.rows[0];
}
