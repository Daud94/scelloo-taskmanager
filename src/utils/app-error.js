export class AppError extends Error {
    constructor(message, statusCode, errorCode = null, details = null) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            status: this.status,
            errorCode: this.errorCode,
            details: this.details,
            timestamp: this.timestamp,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }

    static badRequest(message = 'Bad Request', errorCode = null, details = null) {
        return new AppError(message, 400, errorCode, details);
    }

    static unauthorized(message = 'Unauthorized', errorCode = null, details = null) {
        return new AppError(message, 401, errorCode, details);
    }

    static forbidden(message = 'Forbidden', errorCode = null, details = null) {
        return new AppError(message, 403, errorCode, details);
    }

    static notFound(message = 'Not Found', errorCode = null, details = null) {
        return new AppError(message, 404, errorCode, details);
    }

    static conflict(message = 'Conflict', errorCode = null, details = null) {
        return new AppError(message, 409, errorCode, details);
    }

    static validation(message = 'Validation Error', details = null) {
        return new AppError(message, 422, 'VALIDATION_ERROR', details);
    }

    static internal(message = 'Internal Server Error', errorCode = null, details = null) {
        return new AppError(message, 500, errorCode, details);
    }
}

export default AppError;