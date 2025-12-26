import bcrypt from 'bcryptjs';
import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';
import type { User as DbUser, Prisma } from '../generated/prisma/client';
import { CreateUserDto } from '../dtos/user.dto';
import { isRole } from '../types/user';

export type PublicUser = Omit<DbUser, 'password'>;

export async function createUser(data: CreateUserDto): Promise<PublicUser> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw ApiError.conflict('Email already exists');

    if (!isRole(data.role)) throw ApiError.badRequest('Invalid role');

    const passwordToHash = data.password || '12345678';

    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    // Validate Class ID if provided (only for Students)
    if (data.classId) {
        if (data.role !== 'STUDENT') {
            throw ApiError.badRequest('Class assignment is only for students');
        }
        const existingClass = await prisma.class.findUnique({ where: { id: data.classId } });
        if (!existingClass) throw ApiError.badRequest('Invalid Class ID');
    }

    const createData: Prisma.UserUncheckedCreateInput = {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        classId: data.classId || null
    };

    const user = await prisma.user.create({
        data: createData,
    });

    const { password: _password, ...safeUser } = user;
    return safeUser;
}

export async function getAllUsers(filters?: { role?: string; classId?: string }) {
    const where: Prisma.UserWhereInput = {};
    if (filters?.role) {
        if (!isRole(filters.role)) throw ApiError.badRequest('Invalid role filter');
        where.role = filters.role;
    }
    if (filters?.classId) {
        where.classId = filters.classId;
    }

    return prisma.user.findMany({
        where,
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true,
            class: {
                select: { id: true, name: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function assignStudentToClass(studentId: string, classId: string) {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw ApiError.notFound('Student not found');
    if (student.role !== 'STUDENT') throw ApiError.badRequest('User is not a student');

    const classItem = await prisma.class.findUnique({ where: { id: classId } });
    if (!classItem) throw ApiError.notFound('Class not found');

    return prisma.user.update({
        where: { id: studentId },
        data: { classId },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            class: { select: { id: true, name: true } }
        }
    });
}
