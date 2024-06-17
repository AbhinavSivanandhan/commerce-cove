// validationMiddleware.js
export const validateRegister = (req, res, next) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  next();
};

export const validateProduct = (req, res, next) => {
  const { description, price, instock, seller_id, companyname } = req.body;
  if (!description || !price || !seller_id || !companyname) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  next();
};

export const validateOrder = (req, res, next) => {
  const { address, contact_details, inStockItems } = req.body;
  if (!address || !contact_details || !inStockItems || inStockItems.length === 0) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  next();
};