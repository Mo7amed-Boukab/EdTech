import { Request, Response, NextFunction } from 'express';
import { createSession, getAllSessions, updateSession, deleteSession } from '../services/sessionService';
import { markAttendance, getSessionAttendance } from '../services/attendanceService';
import ApiError from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { CreateSessionDto, UpdateSessionDto } from '../dtos/session.dto';
import { MarkAttendanceDto } from '../dtos/attendance.dto';
import { AuthRequest } from '../middlewares/authMiddleware';

export class SessionController {

    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { date, classId, subjectId }: CreateSessionDto = req.body;
            const { userId } = req.user!;

            if (!date || !classId || !subjectId) throw ApiError.badRequest('Date, Class ID, and Subject ID are required');

            const session = await createSession({ date, classId, subjectId, teacherId: userId });
            ApiResponse.created(res, session, 'Session created successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, teacherId, subjectId, date, page, limit } = req.query;
            const filters = {
                ...(classId && { classId: String(classId) }),
                ...(teacherId && { teacherId: String(teacherId) }),
                ...(subjectId && { subjectId: String(subjectId) }),
                ...(date && { date: String(date) })
            };

            const pageNum = Number(page) || 1;
            const limitNum = Number(limit) || 20;

            const sessions = await getAllSessions(filters, pageNum, limitNum);
            ApiResponse.success(res, sessions, 'Sessions retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data: UpdateSessionDto = req.body;
            const { userId } = req.user!;

            const updated = await updateSession(id, data, userId);
            ApiResponse.success(res, updated, 'Session updated successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { userId } = req.user!;

            await deleteSession(id, userId);
            ApiResponse.success(res, null, 'Session deleted successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }
    static async markAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { records }: MarkAttendanceDto = req.body;
            const { role, userId } = req.user!;

            if (!records || !Array.isArray(records) || records.length === 0) {
                throw ApiError.badRequest('Records array is required');
            }

            const results = await markAttendance(id, records, role, userId);
            ApiResponse.success(res, results, 'Attendance marked successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getAttendance(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { role, userId } = req.user!;

            const attendance = await getSessionAttendance(id, role, userId);
            ApiResponse.success(res, attendance, 'Attendance retrieved successfully');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }
}
