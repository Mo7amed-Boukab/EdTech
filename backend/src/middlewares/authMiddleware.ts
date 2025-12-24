import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { AuthJwtPayload, verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: AuthJwtPayload;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next(ApiError.unauthorized('Missing token'));

  try {
    req.user = verifyToken<AuthJwtPayload>(token);
    next();
  } catch (err: any) {
    next(err instanceof ApiError ? err : ApiError.unauthorized(err.message));
  }
}

export function authorizeRoles(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Forbidden'));
    }
    next();
  }; 
}
