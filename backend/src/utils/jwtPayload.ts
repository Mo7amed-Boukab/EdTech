import ApiError from './ApiError';
import { isRole, type Role } from '../types/user';
import type { AuthJwtPayload } from './jwt';

export function parseAuthPayload(payload: unknown): AuthJwtPayload {
  if (!payload || typeof payload !== 'object') {
    throw ApiError.unauthorized('Invalid token');
  }

  const { userId, email, role } = payload as Record<string, unknown>;

  if (typeof userId !== 'string' || typeof email !== 'string') {
    throw ApiError.unauthorized('Invalid token');
  }

  if (!isRole(role)) {
    throw ApiError.unauthorized('Invalid token');
  }

  return {
    userId,
    email,
    role: role.trim().toUpperCase() as Role,
  };
}
