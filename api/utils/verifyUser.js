import { errorHandler } from "./error.js";
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // ✅ Correct: read from cookies or header
  const token = req.cookies?.access_token || req.headers['authorization']?.split(" ")[1];

  if (!token) return next(errorHandler(401, 'Unauthorized')); // token missing

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, 'Forbidden')); // token invalid/expired

    req.user = user; // attach decoded user info
    next();
  });
};