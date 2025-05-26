'use strict'
import * as bcrypt from 'bcryptjs'

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface /**Sequelize**/) => {
    await queryInterface.bulkInsert(
        'Users',
        [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                userType: 'admin',
                password: await bcrypt.hash('admin123', 10), // Hashing the password
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        {}
    )
}

export const down = async (queryInterface /**Sequelize**/) => {
    await queryInterface.bulkDelete('Users', null, {})
}

export default { up, down }
