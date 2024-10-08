import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token; // Corrected req.cookie to req.cookies

  if (!token) return next(errorHandler(401, "unauthorized"));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, "forbidden")); // Added missing parenthesis

    req.user = user;

    next();
  });
};
