import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import ApiError from './ApiError';

export type AuthJwtPayload = {
  userId: string;
  email: string;
  role: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw ApiError.internal('JWT_SECRET is not defined');
  return secret;
}

export function generateToken(payload: object, options: SignOptions = {}): string {
  const secret = getJwtSecret();
  const mergedOptions: SignOptions = { expiresIn: '24h', ...options };
  return jwt.sign(payload, secret, mergedOptions);
}

export function generateRefreshToken(payload: object, options: SignOptions = {}): string {
  return generateToken(payload, { expiresIn: '7d', ...options });
}

export function verifyToken<TDecoded = JwtPayload>(token: string): TDecoded {
  const secret = getJwtSecret();

  try {
    return jwt.verify(token, secret) as TDecoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Invalid token');
    }
    throw error;
  }
}

