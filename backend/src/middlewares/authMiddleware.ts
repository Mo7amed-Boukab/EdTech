import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { AuthJwtPayload, verifyToken } from "../utils/jwt";
import { isRole, type Role } from "../types/user";
import { parseAuthPayload } from "../utils/jwtPayload";

export interface AuthRequest extends Request {
  user?: AuthJwtPayload;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) return next(ApiError.unauthorized("Missing token"));

  try {
    const decoded = verifyToken(token);
    req.user = parseAuthPayload(decoded);
    next();
  } catch (err: any) {
    next(err instanceof ApiError ? err : ApiError.unauthorized('Invalid token'));
  }
}

export function authorizeRoles(roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Forbidden"));
    }
    next();
  };
}
