export const Body = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req.body);
            next();
        } catch (e) {
            next(e);
        }
    };
};