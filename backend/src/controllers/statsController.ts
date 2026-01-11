import { Request, Response, NextFunction } from 'express';
import { getStudentAttendanceRate, getClassAttendanceStats, getGlobalStats, getTeacherStats, getStudentDashboardStats } from '../services/statsService';
import { ApiResponse } from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import { AuthRequest } from '../middlewares/authMiddleware';

export class StatsController {

    static async getStudentStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;
            const { role, userId } = req.user!;

            if (role === 'STUDENT' && userId !== studentId) {
                throw ApiError.forbidden('You can only view your own stats');
            }

            const stats = await getStudentAttendanceRate(studentId);
            ApiResponse.success(res, stats, 'Student stats retrieved');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getClassStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId } = req.params;
            const stats = await getClassAttendanceStats(classId);
            ApiResponse.success(res, stats, 'Class stats retrieved');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getGlobal(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await getGlobalStats();
            ApiResponse.success(res, stats, 'Global stats retrieved');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getTeacherStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.user!;
            const stats = await getTeacherStats(userId);
            ApiResponse.success(res, stats, 'Teacher stats retrieved');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }

    static async getStudentDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.user!;
            const stats = await getStudentDashboardStats(userId);
            ApiResponse.success(res, stats, 'Student dashboard stats retrieved');
        } catch (err: any) {
            next(err instanceof ApiError ? err : ApiError.internal(err.message));
        }
    }
}
