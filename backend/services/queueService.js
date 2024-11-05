import amqplib from 'amqplib';

const QUEUE_NAME = 'reservationQueue';
let channel = null;

export const initRabbitMQ = async () => {
  if (channel) return channel;

  try {
    const connection = await amqplib.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('Connected to RabbitMQ, Queue initialized:', QUEUE_NAME);
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    process.exit(1);
  }
  return channel;
};

export const enqueueReservation = async (reservation) => {
  if (!channel) await initRabbitMQ();
  await channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(reservation)), { persistent: true });
  console.log(`Enqueued reservation request for user ${reservation.user_id}, transaction ID: ${reservation.transaction_id}`);
};

export const consumeReservation = async (callback) => {
  if (!channel) await initRabbitMQ();
  channel.consume(
    QUEUE_NAME,
    (message) => {
      const reservation = JSON.parse(message.content.toString());
      console.log(`Received reservation from queue for transaction ID: ${reservation.transaction_id}`);
      callback(reservation, () => channel.ack(message));
    },
    { noAck: false }
  );
};

export const purgeQueue = async () => {
  if (!channel) await initRabbitMQ();
  await channel.purgeQueue(QUEUE_NAME);
  console.log(`Queue ${QUEUE_NAME} has been purged`);
};
