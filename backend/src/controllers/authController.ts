import { Request, Response, NextFunction } from 'express';
import { login, register } from '../services/authService';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import ApiError from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password }: LoginDto = req.body;
      if (!email || !password) {
        throw ApiError.badRequest('Email and password are required');
      }
      const result = await login(email, password);
      ApiResponse.success(res, result, 'Login successful');
    } catch (err: any) {
      next(err instanceof ApiError ? err : ApiError.unauthorized(err.message));
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, password, role }: RegisterDto = req.body;
      if (!fullName || !email || !password || !role) {
        throw ApiError.badRequest('All fields are required');
      }
      const user = await register({ fullName, email, password, role });
      ApiResponse.created(res, user, 'User registered successfully');
    } catch (err: any) {
      next(err instanceof ApiError ? err : ApiError.badRequest(err.message));
    }
  }
}
