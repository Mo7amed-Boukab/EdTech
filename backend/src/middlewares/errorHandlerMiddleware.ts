import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`, { stack: err.stack });
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}
