import Joi from 'joi';

export const UpdateTaskDto = Joi.object({
    title: Joi.string().messages({
        'string.empty': 'Title cannot be empty'
    }),
    description: Joi.string().messages({
        'string.empty': 'Description cannot be empty'
    }),
    status: Joi.string().valid('pending', 'completed', 'in-progress').messages({
        'string.empty': 'Status cannot be empty',
        'any.only': 'Status must be one of: pending, completed, in-progress'
    }),
    dueDate: Joi.date().allow(null).messages({
        'date.base': 'Due date must be a valid date'
    }),
    startTime: Joi.date().allow(null).messages({
        'date.base': 'Start time must be a valid date'
    }),
    endTime: Joi.date().allow(null).messages({
        'date.base': 'End time must be a valid date'
    }),
    timeSpent: Joi.number().integer().min(0).allow(null).messages({
        'number.base': 'Time spent must be a number',
        'number.integer': 'Time spent must be an integer',
        'number.min': 'Time spent cannot be negative'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

export default UpdateTaskDto;
