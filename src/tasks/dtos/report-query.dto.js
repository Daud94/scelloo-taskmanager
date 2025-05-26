import Joi from 'joi'

export const ReportQueryDto = Joi.object({
    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().min(10).max(100).default(10).optional().messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 10',
        'number.max': 'Limit must not exceed 100',
    }),
})

export default ReportQueryDto
