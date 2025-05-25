export const Param = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req.params);
            next();
        } catch (e) {
            next(e);
        }
    };
};