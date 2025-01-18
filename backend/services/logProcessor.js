import amqp from 'amqplib';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { RABBITMQ_URL, LOG_EXCHANGE = 'logs' } = process.env;

(async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(LOG_EXCHANGE, 'fanout', { durable: true });

    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, LOG_EXCHANGE, '');

    console.log('Log processor started, listening for logs...');
    channel.consume(
      queue,
      (message) => {
        const log = message.content.toString();
        const logFile = path.join(__dirname, '../logs/processed.log');

        // Append logs to a file
        fs.appendFile(logFile, `${log}\n`, (err) => {
          if (err) console.error('Error writing log:', err.message);
        });

        console.log('Log processed:', log);
        channel.ack(message);
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Error in log processor:', error.message);
    process.exit(1);
  }
})();
