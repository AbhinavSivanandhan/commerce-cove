import db from '../db/index.js';

export const addProductImage = async (productId, imageUrl) => {
  const result = await db.query(
    `INSERT INTO product_images (product_id, image_url)
     VALUES ($1, $2) RETURNING *`,
    [productId, imageUrl]
  );
  return result.rows[0];
};

export const getProductImages = async (productId) => {
  const result = await db.query(`SELECT * FROM product_images WHERE product_id = $1`, [productId]);
  return result.rows || [];
};

// Delete all images associated with a product
export const deleteProductImages = async (productId) => {
  await db.query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
};

// Delete a specific image by productId and imageUrl (for editing)
export const deleteProductImageByUrl = async (productId, imageUrl) => {
  await db.query(`DELETE FROM product_images WHERE product_id = $1 AND image_url = $2`, [productId, imageUrl]);
};
