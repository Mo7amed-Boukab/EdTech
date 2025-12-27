import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import type { Prisma } from '../generated/prisma/client';
import { CreateSessionDto, UpdateSessionDto } from '../dtos/session.dto';



async function checkSessionConflict(date: Date, classId: string, teacherId: string, excludeSessionId?: string) {
    // We strictly check if there is already a session starting at this EXACT date/time
    // for either the Class or the Teacher.
    const conflict = await prisma.session.findFirst({
        where: {
            date: date,
            id: excludeSessionId ? { not: excludeSessionId } : undefined,
            OR: [
                { classId: classId },
                { teacherId: teacherId }
            ]
        },
        include: { class: true, teacher: true }
    });

    if (conflict) {
        if (conflict.classId === classId) {
            throw ApiError.conflict(`Class ${conflict.class.name} already has a session at ${date.toISOString()}`);
        }
        if (conflict.teacherId === teacherId) {
            throw ApiError.conflict(`Teacher ${conflict.teacher.fullName} is already busy at ${date.toISOString()}`);
        }
    }
}

export async function createSession(data: CreateSessionDto) {
    // Verify constraints
    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) throw ApiError.notFound('Subject not found');

    if (subject.classId !== data.classId) {
        throw ApiError.badRequest('Subject does not belong to this class');
    }

    // Verify Teacher
    if (!data.teacherId) throw ApiError.badRequest('Teacher ID is required');
    const teacher = await prisma.user.findUnique({ where: { id: data.teacherId } });
    if (!teacher || teacher.role !== 'TEACHER') throw ApiError.badRequest('Invalid teacher ID');

    // CONFLICT CHECK
    await checkSessionConflict(new Date(data.date), data.classId, data.teacherId!);

    return prisma.session.create({
        data: {
            date: new Date(data.date),
            classId: data.classId,
            subjectId: data.subjectId,
            teacherId: data.teacherId!
        }
    });
}

export async function getAllSessions(
    filters?: { classId?: string; teacherId?: string; subjectId?: string; date?: string },
    page = 1,
    limit = 20
) {
    const where: Prisma.SessionWhereInput = {};
    if (filters?.classId) where.classId = filters.classId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.subjectId) where.subjectId = filters.subjectId;

    if (filters?.date) {
        const startOfDay = new Date(filters.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);

        where.date = {
            gte: startOfDay,
            lte: endOfDay
        };
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
        prisma.session.findMany({
            where,
            include: {
                class: { select: { id: true, name: true } },
                subject: { select: { id: true, name: true } },
                teacher: { select: { id: true, fullName: true } }
            },
            orderBy: { date: 'asc' },
            skip,
            take: limit
        }),
        prisma.session.count({ where })
    ]);

    return {
        data: sessions,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}


export async function updateSession(id: string, data: UpdateSessionDto, requesterId: string) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw ApiError.notFound('Session not found');

    // Strict Authorization: Only the owner Teacher can update
    if (session.teacherId !== requesterId) {
        throw ApiError.forbidden('You can only manage your own sessions');
    }

    // If updating classId or subjectId, validation is required
    let targetClassId = session.classId;
    let targetSubjectId = session.subjectId;

    if (data.classId) {
        const classItem = await prisma.class.findUnique({ where: { id: data.classId } });
        if (!classItem) throw ApiError.notFound('Class not found');
        targetClassId = data.classId;
    }

    if (data.subjectId) {
        const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
        if (!subject) throw ApiError.notFound('Subject not found');
        targetSubjectId = data.subjectId;
    }

    // If either changed, verify consistency
    if (data.classId || data.subjectId) {
        // We need to fetch the subject to check its classId, if we haven't already
        const subject = await prisma.subject.findUnique({ where: { id: targetSubjectId } });
        if (!subject) throw ApiError.notFound('Subject not found');

        if (subject.classId !== targetClassId) {
            throw ApiError.badRequest('Subject does not belong to the class');
        }
    }

    // CONFLICT CHECK for Update
    // If date, classId, or teacherId changes (or session's existing ones if not provided)
    if (data.date || data.classId || data.teacherId) {
        const checkDate = data.date ? new Date(data.date) : session.date;
        const checkClassId = data.classId || session.classId;
        const checkTeacherId = data.teacherId || session.teacherId;

        await checkSessionConflict(checkDate, checkClassId, checkTeacherId, id);
    }

    return prisma.session.update({
        where: { id },
        data: {
            ...(data.date && { date: new Date(data.date) }),
            ...(data.classId && { classId: data.classId }),
            ...(data.subjectId && { subjectId: data.subjectId }),
            ...(data.teacherId && { teacherId: data.teacherId })
        }
    });
}

export async function deleteSession(id: string, requesterId: string) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw ApiError.notFound('Session not found');

    // Strict Authorization: Only the owner Teacher can delete
    if (session.teacherId !== requesterId) {
        throw ApiError.forbidden('You can only delete your own sessions');
    }

    await prisma.session.delete({ where: { id } });
}
