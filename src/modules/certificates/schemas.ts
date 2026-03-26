import { z } from "zod";

/* ── Create certificate form ── */

export const createCertificateSchema = z.object({
  studentId: z.string().min(1, "Selecciona un estudiante"),
  title: z.string().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  degree: z.string().min(2, "Mínimo 2 caracteres").max(200, "Máximo 200 caracteres"),
  issueDate: z.string().optional(),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;

/* ── Filter params ── */

export const certificateFilterSchema = z.object({
  status: z.enum(["ALL", "DRAFT", "ISSUED", "REVOKED"]).default("ALL"),
  search: z.string().default(""),
  page: z.number().int().min(1).default(1),
});

export type CertificateFilter = z.infer<typeof certificateFilterSchema>;
