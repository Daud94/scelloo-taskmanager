import {UsersService} from "../users/index.js";
import * as bcrypt from 'bcryptjs'
import {AppError} from "../utils/index.js";
import jwt from 'jsonwebtoken';

export class AuthService {
    constructor() {
        this.usersService = new UsersService();
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    }

    async register(payload) {
        const existingUser = await this.usersService.findOne({where: {email: payload.email}});
        if (existingUser) {
            throw AppError.conflict('User already exists')
        }
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        await this.usersService.create({
            ...payload,
            password: hashedPassword,
        });
    }

    async login(payload) {
        const user = await this.usersService.findOne({where: {email: payload.email}});
        if (!user) {
            throw AppError.unauthorized('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(payload.password, user.password);
        if (!isPasswordValid) {
            throw AppError.unauthorized('Invalid credentials');
        }

        const token = jwt.sign(
            {id: user.id,}, this.JWT_SECRET, {expiresIn: '24h'}
        );

        return token;
    }
}
