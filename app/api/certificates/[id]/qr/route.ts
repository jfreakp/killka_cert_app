import QRCode from "qrcode";
import { prisma } from "@/src/lib/prisma";
import { fail } from "@/src/shared/api/response";
import { requirePermission } from "@/src/shared/auth/guards";
import { NotFoundError } from "@/src/shared/errors/app-error";

/* ── GET  /api/certificates/[id]/qr ── */
/* Returns a PNG image of the QR code for the certificate's verification URL */

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("certificates:list");
    const { id } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: { id, tenantId: session.user.tenantId },
      select: { publicCode: true, serialNumber: true },
    });

    if (!certificate) {
      throw new NotFoundError("Certificado no encontrado");
    }

    const origin = new URL(request.url).origin;
    const verifyUrl = `${origin}/verify/${certificate.publicCode}`;

    const pngBuffer = await QRCode.toBuffer(verifyUrl, {
      type: "png",
      width: 400,
      margin: 2,
      color: { dark: "#2c2f31", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
