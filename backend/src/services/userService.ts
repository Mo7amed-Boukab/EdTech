import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient";
import ApiError from "../utils/ApiError";
import type { User as DbUser, Prisma } from "../generated/prisma/client";
import { CreateUserDto } from "../dtos/user.dto";
import { isRole } from "../types/user";

export type PublicUser = Omit<DbUser, "password">;

export async function createUser(data: CreateUserDto): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw ApiError.conflict("Email already exists");

  if (!isRole(data.role)) throw ApiError.badRequest("Invalid role");

  const passwordToHash = data.password || "12345678";

  const hashedPassword = await bcrypt.hash(passwordToHash, 10);

  // Validate Class ID if provided (only for Students)
  if (data.classId) {
    if (data.role !== "STUDENT") {
      throw ApiError.badRequest("Class assignment is only for students");
    }
    const existingClass = await prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!existingClass) throw ApiError.badRequest("Invalid Class ID");
  }

  const createData: Prisma.UserUncheckedCreateInput = {
    fullName: data.fullName,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    classId: data.classId || null,
  };

  const user = await prisma.user.create({
    data: createData,
  });

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function getAllUsers(
  filters?: { role?: string; classId?: string; search?: string },
  page = 1,
  limit = 10
) {
  const where: Prisma.UserWhereInput = {};
  if (filters?.role) {
    if (!isRole(filters.role)) throw ApiError.badRequest("Invalid role filter");
    where.role = filters.role;
  }
  if (filters?.classId) {
    where.classId = filters.classId;
  }
  if (filters?.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        class: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function assignStudentToClass(studentId: string, classId: string) {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) throw ApiError.notFound("Student not found");
  if (student.role !== "STUDENT")
    throw ApiError.badRequest("User is not a student");

  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) throw ApiError.notFound("Class not found");

  return prisma.user.update({
    where: { id: studentId },
    data: { classId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      class: { select: { id: true, name: true } },
    },
  });
}

export async function updateUser(userId: string, data: Partial<CreateUserDto>) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  // Check email uniqueness if email is being updated
  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw ApiError.conflict("Email already exists");
  }

  // Hash password if provided
  let hashedPassword: string | undefined;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  // Validate Class ID if provided
  if (data.classId) {
    if (data.role && data.role !== "STUDENT") {
      throw ApiError.badRequest("Class assignment is only for students");
    }
    const existingClass = await prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!existingClass) throw ApiError.badRequest("Invalid Class ID");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.email && { email: data.email }),
      ...(hashedPassword && { password: hashedPassword }),
      ...(data.classId !== undefined && { classId: data.classId }),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      class: { select: { id: true, name: true } },
    },
  });

  return updatedUser;
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  // If teacher, handle all related data before deletion
  if (user.role === "TEACHER") {
    // Check for existing sessions (cannot be deleted if sessions exist)
    const sessionCount = await prisma.session.count({
      where: { teacherId: userId },
    });
    if (sessionCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete teacher with ${sessionCount} existing session(s). Please delete or reassign sessions first.`
      );
    }

    // Unassign all classes (set teacherId to null)
    await prisma.class.updateMany({
      where: { teacherId: userId },
      data: { teacherId: null },
    });

    // Unassign all subjects (set teacherId to null)
    await prisma.subject.updateMany({
      where: { teacherId: userId },
      data: { teacherId: null },
    });
  }

  await prisma.user.delete({ where: { id: userId } });
}
