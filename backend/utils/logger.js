import winston from 'winston';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const {
  LOG_FILE_MAX_SIZE_MB = 10,
  LOG_ALERT_THRESHOLD_MB = 8,
  LOG_RETENTION_DAYS = 7,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT,
  ALERT_EMAIL,
} = process.env;

// Resolve __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirectory = path.resolve(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const logFilePath = path.join(logDirectory, 'combined.log');

const transport = new winston.transports.File({
  filename: logFilePath,
  maxsize: LOG_FILE_MAX_SIZE_MB * 1024 * 1024, // Convert MB to bytes
  maxFiles: 5,
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const checkLogFileSize = () => {
  try {
    const stats = fs.statSync(logFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > LOG_ALERT_THRESHOLD_MB) {
      console.warn(`Log file size exceeds threshold: ${fileSizeMB.toFixed(2)} MB`);
      sendAlertEmail(fileSizeMB);
    }
  } catch (error) {
    console.error('Error checking log file size:', error.message);
  }
};

const sendAlertEmail = async (fileSizeMB) => {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT || 587,
    secure: EMAIL_PORT == 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to: ALERT_EMAIL,
      subject: `Log File Overflow Alert`,
      text: `The log file has reached ${fileSizeMB.toFixed(
        2
      )} MB, exceeding the threshold. Please take action.`,
      attachments: [
        {
          filename: 'combined.log',
          path: logFilePath,
        },
      ],
    });
    console.info('Alert email sent successfully');
  } catch (error) {
    console.error('Error sending alert email:', error.message);
  }
};

const cleanOldLogs = () => {
  const retentionPeriod = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const now = Date.now();

  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error('Error reading log directory:', err.message);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(logDirectory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err.message);
          return;
        }

        if (now - stats.mtimeMs > retentionPeriod) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting old log file:', err.message);
            } else {
              console.info('Deleted old log file:', filePath);
            }
          });
        }
      });
    });
  });
};

// Periodically check log size and clean old logs
setInterval(checkLogFileSize, 60 * 60 * 1000); // Check every hour
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000); // Clean logs daily

export default logger;
