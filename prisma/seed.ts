import { config } from "dotenv";
config();

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const tenant = await prisma.university.upsert({
    where: { slug: "demo-universidad" },
    update: {},
    create: {
      name: "Universidad Demo Ecuador",
      slug: "demo-universidad",
    },
  });

  const passwordHash = await hash("Admin12345!", 10);

  // Super Admin
  await prisma.user.upsert({
    where: { email: "superadmin@rikuchik.ec" },
    update: { passwordHash, tenantId: tenant.id, role: "SUPER_ADMIN", name: "Super Admin" },
    create: {
      email: "superadmin@rikuchik.ec",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      tenantId: tenant.id,
    },
  });

  // University Admin
  await prisma.user.upsert({
    where: { email: "admin@rikuchik.ec" },
    update: {
      passwordHash,
      tenantId: tenant.id,
      role: "UNIVERSITY",
      name: "Admin Universidad",
    },
    create: {
      email: "admin@rikuchik.ec",
      name: "Admin Universidad",
      passwordHash,
      role: "UNIVERSITY",
      tenantId: tenant.id,
    },
  });

  // Operator
  await prisma.user.upsert({
    where: { email: "emisor@rikuchik.ec" },
    update: { passwordHash, tenantId: tenant.id, role: "OPERATOR", name: "Operador Demo" },
    create: {
      email: "emisor@rikuchik.ec",
      name: "Operador Demo",
      passwordHash,
      role: "OPERATOR",
      tenantId: tenant.id,
    },
  });

  // Verifier
  await prisma.user.upsert({
    where: { email: "auditor@rikuchik.ec" },
    update: { passwordHash, tenantId: tenant.id, role: "VERIFIER", name: "Verificador Demo" },
    create: {
      email: "auditor@rikuchik.ec",
      name: "Verificador Demo",
      passwordHash,
      role: "VERIFIER",
      tenantId: tenant.id,
    },
  });

  const student = await prisma.student.upsert({
    where: {
      tenantId_studentCode: {
        tenantId: tenant.id,
        studentCode: "RK-ST-0001",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      studentCode: "RK-ST-0001",
      firstName: "Adrian",
      lastName: "Arquette",
      email: "adrian.arquette@demo.edu.ec",
      career: "Ingeniería en Ciencias de la Computación",
    },
  });

  await prisma.certificate.upsert({
    where: { publicCode: "rk-demo-code-0001" },
    update: {},
    create: {
      tenantId: tenant.id,
      studentId: student.id,
      serialNumber: "RK-2026-000001",
      publicCode: "rk-demo-code-0001",
      title: "Certificado de Logro Académico",
      status: "ISSUED",
      issuedAt: new Date(),
      qrPayloadHash: "demo-hash",
    },
  });

  console.log("Seed completado con usuarios:");
  console.log("  superadmin@rikuchik.ec / Admin12345! (SUPER_ADMIN)");
  console.log("  admin@rikuchik.ec      / Admin12345! (UNIVERSITY)");
  console.log("  emisor@rikuchik.ec     / Admin12345! (OPERATOR)");
  console.log("  auditor@rikuchik.ec    / Admin12345! (VERIFIER)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
