import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";

/**
 * SEEDER DATABASE
 * ==============
 * Mode 'admin' : Crée uniquement le compte administrateur
 * Mode 'full'  : Nettoie la base et crée l'intégralité des données de test 
 */

async function seedAdmin() {
  console.log("--- Mode ADMIN : Vérification/Création du compte Admin ---");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@edacademy.com" },
    update: {},
    create: {
      fullName: "Admin Principal",
      email: "admin@edacademy.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin OK :", admin.email);
  return admin;
}

async function seedDummyData(admin: any) {
  console.log("\n--- Mode FULL : Création des données de test complètes ---");

  // Clean database (in reverse order of dependencies)
  console.log("Cleaning existing data...");
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany({ where: { role: "STUDENT" } });
  await prisma.class.deleteMany();
  await prisma.user.deleteMany({
    where: {
      role: "TEACHER",
      email: { not: "admin@edacademy.com" }
    },
  });
  console.log("Database cleaned\n");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Teachers
  console.log("Creating teachers...");
  const t1 = await prisma.user.create({ data: { fullName: "Prof. Ahmed Benali", email: "ahmed.benali@teacher.com", password: hashedPassword, role: "TEACHER" } });
  const t2 = await prisma.user.create({ data: { fullName: "Prof. Sarah Mansouri", email: "sarah.mansouri@teacher.com", password: hashedPassword, role: "TEACHER" } });
  const t3 = await prisma.user.create({ data: { fullName: "Prof. Youssef Alami", email: "youssef.alami@teacher.com", password: hashedPassword, role: "TEACHER" } });
  console.log("3 teachers created\n");

  // 2. Create Classes
  console.log("Creating classes...");
  const c1 = await prisma.class.create({ data: { name: "PHP/Laravel", level: "A1", academicYear: "2025-2026", createdById: admin.id, teacherId: t3.id } });
  const c2 = await prisma.class.create({ data: { name: "Python", level: "A1", academicYear: "2025-2026", createdById: admin.id } });
  const c3 = await prisma.class.create({ data: { name: "JavaScript/MERN", level: "A2", academicYear: "2025-2026", createdById: admin.id, teacherId: t1.id } });
  const c4 = await prisma.class.create({ data: { name: "Java/Spring", level: "A2", academicYear: "2025-2026", createdById: admin.id, teacherId: t2.id } });
  console.log("4 classes created\n");

  // 3. Create Students (Updated with more original names)
  console.log("Creating students...");
  const groups = [
    { names: ["Amine Kadiri", "Fatima Zahrae", "Omar Benjelloun", "Khadija Lahlou", "Rachid Tazi"], classId: c1.id },
    { names: ["Younes Idrissi", "Salma Bennani", "Hamza Chraibi", "Nadia Fassi", "Mehdi Ouazzani"], classId: c2.id },
    { names: ["Karim Berrada", "Leila Amrani", "Yassine El Khattabi", "Imane Squalli", "Adil Benjelloun"], classId: c3.id },
    { names: ["Soufiane Mohammadi", "Zineb Alaoui", "Reda Kettani", "Houda Benmoussa", "Tarik Senhaji"], classId: c4.id },
  ];

  const students = [];
  for (const group of groups) {
    for (const name of group.names) {
      const email = name.toLowerCase().replace(/\s+/g, ".") + "@student.com";
      const s = await prisma.user.create({
        data: { fullName: name, email, password: hashedPassword, role: "STUDENT", classId: group.classId },
      });
      students.push(s);
    }
  }
  console.log("20 students created\n");

  // 4. Create Subjects
  console.log("Creating subjects...");
  const subjectMap = [
    { classId: c1.id, teacherId: t3.id, names: ["HTML", "CSS", "MySQL", "PHP", "Laravel"] },
    { classId: c2.id, teacherId: null, names: ["Python Fundamentals", "Django", "Data Science"] },
    { classId: c3.id, teacherId: t1.id, names: ["React.js", "Node.js", "MongoDB", "TypeScript"] },
    { classId: c4.id, teacherId: t2.id, names: ["Java SE", "Spring Boot", "Hibernate"] },
  ];

  const subjects = [];
  for (const item of subjectMap) {
    for (const name of item.names) {
      subjects.push(await prisma.subject.create({
        data: { name, classId: item.classId, teacherId: item.teacherId },
      }));
    }
  }
  console.log(`${subjects.length} subjects created\n`);

  // 5. Create Sessions
  console.log("Creating sessions...");
  const timeSlots = [
    { start: "09:00", end: "10:30" }, { start: "14:00", end: "15:30" }
  ];
  const sessionDates = [new Date("2026-01-12"), new Date("2026-01-13"), new Date("2026-01-15"), new Date("2026-01-16")];
  const today = new Date("2026-01-14");

  const sessions = [];
  for (const date of sessionDates) {
    for (const classItem of [c1, c2, c3, c4]) {
      const classSubjs = subjects.filter(s => s.classId === classItem.id);
      for (let i = 0; i < timeSlots.length; i++) {
        const sub = classSubjs[i % classSubjs.length];
        sessions.push(await prisma.session.create({
          data: {
            date, startTime: timeSlots[i].start, endTime: timeSlots[i].end,
            room: `Salle ${classItem.name}`,
            classId: classItem.id, subjectId: sub.id,
            teacherId: sub.teacherId ?? t1.id,
          },
        }));
      }
    }
  }
  console.log(`${sessions.length} sessions created\n`);

  // 6. Attendance
  console.log("Creating attendance records for past sessions...");
  const pastSessions = sessions.filter(s => s.date < today);
  for (const session of pastSessions) {
    const classStudents = students.filter(s => s.classId === session.classId);
    for (const student of classStudents) {
      const random = Math.random();
      let status: "PRESENT" | "ABSENT" | "LATE";
      if (random < 0.8) status = "PRESENT";
      else if (random < 0.95) status = "ABSENT";
      else status = "LATE";

      await prisma.attendance.create({
        data: { sessionId: session.id, studentId: student.id, status },
      });
    }
  }
  console.log("Attendance records created\n");

  // Summary Display
  console.log("------------------------------------------");
  console.log("RÉSUMÉ DES DONNÉES CRÉÉES :");
  console.log("------------------------------------------");
  console.log(`Admin    : ${admin.email} (password123)`);
  console.log(`Teachers : ${t1.email}, ${t2.email}, ${t3.email}`);
  console.log(`Students : 20 students (Ex: ${students[0].email}, ${students[10].email})`);
  console.log(`Classes  : 4 (PHP, Python, JS, Java)`);
  console.log(`Subjects : ${subjects.length} modules`);
  console.log(`Sessions : ${sessions.length} séances créées`);
  console.log("------------------------------------------\n");
}

async function main() {
  const mode = process.env.SEED_MODE || "full";

  try {
    const admin = await seedAdmin();

    if (mode === "full") {
      await seedDummyData(admin);
      console.log("==========================================");
      console.log("FULL SEEDING COMPLETED SUCCESSFULLY!");
      console.log("==========================================\n");
    } else {
      console.log("==========================================");
      console.log("ADMIN ONLY SEEDING COMPLETED!");
      console.log("==========================================\n");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
