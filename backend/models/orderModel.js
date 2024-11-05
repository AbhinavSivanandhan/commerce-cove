import db from '../db/index.js';

export const insertOrder = async (user_id, product_id, quantity, total_price, address, contact_details, transaction_id) => {
  const result = await db.query(
    `INSERT INTO order_history (user_id, product_id, quantity, total_price, address, contact_details, transaction_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [user_id, product_id, quantity, total_price, address, contact_details, transaction_id]
  );
  return result.rows[0];
};

export const getAllOrders = async (limit, offset) => {
  const result = await db.query('SELECT * FROM order_history ORDER BY order_id DESC LIMIT $1 OFFSET $2', [limit, offset]);
  const total = await db.query('SELECT COUNT(*) FROM order_history');
  return { rows: result.rows, rowCount: parseInt(total.rows[0].count, 10) };
};

export const getMyOrders = async (user_id, limit, offset) => {
  console.log(`Executing query for user ID ${user_id} with limit ${limit} and offset ${offset}`);
  
  try {
    const result = await db.query(
      'SELECT * FROM order_history WHERE user_id=$1 ORDER BY order_id DESC LIMIT $2 OFFSET $3', 
      [user_id, limit, offset]
    );
    console.log(`Query result count: ${result.rows.length}`);

    const total = await db.query(
      'SELECT COUNT(*) FROM order_history WHERE user_id=$1', 
      [user_id]
    );
    const rowCount = parseInt(total.rows[0].count, 10);

    console.log(`Total orders count for user ${user_id}: ${rowCount}`);
    return { rows: result.rows, rowCount };
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error; // Re-throw error for controller handling
  }
};


export const getOrderById = async (order_id) => {
  const result = await db.query('SELECT * FROM order_history WHERE order_id = $1', [order_id]);
  return result.rows[0];
};

export const updateOrderStatusById = async (orderId, status) => {
  const result = await db.query('UPDATE order_history SET status = $2 WHERE order_id = $1 RETURNING *;', [orderId, status]);
  return result.rows[0];
}

export const getOrderByTransactionId = async (transaction_id) => {
  const result = await db.query(
    'SELECT * FROM order_history WHERE transaction_id = $1',
    [transaction_id]
  );

  return result.rows;
};

export const updateOrderStatusByTransactionId = async (transaction_id, status) => {
  return await db.query(
    'UPDATE order_history SET status = $2 WHERE transaction_id = $1 RETURNING *;',
    [transaction_id, status]
  );
};
