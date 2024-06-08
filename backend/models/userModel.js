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
