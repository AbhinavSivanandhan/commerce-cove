import { createProduct, updateProduct, deleteProduct, getProductById, getAllProducts } from '../models/productModel.js';

export const createProductController = async (req, res) => {
  try {
    const { description, price, instock, seller_id, companyname } = req.body;
    const product = await createProduct(description, price, instock, seller_id, companyname);
    res.status(201).json({ status: "success", data: { product } });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { product_id, description, price, instock, seller_id, companyname } = req.body;
    const product = await updateProduct(product_id, description, price, instock, seller_id, companyname);
    res.status(200).json({ status: "success", data: { product } });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await deleteProduct(id);
    res.status(200).json({ status: "success", data: { product } });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    res.status(200).json({ status: "success", data: { product } });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { rows: products, rowCount } = await getAllProducts(limit, offset);
    const totalPages = Math.ceil(rowCount / limit);    
    res.status(200).json({ 
      status: "success", 
      data: { 
        products, 
        totalPages, 
        currentPage: page 
      } 
    });
    } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
