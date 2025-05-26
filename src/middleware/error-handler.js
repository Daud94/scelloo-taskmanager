import Joi from 'joi'
import AppError from '../utils/app-error.js'

const errorHandler = (err, req, res, next) => {
    // Log error with more context
    console.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    })

    // Joi validation errors
    if (err instanceof Joi.ValidationError) {
        const errors = err.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
        }))

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        })
    }

    // Handle AppError instances
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errorCode && { code: err.errorCode }),
            ...(err.details && { details: err.details }),
        })
    }

    // PostgreSQL/Sequelize errors
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((error) => ({
            field: error.path,
            message: error.message,
        }))
        console.error('Database validation failed', errors)
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors,
        })
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field'
        console.error('Database unique constraint failed', field)
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            code: 'UNIQUE_CONSTRAINT_ERROR',
            field,
        })
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        console.error('Invalid foreign key reference', 'FOREIGN_KEY_ERROR')
        return res.status(400).json({
            success: false,
            message: 'Invalid reference to a related resource',
            code: 'FOREIGN_KEY_ERROR',
        })
    }
    if (err.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
            success: false,
            message: 'Database error occurred',
            code: 'DATABASE_ERROR',
        })
    }

    // Default error response
    const statusCode = err.statusCode || err.status || 500
    const message = statusCode === 500 ? 'Internal server error' : err.message

    return res.status(statusCode).json({
        success: false,
        message,
        ...(err.errorCode && { code: err.errorCode }),
        ...(err.details && { details: err.details }),
    })
}

export default errorHandler
