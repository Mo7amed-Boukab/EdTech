import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import type { Prisma } from '../generated/prisma/client';
import { CreateSubjectDto, UpdateSubjectDto } from '../dtos/subject.dto';

export async function createSubject(data: CreateSubjectDto) {
    // Verify Class if provided
    if (data.classId) {
        const classItem = await prisma.class.findUnique({ where: { id: data.classId } });
        if (!classItem) throw ApiError.notFound('Class not found');
    }

    // Verify Teacher if provided
    if (data.teacherId) {
        const teacher = await prisma.user.findUnique({ where: { id: data.teacherId } });
        if (!teacher) throw ApiError.notFound('Teacher not found');
        if (teacher.role !== 'TEACHER') throw ApiError.badRequest('User is not a teacher');
    }

    // Check duplicate subject name in same class if classId is provided
    if (data.classId) {
        const existing = await prisma.subject.findFirst({
            where: { name: data.name, classId: data.classId }
        });
        if (existing) throw ApiError.conflict('Subject already exists in this class');
    }

    // Use UncheckedCreateInput to allow nulls
    const createData: Prisma.SubjectUncheckedCreateInput = {
        name: data.name,
        classId: data.classId || null,
        teacherId: data.teacherId || null
    };

    return prisma.subject.create({
        data: createData,
    });
}

export async function getAllSubjects(filters?: { classId?: string; teacherId?: string }, page = 1, limit = 10) {
    const where: Prisma.SubjectWhereInput = {};
    if (filters?.classId) where.classId = filters.classId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;

    const skip = (page - 1) * limit;

    const [subjects, total] = await Promise.all([
        prisma.subject.findMany({
            where,
            include: {
                class: { select: { id: true, name: true } },
                teacher: { select: { id: true, fullName: true, email: true } }
            },
            orderBy: { name: 'asc' },
            skip,
            take: limit
        }),
        prisma.subject.count({ where })
    ]);

    return {
        data: subjects,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function getSubjectById(id: string) {
    const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
            class: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true, email: true } }
        }
    });
    if (!subject) throw ApiError.notFound('Subject not found');
    return subject;
}

export async function updateSubject(id: string, data: UpdateSubjectDto, requesterRole: string, requesterId: string) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw ApiError.notFound('Subject not found');

    // Authorization: Admin or Owner Teacher
    if (requesterRole !== 'ADMIN') {
        if (subject.teacherId !== requesterId) {
            throw ApiError.forbidden('You can only manage your own subjects');
        }
    }

    if (data.teacherId) {
        const teacher = await prisma.user.findUnique({ where: { id: data.teacherId } });
        if (!teacher || teacher.role !== 'TEACHER') throw ApiError.badRequest('Invalid teacher ID');
    }

    return prisma.subject.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.teacherId && { teacherId: data.teacherId })
        }
    });
}

export async function deleteSubject(id: string, requesterRole: string, requesterId: string) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw ApiError.notFound('Subject not found');

    // Authorization
    if (requesterRole !== 'ADMIN') {
        if (subject.teacherId !== requesterId) {
            throw ApiError.forbidden('You can only delete your own subjects');
        }
    }

    await prisma.subject.delete({ where: { id } });
}
