import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const {
    DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT
} = process.env;
const config = {
    development: {
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        host: DB_HOST,
        port: +DB_PORT,
        dialect: 'postgres',
        dialectOptions: {
            bigNumberStrings: true,
            ssl: {
                require: false,
                rejectUnauthorized: false,
            }
        },
    },
};

export default config;