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
  try {
    console.log('Starting product update in DB...');
    console.log('Product ID:', product_id);
    console.log('New product data:', { description, price, instock, seller_id, companyname });

    const result = await db.query(
      'UPDATE product SET description = $1, price = $2, instock = $3, seller_id = $4, companyname = $5 WHERE product_id = $6 RETURNING *',
      [description, price, instock, seller_id, companyname, product_id]
    );

    console.log('Database update result:', result.rows[0]); // Log result from DB

    return result.rows[0]; // Return the updated product
  } catch (error) {
    console.error('Error updating product in DB:', error); // Log DB error
    throw error; // Rethrow error to be caught in the controller
  }
};


export const deleteProduct = async (product_id) => {
  const result = await db.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [product_id]);
  return result.rows[0];
};

export const getProductById = async (product_id) => {
  const result = await db.query('SELECT * FROM product WHERE product_id = $1', [product_id]);
  return result.rows[0];
};

export const getAllProducts = async (limit, offset) => {
  const result = await db.query('SELECT * FROM product LIMIT $1 OFFSET $2', [limit, offset]);
  const total = await db.query('SELECT COUNT(*) FROM product');
  return { rows: result.rows || [], rowCount: parseInt(total.rows[0].count, 10) };
};
