import Joi from 'joi'

export const UpdateTaskDto = Joi.object({
    title: Joi.string().optional().messages({
        'string.empty': 'Title cannot be empty',
        'any.required': 'Title is required if provided',
    }),
    description: Joi.string().optional().messages({
        'string.empty': 'Description cannot be empty',
        'any.required': 'Description is required if provided',
    }),
    startDate: Joi.date()
        .optional()
        .messages({
            'date.base': 'Start date must be a valid date',
            'any.required': 'Start date is required if provided',
        })
        .custom((value, helpers) => {
            if (value) {
                return new Date(value)
            }
            return helpers.error('Invalid date format')
        }),
    endDate: Joi.date()
        .optional()
        .messages({
            'date.base': 'End date must be a valid date',
            'any.required': 'End date is required if provided',
        })
        .custom((value, helpers) => {
            if (value) {
                return new Date(value)
            }
            return helpers.error('Invalid date format')
        }),
    dueDate: Joi.date()
        .optional()
        .messages({
            'date.base': 'Due date must be a valid date',
            'any.required': 'Due date is required if provided',
        })
        .custom((value, helpers) => {
            if (value) {
                return new Date(value)
            }
            return helpers.error('Invalid date format')
        }),
})
    .min(1)
    .messages({
        'object.min': 'At least one field must be provided for update',
    })

export default UpdateTaskDto
