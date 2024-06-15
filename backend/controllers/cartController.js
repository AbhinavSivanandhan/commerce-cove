import { addToCartModel, viewCartModel, deleteFromCartModel } from '../models/cartModel.js';

export const addToCart = async (req, res) => {
    const { cart_type, product_id, quantity } = req.body;
    const user_id = req.user.user_id;

    try {
        const cartItem = await addToCartModel(cart_type, user_id, product_id, quantity);
        res.status(201).json({ status: 'success', data: cartItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error adding to cart' });
    }
};

export const viewCart = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const cartItems = await viewCartModel(user_id);
        res.status(200).json({ status: 'success', data: cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error fetching cart' });
    }
};

export const deleteFromCart = async (req, res) => {
    const { product_id } = req.params;
    const userId = req.user.user_id;

    try {
        await deleteFromCartModel(product_id, userId);
        res.status(200).json({ status: 'success', message: 'Item deleted from cart' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error deleting item from cart' });
    }
};
