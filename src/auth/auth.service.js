import { UsersService } from '../users/index.js'
import * as bcrypt from 'bcryptjs'
import { AppError } from '../utils/index.js'
// import dotenv from 'dotenv'
// dotenv.config()
import jwt from 'jsonwebtoken'

export class AuthService {
    constructor() {
        this.usersService = new UsersService()
        this.JWT_SECRET = process.env.JWT_SECRET
    }

    async register(payload) {
        const existingUser = await this.usersService.findOne({
            email: payload.email,
        })
        if (existingUser) {
            throw AppError.conflict('User already exists')
        }
        const hashedPassword = await bcrypt.hash(payload.password, 10)
        await this.usersService.create({
            ...payload,
            userType: 'user',
            password: hashedPassword,
        })
    }

    async login(payload) {
        const user = await this.usersService.findOne({ email: payload.email })
        if (!user) {
            throw AppError.unauthorized('Invalid email')
        }

        const isPasswordValid = await bcrypt.compare(
            payload.password,
            user.password
        )
        if (!isPasswordValid) {
            throw AppError.unauthorized('Invalid credentials')
        }

        const token = jwt.sign(
            { userId: user.id, userType: user.userType },
            this.JWT_SECRET,
            { expiresIn: '24h' }
        )

        return token
    }
}
