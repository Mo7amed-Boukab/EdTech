import { Request, Response, NextFunction } from 'express';
import { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject } from '../services/subjectService';
import ApiError from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { CreateSubjectDto, UpdateSubjectDto } from '../dtos/subject.dto';
import { AuthRequest } from '../middlewares/authMiddleware';

export class SubjectController {

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, classId, teacherId }: CreateSubjectDto = req.body;
            if (!name) throw ApiError.badRequest('Subject Name is required');

            const subject = await createSubject({ name, classId, teacherId });
            ApiResponse.created(res, subject, 'Subject created successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, teacherId, page, limit } = req.query;
            const filters = {
                ...(classId && { classId: String(classId) }),
                ...(teacherId && { teacherId: String(teacherId) })
            };

            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 10;

            const subjects = await getAllSubjects(filters, pageNum, limitNum);
            ApiResponse.success(res, subjects, 'Subjects retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const subject = await getSubjectById(id);
            ApiResponse.success(res, subject, 'Subject retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data: UpdateSubjectDto = req.body;
            const { role, userId } = req.user!;

            const updated = await updateSubject(id, data, role, userId);
            ApiResponse.success(res, updated, 'Subject updated successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { role, userId } = req.user!;

            await deleteSubject(id, role, userId);
            ApiResponse.success(res, null, 'Subject deleted successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }
}
