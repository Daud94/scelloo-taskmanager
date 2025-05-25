import Joi from 'joi';

export const CreateTaskDto = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required'
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Description is required',
        'any.required': 'Description is required'
    }),
    dueDate: Joi.date().allow(null).messages({
        'date.base': 'Due date must be a valid date'
    }),
});

export default CreateTaskDto;
