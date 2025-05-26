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
})

export default TaskQueryDto
