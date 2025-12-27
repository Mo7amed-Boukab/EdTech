import { Request, Response, NextFunction } from 'express';
import { createClass, getAllClasses, getClassById, assignTeacher, updateClass, deleteClass } from '../services/classService';
import ApiError from '../utils/ApiError';
import { CreateClassDto, AssignTeacherDto, UpdateClassDto } from '../dtos/class.dto';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ApiResponse } from '../utils/ApiResponse';

export class ClassController {

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, teacherId }: CreateClassDto = req.body;
            const adminId = req.user!.userId;

            if (!name) throw ApiError.badRequest('Class name is required');

            const newClass = await createClass({ name, teacherId }, adminId);
            ApiResponse.created(res, newClass, 'Class created successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { teacherId, page, limit } = req.query;
            const filters = {
                ...(teacherId && { teacherId: String(teacherId) })
            };

            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;

            const classes = await getAllClasses(filters, pageNum, limitNum);
            ApiResponse.success(res, classes, 'Classes retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const classItem = await getClassById(id);
            ApiResponse.success(res, classItem, 'Class retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async assignTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { teacherId }: AssignTeacherDto = req.body;

            if (!teacherId) throw ApiError.badRequest('Teacher ID is required');

            const updatedClass = await assignTeacher(id, teacherId);
            ApiResponse.success(res, updatedClass, 'Teacher assigned successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }


    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, teacherId }: UpdateClassDto = req.body;

            if (!name && !teacherId) {
                throw ApiError.badRequest('At least one field (name or teacherId) is required');
            }

            const updatedClass = await updateClass(id, { name, teacherId });
            ApiResponse.success(res, updatedClass, 'Class updated successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await deleteClass(id);
            ApiResponse.success(res, null, 'Class deleted successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }
}
