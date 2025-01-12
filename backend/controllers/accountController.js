import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createUser, findUserByUsername, updateUserPassword, savePasswordResetToken, findUserByResetToken } from '../models/userModel.js';
import { createAccountEmail, findAccountEmailByUserId, verifyAccountEmail, findAccountEmailByEmail, findAccountEmailByToken } from '../models/emailModel.js';
import { generateVerificationToken } from '../utils/tokenUtils.js';
import { nanoid } from 'nanoid';

dotenv.config();

const {
  JWT_SECRET,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL,
  ENABLE_EMAIL_VERIFICATION,
  EMAIL_HOST,
  EMAIL_PORT,
} = process.env;

const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: false, // Set this to `true` if you're testing over HTTPS
  sameSite: 'Strict',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const registerUser = async (req, res) => {
  const { username, password, role, email } = req.body;

  console.info('Incoming registration request:', { username, role, email });

  if (!username || !password || !role || !email) {
    console.warn('Missing required fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email is already registered
    const existingEmailRecord = await findAccountEmailByEmail(email);
    if (existingEmailRecord) {
      console.warn('Duplicate email detected:', email);
      return res.status(400).json({ message: 'This email is already associated with another account.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.info('Password hashed successfully');

    const user = await createUser(username, hashedPassword, role);
    console.info('User created successfully:', user);

    if (ENABLE_EMAIL_VERIFICATION === 'true') {
      const verificationToken = generateVerificationToken();
      await createAccountEmail(user.user_id, email, verificationToken);

      const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
      console.info('Sending verification email to:', email);

      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST, 
        port: EMAIL_PORT || 587, 
        secure: EMAIL_PORT == 465, 
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: EMAIL_USER,
        to: email,
        subject: 'Email Verification for CommerceCove',
        text: `Verify your email by clicking on the following link: ${verificationUrl}`,
      });

      console.info('Verification email sent successfully');
      res.status(201).json({ message: 'Registration successful. Verify your email to login.' });
    } else {
      console.warn('Email verification is disabled');
      await createAccountEmail(user.user_id, email, null, true);
      res.status(201).json({ message: 'Registration successful.' });
    }
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL duplicate key error
      console.warn('Duplicate email registration attempt:', email);
      return res.status(400).json({ message: 'This email is already associated with another account.' });
    }
    console.error('Error during registration:', error.message);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.warn('Missing required fields for login');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      console.warn(`User not found: ${username}`);
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const userEmail = await findAccountEmailByUserId(user.user_id);
    if (!userEmail) {
      console.warn(`Email not found for user_id: ${user.user_id}`);
      return res.status(403).json({ message: 'Email not found. Please register your email.' });
    }

    if (ENABLE_EMAIL_VERIFICATION === 'true' && !userEmail.verification_status) {
      console.warn(`Email not verified for user_id: ${user.user_id}`);
      return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.warn(`Invalid password for username: ${username}`);
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role, verified: userEmail.verification_status },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, COOKIE_SETTINGS);
    res.cookie('role', user.role, COOKIE_SETTINGS);

    console.info(`Login successful for user_id: ${user.user_id}`);
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const getStatus = (req, res) => {
  console.info('Incoming request to /accounts/status');
  console.info('Cookies received:', req.cookies);

  const token = req.cookies.token;
  if (!token) {
    console.warn('No token found in cookies');
    return res.status(401).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.info('Decoded JWT payload:', decoded);
    res.json({ user: decoded });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ user: null });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  console.info('Verifying email with token:', token);

  if (!token) {
    console.warn('Missing token in request');
    return res.status(400).json({ message: 'Invalid or missing token.' });
  }

  try {
    // Query email by verification token
    const emailRecord = await findAccountEmailByToken(token); // Use a new model function
    if (!emailRecord) {
      console.warn('Invalid or expired token');
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Mark the email as verified
    await verifyAccountEmail(emailRecord.email_id);
    console.info('Email verified successfully for email_id:', emailRecord.email_id);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error.message);
    res.status(500).json({ message: 'Error verifying email.' });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userEmailRecord = await findAccountEmailByEmail(email);
    if (!userEmailRecord) {
      console.warn('Password reset requested for non-existent email:', email);
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const resetToken = nanoid(32);
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Set token expiry to 1 hour from now
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await savePasswordResetToken(userEmailRecord.user_id, resetToken, tokenExpiry);

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT || 587,
      secure: EMAIL_PORT == 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Reset Your Password for CommerceCove',
      text: `You can reset your password by clicking on this link: ${resetUrl}. This link will expire in 1 hour.`,
    });

    console.info('Password reset email sent successfully:', email);
    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error during password reset request:', error.message);
    res.status(500).json({ message: 'Error requesting password reset' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  try {
    const user = await findUserByResetToken(token);
    if (!user) {
      console.warn('Invalid or expired reset token:', token);
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expiry)) {
      console.warn('Expired reset token for user_id:', user.user_id);
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.user_id, hashedPassword);

    // Clear the reset token and expiry
    await savePasswordResetToken(user.user_id, null, null);

    console.info('Password reset successfully for user_id:', user.user_id);
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error.message);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};
