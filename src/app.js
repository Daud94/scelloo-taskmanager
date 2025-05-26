import express from 'express'
import { NotFound, ErrorHandler } from './middleware/index.js'
import authController from './auth/auth.controller.js'
import tasksController from './tasks/tasks.controller.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authController)
app.use('/tasks', tasksController)

// catch 404
app.use(NotFound)

// error handler
app.use(ErrorHandler)

export default app
