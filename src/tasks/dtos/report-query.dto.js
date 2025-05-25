import Joi from 'joi';

export const ReportQueryDto = Joi.object({
    startDate: Joi.date().messages({
        'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().messages({
        'date.base': 'End date must be a valid date'
    })
});

export default ReportQueryDto;