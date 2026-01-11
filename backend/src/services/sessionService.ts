import prisma from "../config/prismaClient";
import ApiError from "../utils/ApiError";
import type { Prisma } from "../generated/prisma/client";
import { CreateSessionDto, UpdateSessionDto } from "../dtos/session.dto";

// Helper function to check if two time ranges overlap
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert time strings (HH:MM) to minutes for comparison
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Two ranges overlap if start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
}

async function checkSessionConflict(
  date: Date,
  startTime: string,
  endTime: string,
  classId: string,
  teacherId: string,
  excludeSessionId?: string
) {
  // Get the start and end of the day for date comparison
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Find all sessions on the same day for this class or teacher
  const sessionsOnSameDay = await prisma.session.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      id: excludeSessionId ? { not: excludeSessionId } : undefined,
      OR: [{ classId: classId }, { teacherId: teacherId }],
    },
    include: { class: true, teacher: true },
  });

  // Check for time overlap with each session
  for (const session of sessionsOnSameDay) {
    if (
      timeRangesOverlap(startTime, endTime, session.startTime, session.endTime)
    ) {
      if (session.classId === classId) {
        throw ApiError.conflict(
          `Class ${session.class.name} already has a session from ${session.startTime} to ${session.endTime} on this day`
        );
      }
      if (session.teacherId === teacherId) {
        throw ApiError.conflict(
          `Teacher ${session.teacher.fullName} is already busy from ${session.startTime} to ${session.endTime} on this day`
        );
      }
    }
  }
}

export async function createSession(data: CreateSessionDto) {
  console.log("Verifying class and subject...");
  
  // Verify Class exists
  const classExists = await prisma.class.findUnique({
    where: { id: data.classId },
  });
  if (!classExists) {
    console.error("Class not found:", data.classId);
    throw ApiError.notFound("Class not found");
  }
  console.log("Class found:", classExists.name);

  // Verify Subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
  });
  if (!subject) {
    console.error("Subject not found:", data.subjectId);
    throw ApiError.notFound("Subject not found");
  }
  console.log("Subject found:", subject.name);

  // Note: We allow subjects to be used with any class
  // Teachers can assign any subject to any class when creating sessions
  console.log("Class-subject relationship check skipped (flexible assignment)");

  // Verify Teacher
  if (!data.teacherId) {
    console.error("Teacher ID is required");
    throw ApiError.badRequest("Teacher ID is required");
  }
  const teacher = await prisma.user.findUnique({
    where: { id: data.teacherId },
  });
  if (!teacher || teacher.role !== "TEACHER") {
    console.error("Invalid teacher ID");
    throw ApiError.badRequest("Invalid teacher ID");
  }
  console.log("Teacher found:", teacher.fullName);

  // Validate time order
  if (data.startTime >= data.endTime) {
    console.error("Start time must be before end time");
    throw ApiError.badRequest("Start time must be before end time");
  }
  console.log("Time order valid");

  // CONFLICT CHECK with time ranges
  console.log("Checking session conflicts...");
  await checkSessionConflict(
    new Date(data.date),
    data.startTime,
    data.endTime,
    data.classId,
    data.teacherId!
  );
  console.log("No conflicts found");

  console.log("Creating session in database...");
  return prisma.session.create({
    data: {
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId!,
    },
    include: {
      class: true,
      subject: true,
      teacher: true,
    },
  });
}

export async function getAllSessions(
  filters?: {
    classId?: string;
    teacherId?: string;
    subjectId?: string;
    date?: string;
  },
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
      lte: endOfDay,
    };
  }

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
      },
      orderBy: { date: "asc" },
      skip,
      take: limit,
    }),
    prisma.session.count({ where }),
  ]);

  return {
    data: sessions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateSession(
  id: string,
  data: UpdateSessionDto,
  requesterId: string
) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw ApiError.notFound("Session not found");

  // Strict Authorization: Only the owner Teacher can update
  if (session.teacherId !== requesterId) {
    throw ApiError.forbidden("You can only manage your own sessions");
  }

  // If updating classId or subjectId, validation is required
  let targetClassId = session.classId;
  let targetSubjectId = session.subjectId;

  if (data.classId) {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!classItem) throw ApiError.notFound("Class not found");
    targetClassId = data.classId;
  }

  if (data.subjectId) {
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });
    if (!subject) throw ApiError.notFound("Subject not found");
    targetSubjectId = data.subjectId;
  }

  // If either changed, verify consistency
  if (data.classId || data.subjectId) {
    // We need to fetch the subject to check its classId, if we haven't already
    const subject = await prisma.subject.findUnique({
      where: { id: targetSubjectId },
    });
    if (!subject) throw ApiError.notFound("Subject not found");

    // Note: We allow subjects to be used with any class for flexible assignment
    // Teachers can assign any subject to any class when creating/updating sessions
  }

  // Validate time order if times are being updated
  const checkStartTime = data.startTime || session.startTime;
  const checkEndTime = data.endTime || session.endTime;
  if (checkStartTime >= checkEndTime) {
    throw ApiError.badRequest("Start time must be before end time");
  }

  // CONFLICT CHECK for Update - now includes time range check
  // If date, startTime, endTime, classId, or teacherId changes
  if (
    data.date ||
    data.startTime ||
    data.endTime ||
    data.classId ||
    data.teacherId
  ) {
    const checkDate = data.date ? new Date(data.date) : session.date;
    const checkClassId = data.classId || session.classId;
    const checkTeacherId = data.teacherId || session.teacherId;

    await checkSessionConflict(
      checkDate,
      checkStartTime,
      checkEndTime,
      checkClassId,
      checkTeacherId,
      id
    );
  }

  return prisma.session.update({
    where: { id },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
      ...(data.room && { room: data.room }),
      ...(data.classId && { classId: data.classId }),
      ...(data.subjectId && { subjectId: data.subjectId }),
      ...(data.teacherId && { teacherId: data.teacherId }),
    },
    include: {
      class: true,
      subject: true,
      teacher: true,
    },
  });
}

export async function deleteSession(id: string, requesterId: string) {
  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) throw ApiError.notFound("Session not found");

  // Strict Authorization: Only the owner Teacher can delete
  if (session.teacherId !== requesterId) {
    throw ApiError.forbidden("You can only delete your own sessions");
  }

  await prisma.session.delete({ where: { id } });
}
