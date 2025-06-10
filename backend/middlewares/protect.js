import { query } from '../aws/awsClient.js'; // Adjust the import path as needed
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // PostgreSQL query to get the user by id
      const queryText = 'SELECT * FROM users WHERE id = $1';
      const result = await query(queryText, [decoded.id]);

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = result.rows[0];

      req.user = user; // ✅ Now you have full user info in req.user
      next();
    } else {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default { protect };