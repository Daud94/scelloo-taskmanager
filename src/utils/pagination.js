export function paginate(totalItems, limit, page) {
    const totalPages = Math.ceil(totalItems / limit)
    return {
        totalItems,
        totalPages,
        page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    }
}
