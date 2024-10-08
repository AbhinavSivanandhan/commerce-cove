import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '../models/productModel.js';
import { addProductImage, getProductImages, deleteProductImages, deleteProductImageByUrl } from '../models/productImageModel.js';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create product with images
export const createProductController = async (req, res) => {
  try {
    // Extract product fields from the request body
    const { description, price, instock, seller_id, companyname, images } = req.body;

    // Validate required fields
    if (!description || !price || !seller_id || !companyname) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Create the product in the database
    const newProduct = await createProduct({
      description,
      price,
      instock,
      seller_id,
      companyname,
    });

    // If product creation is successful, proceed with image handling
    if (images && images.length) {
      for (const imageUrl of images) {
        // Step 2: Save the image with the associated product_id
        await addProductImage(newProduct.product_id, imageUrl);
      }
    }

    // Step 3: Send the response with the new product details
    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

// Get all products with their images
export const getAllProductsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get products and total count with pagination
    const { rows: products, rowCount } = await getAllProducts(limit, offset);

    // If no products, return an empty array
    if (!products || products.length === 0) {
      return res.status(200).json({ 
        status: "success", 
        data: { products: [], totalPages: 0, currentPage: page } 
      });
    }

    // Attach images to each product
    const productsWithImages = await Promise.all(products.map(async (product) => {
      const images = await getProductImages(product.product_id);
      return { ...product, images: images || [] }; // Fallback to empty array if no images
    }));

    const totalPages = Math.ceil(rowCount / limit);

    res.status(200).json({ 
      status: "success", 
      data: { 
        products: productsWithImages, 
        totalPages, 
        currentPage: page 
      } 
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};


// Get a single product by ID
export const getProductByIdController = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId);
    const images = await getProductImages(productId);

    res.json({ ...product, images });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
};

// Update product
export const updateProductController = async (req, res) => {
  try {
    const productId = req.params.id; // Extract product ID from request params
    const { description, price, instock, seller_id, companyname, images } = req.body; // Destructure product details from request body
    // Update the product with the new details
    const updatedProduct = await updateProduct(productId, description, price, instock, seller_id, companyname);
    // Handle images if provided
    if (images) {
      // First delete old images
      await deleteProductImages(productId);
      // Add new images
      for (const imageUrl of images) {
        await addProductImage(productId, imageUrl);
      }
    }
    // Respond with the updated product details
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error); // Log the error
    res.status(500).json({ error: 'Error updating product' });
  }
};


// Delete product and its images
export const deleteProductController = async (req, res) => {
  const { productId } = req.params;

  try {
    // Step 1: Fetch the associated images for the product
    const images = await getProductImages(productId);

    // Step 2: Delete each image from the S3 bucket
    await Promise.all(images.map(async (image) => {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: image.image_url.split('/').pop()
      };
      await s3.deleteObject(params).promise();
    }));

    // Step 3: Delete images from the database
    await deleteProductImages(productId);

    // Step 4: Delete the product itself
    await deleteProduct(productId);
    res.status(200).json({ message: 'Product and associated images deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

export const deleteProductImage = async (req, res) => {
  const { id: productId } = req.params;
  const { imageUrl } = req.body;

  try {
    // Delete from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageUrl.split('/').pop() // Extract the image file name from URL
    };
    await s3.deleteObject(params).promise();
    console.log(`Successfully deleted image from S3: ${imageUrl}`);

    // Delete from the database
    //await db.query(`DELETE FROM product_images WHERE product_id = $1 AND image_url = $2`, [id, imageUrl]);
    await deleteProductImageByUrl(productId, imageUrl);
    console.log('deleted img using sql query')
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Error deleting image' });
  }
};

// Generate presigned URL for image upload
export const generatePresignedUrl = async (req, res) => {
  const { filename, filetype } = req.body;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Expires: 60, // 1 minute expiry
    ContentType: filetype
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    res.json({ url, imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error generating presigned URL' });
  }
};

export const addImagesToProduct = async (req, res) => {
  const { id } = req.params;  // Extract product_id from the URL
  const { images } = req.body;

  if (!images || !images.length) {
    return res.status(400).json({ error: 'No images provided' });
  }

  try {
    // Save each image associated with the product_id
    for (const imageUrl of images) {
      await addProductImage(id, imageUrl);
    }

    res.status(201).json({ message: 'Images successfully added to product' });
  } catch (error) {
    console.error('Error adding images to product:', error);
    res.status(500).json({ error: 'Error adding images to product' });
  }
};
