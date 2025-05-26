import { AppError } from '../utils/index.js'

/**
 * Middleware to check if the user has the required role
 * @param {string|string[]} roles - Required role(s) to access the endpoint
 * @returns {function} - Express middleware function
 */
export const RoleMiddleware = (roles) => {
    return (req, res, next) => {
        try {
            // Check if user exists in request (set by AuthMiddleware)
            if (!req.user) {
                throw AppError.unauthorized('Authentication required')
            }

            // Convert roles to array if it's a single string
            const requiredRoles = Array.isArray(roles) ? roles : [roles]

            // Check if user has one of the required roles
            if (!requiredRoles.includes(req.user.userType)) {
                throw AppError.forbidden(
                    'You do not have permission to access this resource'
                )
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}
