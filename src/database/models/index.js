import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'
import { fileURLToPath, pathToFileURL } from 'url'
import config from '../config/config.js'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const envConfig = config[env]
const db = {}

const sequelize = new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    envConfig
)

const files = fs
    .readdirSync(__dirname)
    .filter(
        (file) =>
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
    )

for (const file of files) {
    const filePath = path.join(__dirname, file)
    const fileUrl = pathToFileURL(filePath).href
    const modelModule = await import(fileUrl)
    const ModelClass = modelModule.default

    // Initialize the model using the static initModel method
    const model = ModelClass.initModel(sequelize)
    db[model.name] = model
}

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

export default db
