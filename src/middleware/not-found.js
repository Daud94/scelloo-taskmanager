const notFound = (req, res, next) => {
    try {
        return res.status(404).json({
            success: false,
            message: 'Route not found',
        })
    } catch (err) {
        next(err)
    }
}
export default notFound
