import { purgeQueue, consumeReservation, initRabbitMQ } from './queueService.js';
import { checkInventory, reserveItem } from './inventoryService.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const processReservation = async (reservation, acknowledge) => {
  console.log(`Processing reservation for user ${reservation.user_id}, transaction ID: ${reservation.transaction_id}`);

  try {
    const healthCheck = await axios.get(`http://localhost:5001/api/v1/health-check`);
    console.log('Backend health check successful:', healthCheck.status);

    const canFulfill = checkInventory(reservation.product_id, reservation.quantity);
    if (canFulfill) {
      reserveItem(reservation.product_id, reservation.quantity);
      console.log(`Inventory check passed, reserving stock for product ID: ${reservation.product_id}`);

      await axios.post(`http://localhost:5001/api/v1/orders/reservationStatus`, {
        user_id: reservation.user_id,
        transaction_id: reservation.transaction_id,
        product_id: reservation.product_id,
        quantity: reservation.quantity,
        total_price: reservation.total_price,
        address: reservation.address,
        contact_details: reservation.contact_details,
        status: 'accepted',
      }, {
        headers: { 'x-api-key': process.env.WORKER_API_KEY },
      });
      console.log(`Reservation accepted for transaction ID: ${reservation.transaction_id}`);
    } else {
      console.log(`Inventory check failed for product ID: ${reservation.product_id}`);

      await axios.post(`http://localhost:5001/api/v1/orders/reservationStatus`, {
        user_id: reservation.user_id,
        transaction_id: reservation.transaction_id,
        product_id: reservation.product_id,
        status: 'failed',
        reason: 'Insufficient stock',
      }, {
        headers: { 'x-api-key': process.env.WORKER_API_KEY },
      });
      console.log(`Reservation rejected/failed for transaction ID: ${reservation.transaction_id}`);
    }
    acknowledge();
  } catch (error) {
    console.error("Error processing reservation:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    acknowledge(); 
  }
};

const startWorker = async () => {
  await initRabbitMQ();
  console.log("Worker started and listening for reservations...");
  // await purgeQueue();
  // console.log("Queue cleared (remove it if not needed)...");
  await consumeReservation((reservation, acknowledge) => {
    processReservation(reservation, acknowledge);
  });
};

startWorker();
