import Joi from 'joi'

export const TaskQueryDto = Joi.object({
    title: Joi.string().optional().messages({
        'string.empty': 'Title cannot be empty if provided',
    }),
    description: Joi.string().optional().messages({
        'string.empty': 'Description cannot be empty if provided',
    }),
    startDate: Joi.date().optional().messages({
        'date.base': 'Start date must be a valid date',
    }),
    endDate: Joi.date().optional().messages({
        'date.base': 'End date must be a valid date',
    }),
    status: Joi.string()
        .valid('pending', 'in-progress', 'completed')
        .optional()
        .messages({
            'any.only':
                'Status must be one of: pending, in-progress, completed',
        }),
    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
        'any.required': 'Page is required if provided',
    }),
    limit: Joi.number().min(10).max(100).default(10).optional().messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 10',
        'number.max': 'Limit must not exceed 100',
        'any.required': 'Limit is required if provided',
    }),
})

export default TaskQueryDto
