import { Request, Response, NextFunction } from 'express';
import { createUser, getAllUsers, assignStudentToClass } from '../services/userService';
import ApiError from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { CreateUserDto, AssignClassDto } from '../dtos/user.dto';

export class UserController {

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { fullName, email, password, role, classId }: CreateUserDto = req.body;

            if (!fullName || !email || !role) {
                throw ApiError.badRequest('Full Name, Email and Role are required');
            }

            const newUser = await createUser({ fullName, email, password, role, classId });
            ApiResponse.created(res, newUser, 'User created successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, classId } = req.query;
            const filters = {
                ...(role && { role: String(role) }),
                ...(classId && { classId: String(classId) })
            };
            const users = await getAllUsers(filters);
            ApiResponse.success(res, users, 'Users retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async assignClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;
            const { classId }: AssignClassDto = req.body;

            if (!classId) throw ApiError.badRequest('Class ID is required');

            const updatedStudent = await assignStudentToClass(studentId, classId);
            ApiResponse.success(res, updatedStudent, 'Student assigned to class successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }
}
