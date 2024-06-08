import db from '../db/index.js';

export const createProduct = async (description, price, instock, seller_id, companyname) => {
  const result = await db.query(
    'INSERT INTO product (description, price, instock, seller_id, companyname) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [description, price, instock, seller_id, companyname]
  );
  return result.rows[0];
};

export const updateProduct = async (product_id, description, price, instock, seller_id, companyname) => {
  const result = await db.query(
    'UPDATE product SET description = $1, price = $2, instock = $3, seller_id = $4, companyname = $5 WHERE product_id = $6 RETURNING *',
    [description, price, instock, seller_id, companyname, product_id]
  );
  return result.rows[0];
};

export const deleteProduct = async (product_id) => {
  const result = await db.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [product_id]);
  return result.rows[0];
};

export const getProductById = async (product_id) => {
  const result = await db.query('SELECT * FROM product WHERE product_id = $1', [product_id]);
  return result.rows[0];
};

export const getAllProducts = async () => {
  const result = await db.query('SELECT * FROM product');
  return result.rows;
};
