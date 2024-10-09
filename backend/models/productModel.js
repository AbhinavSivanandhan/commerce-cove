import db from '../db/index.js';

export const createProduct = async (productData) => {
  const { description, price, instock, seller_id, companyname } = productData;
  
  // Insert the new product and return the created product, including product_id
  const result = await db.query(
    `INSERT INTO product (description, price, instock, seller_id, companyname)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [description, price, instock, seller_id, companyname]
  );
  
  return result.rows[0];  // Return the newly created product with product_id
};


export const updateProduct = async (product_id, description, price, instock, seller_id, companyname) => {
  const result = await db.query(
    'UPDATE product SET description = $1, price = $2, instock = $3, seller_id = $4, companyname = $5 WHERE product_id = $6 RETURNING *',
    [description, price, instock, seller_id, companyname, product_id]
  );

  return result.rows[0]; // Return the updated product
};


export const deleteProduct = async (product_id) => {
  const result = await db.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [product_id]);
  return result.rows[0];
};

export const getProductById = async (product_id) => {
  const result = await db.query('SELECT * FROM product WHERE product_id = $1', [product_id]);
  return result.rows[0];
};

export const getProductBySearchTerm = async (searchTerm, limit, offset) => {
  // Query to get products matching the search term with pagination
  const result = await db.query(
    'SELECT * FROM product WHERE description LIKE $1 LIMIT $2 OFFSET $3',
    [`%${searchTerm}%`, limit, offset]
  );

  // Query to get the total count of products matching the search term
  const total = await db.query(
    'SELECT COUNT(*) FROM product WHERE description LIKE $1',
    [`%${searchTerm}%`]
  );

  // Return the products and the total count
  return { rows: result.rows || [], rowCount: parseInt(total.rows[0].count, 10) };
};

export const getAllProducts = async (limit, offset) => {
  const result = await db.query('SELECT * FROM product LIMIT $1 OFFSET $2', [limit, offset]);
  const total = await db.query('SELECT COUNT(*) FROM product');
  return { rows: result.rows || [], rowCount: parseInt(total.rows[0].count, 10) };
};
