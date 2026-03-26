import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { prisma } from "@/src/lib/prisma";
import { fail, ok } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";
import { NotFoundError, ValidationError } from "@/src/shared/errors/app-error";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "certificates");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["application/pdf"];

/* ── POST  /api/certificates/[id]/pdf ── */

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("certificates:create");
    const { id } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: { id, tenantId: session.user.tenantId },
    });

    if (!certificate) {
      throw new NotFoundError("Certificado no encontrado");
    }

    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!file || !(file instanceof File)) {
      throw new ValidationError("No se proporcionó un archivo PDF");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError("Solo se permiten archivos PDF");
    }

    if (file.size > MAX_SIZE) {
      throw new ValidationError("El archivo excede el tamaño máximo de 10 MB");
    }

    /* Read and hash the file for integrity verification */
    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileHash = createHash("sha256").update(bytes).digest("hex");
    const fileName = `${certificate.serialNumber.replace(/\//g, "-")}_${fileHash.slice(0, 8)}.pdf`;

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, fileName), bytes);

    const pdfUrl = `/uploads/certificates/${fileName}`;

    const updated = await prisma.certificate.update({
      where: { id },
      data: { pdfUrl, metadata: { ...(certificate.metadata as object ?? {}), pdfHash: fileHash } },
      include: { student: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        actorId: session.user.id,
        action: "UPLOAD_PDF",
        entity: "Certificate",
        entityId: certificate.id,
        result: "SUCCESS",
        details: { fileName, fileHash },
      },
    });

    return ok({ pdfUrl: updated.pdfUrl, pdfHash: fileHash });
  } catch (error) {
    return fail(error);
  }
}
