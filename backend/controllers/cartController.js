import db from '../db/index.js';

// Add to cart
export const addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const user_id = req.user.user_id;

    try {
        const result = await db.query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [user_id, product_id, quantity]
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
            `SELECT c.cart_id, p.description, p.price, c.quantity, p.instock 
             FROM cart c 
             JOIN product p ON c.product_id = p.product_id 
             WHERE c.user_id = $1 AND c.status = 'active'`,
            [user_id]
        );
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error fetching cart' });
    }
};

// Checkout cart
export const checkoutCart = async (req, res) => {
    const { address, contact_details } = req.body;
    const user_id = req.user.user_id;

    try {
        const cartItems = await db.query(
            `SELECT c.cart_id, p.product_id, p.price, c.quantity 
             FROM cart c 
             JOIN product p ON c.product_id = p.product_id 
             WHERE c.user_id = $1 AND c.status = 'active'`,
            [user_id]
        );

        const totalAmount = cartItems.rows.reduce((total, item) => total + item.price * item.quantity, 0);

        // Create orders
        const orderPromises = cartItems.rows.map(item => 
            db.query(
                `INSERT INTO order_history (user_id, product_id, quantity, total_price, address, contact_details) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [user_id, item.product_id, item.quantity, item.price * item.quantity, address, contact_details]
            )
        );

        const orders = await Promise.all(orderPromises);

        // Clear the cart
        await db.query(`DELETE FROM cart WHERE user_id = $1 AND status = 'active'`, [user_id]);

        res.status(201).json({ status: 'success', data: orders.map(order => order.rows[0]) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error processing order' });
    }
};
