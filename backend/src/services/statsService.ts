import prisma from '../config/prismaClient';
import ApiError from '../utils/ApiError';

export async function getStudentAttendanceRate(studentId: string) {
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') throw ApiError.notFound('Student not found');

    const totalSessions = await prisma.session.count({
        where: { classId: student.classId! }
    });

    if (totalSessions === 0) return { rate: 0, present: 0, absent: 0, total: 0 };

    const attendances = await prisma.attendance.findMany({
        where: { studentId }
    });

    const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
    const lateCount = attendances.filter(a => a.status === 'LATE').length;
    const absentCount = attendances.filter(a => a.status === 'ABSENT').length;

    const rate = ((presentCount + lateCount) / totalSessions) * 100;

    return {
        rate: parseFloat(rate.toFixed(2)),
        present: presentCount + lateCount,
        absent: absentCount + (totalSessions - attendances.length),
        total: totalSessions,
        details: {
            presentStrict: presentCount,
            late: lateCount,
            absentRecorded: absentCount
        }
    };
}

export async function getClassAttendanceStats(classId: string) {
    const classItem = await prisma.class.findUnique({
        where: { id: classId },
        include: { students: true }
    });
    if (!classItem) throw ApiError.notFound('Class not found');

    if (classItem.students.length === 0) return { averageRate: 0, students: [] };

    const stats = await Promise.all(classItem.students.map(async (student) => {
        const studentStat = await getStudentAttendanceRate(student.id);
        return {
            studentId: student.id,
            fullName: student.fullName,
            rate: studentStat.rate
        };
    }));

    const totalRate = stats.reduce((acc, curr) => acc + curr.rate, 0);
    const averageRate = totalRate / stats.length;

    return {
        averageRate: parseFloat(averageRate.toFixed(2)),
        students: stats
    };
}

export async function getGlobalStats() {
    const [totalStudents, totalTeachers, totalClasses, totalSessions] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'TEACHER' } }),
        prisma.class.count(),
        prisma.session.count()
    ]);

    return {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSessions
    };
}

export async function getTeacherStats(teacherId: string) {
    const classes = await prisma.class.findMany({
        where: { teacherId },
        include: { _count: { select: { students: true } } }
    });
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((acc, c) => acc + c._count.students, 0);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todaySessions = await prisma.session.count({
        where: {
            class: { teacherId },
            date: { gte: startOfDay, lt: endOfDay }
        }
    });

    // Determine pending attendance: Sessions in the past (including today) that have NO attendance records
    const pendingAttendance = await prisma.session.count({
        where: {
            class: { teacherId },
            date: { lt: endOfDay },
            attendances: { none: {} }
        }
    });

    return {
        totalClasses,
        totalStudents,
        todaySessions,
        pendingAttendance
    };
}

export async function getStudentDashboardStats(studentId: string) {
    // 1. Get Student Class & Data
    const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { classId: true }
    });

    if (!student || !student.classId) {
        return {
            attendanceData: { present: 0, absent: 0, late: 0, total: 0 },
            absenceData: {},
            todaySchedule: []
        };
    }

    // 2. Get All Sessions & Attendance for Stats
    const allSessions = await prisma.session.findMany({
        where: { classId: student.classId },
        include: {
            attendances: { where: { studentId } },
            subject: true
        }
    });

    let present = 0;
    let absent = 0;
    let late = 0;
    const absenceData: Record<number, { id: string, subject: string, justified: boolean }[]> = {};

    allSessions.forEach(session => {
        const att = session.attendances[0];
        if (att) {
            if (att.status === 'PRESENT') present++;
            else if (att.status === 'ABSENT') {
                absent++;
                // Add to calendar data
                const date = new Date(session.date);
                const day = date.getDate(); // 1-31

                if (!absenceData[day]) absenceData[day] = [];
                absenceData[day].push({
                    id: session.id, // using session id as record id
                    subject: session.subject.name,
                    justified: att.justification === 'JUSTIFIED'
                });
            }
            else if (att.status === 'LATE') late++;
        }
    });

    // 3. Get Today's Schedule
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todaySessions = await prisma.session.findMany({
        where: {
            classId: student.classId,
            date: { gte: startOfDay, lt: endOfDay }
        },
        include: {
            subject: true,
            teacher: true,
            attendances: { where: { studentId } }
        },
        orderBy: { startTime: 'asc' }
    });

    const todaySchedule = todaySessions.map(session => {
        const att = session.attendances[0];
        let status = "Upcoming";

        // Logic for status
        if (att) {
            status = "Completed"; // Attendance marked
        } else {
            // Basic time check (assuming HH:MM format)
            const currentHM = now.getHours() * 60 + now.getMinutes();
            const [startH, startM] = session.startTime.split(':').map(Number);
            const [endH, endM] = session.endTime.split(':').map(Number);
            const startTotal = startH * 60 + startM;
            const endTotal = endH * 60 + endM;

            if (currentHM > endTotal) status = "Completed"; // Unmarked but past
            else if (currentHM >= startTotal) status = "In Progress";
        }

        return {
            time: `${session.startTime} - ${session.endTime}`,
            subject: session.subject.name,
            teacher: session.teacher.fullName,
            room: session.room,
            status
        };
    });

    return {
        attendanceData: {
            present,
            absent,
            late,
            total: present + absent + late // Total marked sessions
        },
        absenceData, // { day: [records] }
        todaySchedule
    };
}
