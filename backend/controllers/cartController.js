import db from '../db/index.js';

// Add to cart
export const addToCart = async (req, res) => {
    const { cart_type, product_id, quantity } = req.body;
    const user_id = req.user.user_id;

    try {
        const result = await db.query(
            'INSERT INTO cart (cart_type, user_id, product_id, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
            [cart_type, user_id, product_id, quantity]
        );
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error adding to cart' });
    }
};

// View cart
export const viewCart = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const result = await db.query(
            `SELECT c.product_id, c.cart_type, p.description, p.price, c.quantity, p.instock 
             FROM cart c 
             JOIN product p ON c.product_id = p.product_id 
             WHERE c.user_id = $1 AND c.cart_type = 'primary' AND c.status = 'active'`,
            [user_id]
        );
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error fetching cart' });
    }
};

export const deleteFromCart = async (req, res) => {
    const { product_id } = req.params;
    const userId = req.user.user_id;
    try {
      await db.query('DELETE FROM cart WHERE product_id = $1 AND user_id = $2 AND cart_type = \'primary\' AND status = \'active\'', [product_id, userId]);
      res.status(200).json({ status: 'success', message: 'Item deleted from cart' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Error deleting item from cart' });
    }
  };