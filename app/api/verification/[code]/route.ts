import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { publicCode: code },
      include: {
        tenant: true,
        student: true,
      },
    });

    if (!certificate) {
      return ok({
        valid: false,
        status: "NOT_FOUND",
        message: "Certificado no encontrado",
      });
    }

    return ok({
      valid: certificate.status === "ISSUED",
      status: certificate.status,
      studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
      university: certificate.tenant.name,
      title: certificate.title,
      issuedAt: certificate.issuedAt,
      serialNumber: certificate.serialNumber,
    });
  } catch (error) {
    return fail(error);
  }
}
