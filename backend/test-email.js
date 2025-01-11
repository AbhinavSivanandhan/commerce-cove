import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // Use SSL/TLS for port 465
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Verification Error:', error);
  } else {
    console.info('SMTP is ready to send emails:', success);
  }
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    });
    console.info('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Example usage:
sendEmail('example@gmail.com', 'Test Email', 'This is a test email.'); 

export default sendEmail;
