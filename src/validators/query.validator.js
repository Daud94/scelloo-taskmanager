export const Query = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req.query);
            next();
        } catch (e) {
            next(e);
        }
    };
};