import db from '../database/models/index.js'

const { User } = db.sequelize.models

class UsersService {
    async findOne(where) {
        return await User.findOne({
            where: where,
        })
    }

    async create(data) {
        return User.create(data)
    }

    async getProfile(userId) {
        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude: ['password'] }, // Exclude password from profile
        })
        if (!user) {
            throw new Error('User not found')
        }
        return user
    }
}

export default UsersService
