import db from '../db/index.js';

export const createUser = async (username, password, role) => {
  const result = await db.query(
    'INSERT INTO account (username, password, role) VALUES ($1, $2, $3) RETURNING *',
    [username, password, role]
  );
  return result.rows[0];
};

export const findUserByUsername = async (username) => {
  const result = await db.query('SELECT * FROM account WHERE username = $1', [username]);
  return result.rows[0];
};

export const savePasswordResetToken = async (user_id, token, expiryTime) => {
  try {
    await db.query(
      'UPDATE account_email SET verification_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
      [token, expiryTime, user_id]
    );
    console.info('Reset token and expiry updated successfully for user_id:', user_id);
  } catch (error) {
    console.error('Error updating reset token and expiry:', error.message);
    throw error;
  }
};

export const findUserByResetToken = async (token) => {
  const result = await db.query(
    'SELECT a.* FROM account a JOIN account_email e ON a.user_id = e.user_id WHERE e.verification_token = $1',
    [token]
  );
  return result.rows[0];
};

export const updateUserPassword = async (user_id, newPassword) => {
  await db.query('UPDATE account SET password = $1 WHERE user_id = $2', [newPassword, user_id]);
};

