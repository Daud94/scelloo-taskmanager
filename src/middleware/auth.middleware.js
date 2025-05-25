import jwt from 'jsonwebtoken';
import { AppError } from '../utils/index.js';

export const AuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw AppError.unauthorized('Authentication required');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw AppError.unauthorized('Authentication required');
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Add user info to request object
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            next(AppError.unauthorized('Invalid or expired token'));
        } else {
            next(error);
        }
    }
};