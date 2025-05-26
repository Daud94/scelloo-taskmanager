import Joi from 'joi'

export const CreateTaskDto = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
    }),
    startDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Start date must be a valid date',
            'any.required': 'Start date is required',
        })
        .custom((value, helpers) => {
            if (value) {
                return new Date(value)
            }
            return helpers.error('Invalid date format')
        }),
    dueDate: Joi.date()
        .required()
        .messages({
            'date.base': 'Due date must be a valid date',
            'any.required': 'Due date is required',
        })
        .custom((value, helpers) => {
            if (value) {
                return new Date(value)
            }
            return helpers.error('Invalid date format')
        }),
})

export default CreateTaskDto
