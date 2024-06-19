import db from '../db/index.js';

export const addToCartModel = async (cart_type, user_id, product_id, quantity) => {
    const result = await db.query(
        'INSERT INTO cart (cart_type, user_id, product_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
        [cart_type, user_id, product_id, quantity]
    );
    return result.rows[0];
};

export const viewCartModel = async (user_id) => {
    const result = await db.query(
        `SELECT c.product_id, c.cart_type, p.description, p.price, c.quantity, p.instock 
         FROM cart c 
         JOIN product p ON c.product_id = p.product_id 
         WHERE c.user_id = $1 AND c.cart_type = 'primary' AND c.status = 'active'`,
        [user_id]
    );
    return result.rows;
};

export const deleteFromCartModel = async (product_id, user_id) => {
    const result = await db.query(
        'DELETE FROM cart WHERE product_id = $1 AND user_id = $2 AND cart_type = \'primary\' AND status = \'active\'',
        [product_id, user_id]
    );
    return result.rows[0];
};

export const deleteActiveCartItems = async (user_id) => {
    await db.query(`DELETE FROM cart WHERE user_id = $1 AND status = 'active'`, [user_id]);
  };