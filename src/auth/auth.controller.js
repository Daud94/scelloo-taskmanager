import express from 'express';
import {AuthService} from "./auth.service.js";

const router = express.Router();
import {Body} from "../validators/index.js";
import {CreateUserDto} from "../users/index.js";
import {LoginDto} from "./dtos/index.js";
import {AuthMiddleware} from "../middleware/index.js";

const authService = new AuthService();

router.post('/register', Body(CreateUserDto), async (req, res, next) => {
    try {
        await authService.register(req.body);
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
        });
    } catch (error) {
        next(error);
    }
});

router.post('/login', Body(LoginDto), async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Protected route example
router.get('/me', AuthMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user
        }
    });
});

export default router;
