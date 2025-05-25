import Joi from 'joi';

export const LoginDto = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});