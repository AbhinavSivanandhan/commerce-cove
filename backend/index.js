import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/index.js';
import accountRoutes from './routes/accountRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import errorHandler from './middleware/errorMiddleware.js'; // Import error handler

dotenv.config();

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

// Routes
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/carts', cartRoutes);
app.use('/api/v1/orders', orderRoutes);

app.get('/', (request, response) => {
  return response.send('Welcome to CommerceCove');
});

// Error handling middleware
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`App is listening to port:${process.env.PORT}`);
});
