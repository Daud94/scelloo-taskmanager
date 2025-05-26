import express from 'express'
import { AuthService } from './auth.service.js'

const router = express.Router()
import { Body } from '../validators/index.js'
import { CreateUserDto, UsersService } from '../users/index.js'
import { LoginDto } from './dtos/index.js'
import { AuthMiddleware } from '../middleware/index.js'

const authService = new AuthService()
const usersService = new UsersService()

router.post('/register', Body(CreateUserDto), async (req, res, next) => {
    try {
        await authService.register(req.body)
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
        })
    } catch (error) {
        next(error)
    }
})

router.post('/login', Body(LoginDto), async (req, res, next) => {
    try {
        const token = await authService.login(req.body)
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            authToken: token,
        })
    } catch (error) {
        next(error)
    }
})

// Protected route example
router.get('/me', AuthMiddleware, async (req, res, next) => {
    try {
        const user = await usersService.getProfile(req.userId)
        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                user: user,
            },
        })
    } catch (error) {
        next(error)
    }
})

export default router
