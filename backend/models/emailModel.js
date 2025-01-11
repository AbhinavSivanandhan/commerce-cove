import db from '../db/index.js';

export const createAccountEmail = async (user_id, email, verificationToken) => {
  const result = await db.query(
    'INSERT INTO account_email (user_id, email, verification_token) VALUES ($1, $2, $3) RETURNING *',
    [user_id, email, verificationToken]
  );
  return result.rows[0];
};

export const findAccountEmailByUserId = async (user_id) => {
  try {
    const result = await db.query('SELECT * FROM account_email WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      console.warn(`No email found for user_id: ${user_id}`);
      return null;
    }
    console.info(`Email record found for user_id: ${user_id}`);
    return result.rows[0];
  } catch (error) {
    console.error(`Error querying email for user_id: ${user_id}`, error);
    throw error;
  }
};

export const findAccountEmailByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM account_email WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.info(`No account found for email: ${email}`);
      return null;
    }
    console.info(`Account email record found for email: ${email}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error querying email by email:', error.message);
    throw error;
  }
};

export const findAccountEmailByToken = async (token) => {
  try {
    const result = await db.query(
      'SELECT * FROM account_email WHERE verification_token = $1',
      [token]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error querying email by token:', error.message);
    throw error;
  }
};

export const verifyAccountEmail = async (email_id) => {
  await db.query('UPDATE account_email SET verification_status = TRUE, verification_token = NULL WHERE email_id = $1', [email_id]);
};
