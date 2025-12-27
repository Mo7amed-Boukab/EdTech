import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import { AttendanceRecordDto } from '../dtos/attendance.dto';

export async function markAttendance(sessionId: string, records: AttendanceRecordDto[], requesterRole: string, requesterId: string) {
    // 1. Verify Session exists
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { class: { include: { students: true } } }
    });
    if (!session) throw ApiError.notFound('Session not found');

    // Check Authorization
    if (requesterRole !== 'ADMIN') {
        if (session.teacherId !== requesterId) {
            throw ApiError.forbidden('You can only mark attendance for your own sessions');
        }
    }

    // Verify Students belong to the class
    const classStudentIds = new Set(session.class.students.map(s => s.id));

    const operations = records.map(record => {
        if (!classStudentIds.has(record.studentId)) {
            // Strictly enforce that the student must belong to the session's class
            throw ApiError.badRequest(`Student with ID ${record.studentId} does not belong to the class of this session.`);
        }

        return prisma.attendance.upsert({
            where: {
                sessionId_studentId: {
                    sessionId,
                    studentId: record.studentId
                }
            },
            update: { status: record.status },
            create: {
                sessionId,
                studentId: record.studentId,
                status: record.status
            }
        });
    });

    return prisma.$transaction(operations);
}

export async function getSessionAttendance(sessionId: string, requesterRole: string, requesterId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw ApiError.notFound('Session not found');

    if (requesterRole !== 'ADMIN') {
        if (session.teacherId !== requesterId) {
            throw ApiError.forbidden('You can only view attendance for your own sessions');
        }
    }

    return prisma.attendance.findMany({
        where: { sessionId },
        include: {
            student: {
                select: { id: true, fullName: true, email: true }
            }
        }
    });
}
