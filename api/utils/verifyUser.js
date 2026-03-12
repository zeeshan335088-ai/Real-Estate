import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';


// Middleware to verify JWT token from cookies
export const verifyToken = (req, res, next) => {
  try {
    // Read token from cookies
    const token = req.cookies?.access_token;
    
    if (!token) {
      // No token → user not logged in
      return next(errorHandler(401, 'Unauthorized'));
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
      if (err) {
        // Token invalid or expired
        return next(errorHandler(403, 'Forbidden'));
      }

      // Attach decoded user info to request object
      req.user = decodedUser;
      next();
    });
  } catch (err) {
    // Catch unexpected errors
    console.error('verifyToken error:', err);
    return next(errorHandler(500, 'Internal Server Error'));
  }
};