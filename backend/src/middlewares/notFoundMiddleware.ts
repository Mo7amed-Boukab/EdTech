import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, _next: NextFunction) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} does not exist`,
    });
}
