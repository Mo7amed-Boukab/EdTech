import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import { AttendanceRecordDto } from '../dtos/attendance.dto';
import { Justification } from '../generated/prisma/client';

export async function markAttendance(sessionId: string, records: AttendanceRecordDto[], requesterRole: string, requesterId: string) {
    // Verify Session exists
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
            throw ApiError.badRequest(`Student with ID ${record.studentId} does not belong to the class of this session.`);
        }

        return prisma.attendance.upsert({
            where: {
                sessionId_studentId: {
                    sessionId,
                    studentId: record.studentId
                }
            },
            update: {
                status: record.status,
                justification: record.justification || null
            },
            create: {
                sessionId,
                studentId: record.studentId,
                status: record.status,
                justification: record.justification || null
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

export async function getTeacherSessionsAttendance(teacherId?: string, date?: string) {
    try {
        const whereClause: any = {};
        if (teacherId) {
            whereClause.teacherId = teacherId;
        }

        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
            whereClause.date = {
                gte: startOfDay,
                lt: endOfDay
            };
        }

        const sessions = await prisma.session.findMany({
            where: whereClause,
            include: {
                class: {
                    include: {
                        students: true
                    }
                },
                subject: true,
                attendances: true
            },
            orderBy: [{ date: 'desc' }, { startTime: 'desc' }]
        });

        // Transform to match frontend expectations
        return sessions.map(session => {
            // Map existing attendance records by student ID
            const attendanceMap = new Map(session.attendances.map(a => [a.studentId, a]));

            // Get all students in the class
            const allStudents = session.class?.students || [];

            // Merge class students with attendance records
            const studentList = allStudents.map(student => {
                const attendance = attendanceMap.get(student.id);

                // Safe justification transformation
                let justification: string | null = null;
                if (attendance?.justification) {
                    justification = String(attendance.justification).toLowerCase();
                }

                return {
                    id: student.id,
                    attendanceId: attendance?.id,
                    name: student.fullName,
                    email: student.email,
                    status: attendance?.status || null,
                    justification: justification
                };
            });

            return {
                id: session.id,
                time: `${session.startTime} – ${session.endTime}`,
                date: session.date,
                subject: session.subject?.name || 'Unknown',
                class: session.class?.name || 'Unknown',
                level: session.class?.level || '',
                students: studentList
            };
        });
    } catch (error) {
        console.error("Error in getTeacherSessionsAttendance:", error);
        throw ApiError.internal("Failed to process attendance data");
    }
}

export async function updateAttendanceJustification(
    attendanceId: string,
    justification: 'JUSTIFIED' | 'NOT_JUSTIFIED',
    requesterRole: string,
    requesterId: string
) {
    // Find the attendance record
    const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: { session: true }
    });
    if (!attendance) throw ApiError.notFound('Attendance record not found');

    // Authorization: Admin or session's teacher
    if (requesterRole !== 'ADMIN') {
        if (attendance.session.teacherId !== requesterId) {
            throw ApiError.forbidden('You can only update justification for your own sessions');
        }
    }

    // Only allow justification for ABSENT or LATE
    if (attendance.status === 'PRESENT') {
        throw ApiError.badRequest('Cannot set justification for PRESENT status');
    }

    return prisma.attendance.update({
        where: { id: attendanceId },
        data: { justification: justification as Justification }
    });
}

export async function getStudentAttendanceHistory(studentId: string) {
    // 1. Get Student's Class ID
    const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { classId: true }
    });

    if (!student || !student.classId) {
        return [];
    }

    // 2. Get all sessions for this class, ordered by date desc
    const sessions = await prisma.session.findMany({
        where: { classId: student.classId },
        include: {
            subject: true,
            teacher: true,
            attendances: {
                where: { studentId }
            }
        },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }]
    });

    // 3. Map to DTO
    return sessions.map(session => {
        const attendance = session.attendances[0]; // Specific to this student

        let justification: boolean | null = null;
        if (attendance?.justification === 'JUSTIFIED') justification = true;
        if (attendance?.justification === 'NOT_JUSTIFIED') justification = false;

        return {
            id: session.id,
            date: session.date.toISOString().split('T')[0], // YYYY-MM-DD
            time: `${session.startTime} – ${session.endTime}`,
            subject: session.subject.name,
            teacher: session.teacher.fullName,
            room: session.room,
            status: attendance?.status || null,
            justified: justification
        };
    });
}

export async function getStudentWeeklySessions(studentId: string, startDate: Date, endDate: Date) {
    const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { classId: true }
    });

    if (!student || !student.classId) {
        return [];
    }

    const sessions = await prisma.session.findMany({
        where: {
            classId: student.classId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            subject: true,
            teacher: true
        },
        orderBy: { date: 'asc' }
    });

    return sessions.map(session => ({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        subject: session.subject.name,
        teacher: session.teacher.fullName,
        room: session.room,
        class: session.classId // or fetch class name if needed, but not used in UI
    }));
}
