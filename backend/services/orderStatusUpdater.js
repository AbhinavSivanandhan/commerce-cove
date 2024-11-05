// orderStatusUpdater.js
import db from '../db/index.js'; // Import your DB connection
import cron from 'node-cron';

const TIME_LIMIT_MINUTES = 20;

// Function to find and update stale accepted orders
const updateStaleAcceptedOrders = async () => {
  try {
    console.log('Running job to update stale accepted orders');

    // Get the current timestamp and calculate the cutoff time
    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - TIME_LIMIT_MINUTES * 60000);

    // Query for accepted orders that were created more than 20 minutes ago
    const { rows: staleOrders } = await db.query(
      `SELECT order_id FROM order_history WHERE status = 'accepted' AND created_at <= $1 FOR UPDATE SKIP LOCKED`,
      [cutoffTime]
    );

    if (staleOrders.length === 0) {
      console.log('No stale accepted orders found.');
      return;
    }

    // Lock and mark each stale order as failed
    const orderIds = staleOrders.map(order => order.order_id);
    const result = await db.query(
      `UPDATE order_history SET status = 'failed' WHERE order_id = ANY($1) RETURNING order_id`,
      [orderIds]
    );

    console.log(`Updated ${result.rows.length} stale orders to "failed".`);
  } catch (error) {
    console.error('Error updating stale accepted orders:', error);
  }
};

// Schedule the job to run every 20 minutes
cron.schedule('*/20 * * * *', updateStaleAcceptedOrders);

console.log('Stale accepted order updater job scheduled to run every 20 minutes.');
