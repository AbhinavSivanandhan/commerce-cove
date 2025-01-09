import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;

const authMiddleware = (roles) => {
  return (req, res, next) => {
    const token = req.cookies.token; // Extract token from cookies
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to authenticate token' });
      }

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'You do not have access to this resource' });
      }

      req.user = decoded;
      next();
    });
  };
};

export default authMiddleware;
