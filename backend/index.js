import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import { userRateLimiter, globalRateLimiter } from './middleware/rateLimitMiddleware.js'; // Import both middlewares
import db from './db/index.js';
import accountRoutes from './routes/accountRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import errorHandler from './middleware/errorMiddleware.js'; // Import error handler
import Stripe from 'stripe';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET)

// Database setup
import setupDatabase from './db/setupdb.js';

setupDatabase().then(() => {
  console.log('Database setup completed.');
}).catch(error => {
  console.error('Error setting up the database:', error);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // this will allow to read req.body
//using route based ratelimiting instead. factory function
//app.use(globalRateLimiter); // Apply global rate limiter before all other routes (applies to the whole app)
//app.use(userRateLimiter); // Apply user/IP-based rate limiter to all routes or specific routes
// Routes
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/orders', orderRoutes);

app.get('/', (request, response) => {
  return response.send('Welcome to CommerceCove');
});

app.post('/create-checkout-session', async (request, response) => {
  const { products, orderIds } = request.body;
  // Construct line items for the checkout session
  const lineItems = products.map((product) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.description,  // Adjust to match your product structure
      },
      unit_amount: Math.round(product.price * 100),  // Stripe expects the amount in cents
    },
    quantity: product.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}&orderIds=${encodeURIComponent(JSON.stringify(orderIds))}`,
      cancel_url: 'http://localhost:5173/cancel',
    });
    response.json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    response.status(500).json({ error: 'Failed to create checkout session' });
  }
});


// Error handling middleware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`App is listening to port:${process.env.PORT}`);
});
