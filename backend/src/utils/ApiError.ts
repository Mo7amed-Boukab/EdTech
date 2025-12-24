/**
 * Custom Error Class
 * Permet de créer des erreurs personnalisées avec status code et message
 */

export default class ApiError extends Error {
    statusCode: number;
    errors?: string[] | null;

    constructor(statusCode: number, message: string, errors: string[] | null = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = 'ApiError';
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Bad Request', errors: string[] | null = null) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }
    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }
    static internal(message = 'Internal Server Error') {
        return new ApiError(500, message);
    }
}
