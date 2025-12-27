import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import type { Class, Prisma } from '../generated/prisma/client';
import { CreateClassDto, UpdateClassDto } from '../dtos/class.dto';

export async function createClass(data: CreateClassDto, adminId: string) {
    // Check if class name already exists
    const existingClass = await prisma.class.findFirst({
        where: { name: data.name }
    });
    if (existingClass) {
        throw ApiError.conflict('A class with this name already exists');
    }

    // Verify teacher if provided
    if (data.teacherId) {
        const teacher = await prisma.user.findUnique({
            where: { id: data.teacherId },
            select: { role: true }
        });
        if (!teacher || teacher.role !== 'TEACHER') {
            throw ApiError.badRequest('Invalid teacher ID');
        }
    }

    const createData: Prisma.ClassUncheckedCreateInput = {
        name: data.name,
        createdById: adminId,
        teacherId: data.teacherId || null,
    };

    const newClass = await prisma.class.create({
        data: createData,
    });

    return newClass;
}

export async function getAllClasses(filters?: { teacherId?: string }, page = 1, limit = 10) {
    const where: Prisma.ClassWhereInput = {};

    if (filters?.teacherId) {
        where.teacherId = filters.teacherId;
    }

    const skip = (page - 1) * limit;

    const [classes, total] = await Promise.all([
        prisma.class.findMany({
            where,
            include: {
                teacher: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                _count: {
                    select: { students: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.class.count({ where })
    ]);

    return {
        data: classes,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function getClassById(id: string) {
    const classItem = await prisma.class.findUnique({
        where: { id },
        include: {
            teacher: {
                select: { id: true, fullName: true, email: true }
            },
            students: {
                select: { id: true, fullName: true, email: true }
            }
        }
    });
    if (!classItem) throw ApiError.notFound('Class not found');
    return classItem;
}

export async function assignTeacher(classId: string, teacherId: string) {
    // Verify teacher
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { role: true }
    });

    if (!teacher) throw ApiError.notFound('Teacher not found');
    if (teacher.role !== 'TEACHER') throw ApiError.badRequest('User is not a teacher');

    // Verify class exists
    const existingClass = await prisma.class.findUnique({ where: { id: classId } });
    if (!existingClass) throw ApiError.notFound('Class not found');

    return prisma.class.update({
        where: { id: classId },
        data: { teacherId },
    });
}

export async function updateClass(id: string, data: UpdateClassDto) {
    // Verify class exists
    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) throw ApiError.notFound('Class not found');

    // Check if new name conflicts with another class
    if (data.name) {
        const nameConflict = await prisma.class.findFirst({
            where: {
                name: data.name,
                id: { not: id } // Exclude current class
            }
        });
        if (nameConflict) {
            throw ApiError.conflict('A class with this name already exists');
        }
    }

    // Verify teacher if provided
    if (data.teacherId) {
        const teacher = await prisma.user.findUnique({
            where: { id: data.teacherId },
            select: { role: true }
        });
        if (!teacher || teacher.role !== 'TEACHER') {
            throw ApiError.badRequest('Invalid teacher ID');
        }
    }

    return prisma.class.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.teacherId && { teacherId: data.teacherId }),
        },
    });
}

export async function deleteClass(id: string): Promise<void> {
    // Verify class exists
    const existingClass = await prisma.class.findUnique({
        where: { id },
        include: {
            _count: {
                select: { students: true }
            }
        }
    });

    if (!existingClass) throw ApiError.notFound('Class not found');

    // Prevent deletion if class has students
    if (existingClass._count.students > 0) {
        throw ApiError.badRequest('Cannot delete class with enrolled students');
    }

    await prisma.class.delete({ where: { id } });
}
