export type CertificateStatus = "DRAFT" | "ISSUED" | "REVOKED";

export interface Certificate {
  id: string;
  tenantId: string;
  studentId: string;
  serialNumber: string;
  publicCode: string;
  title: string;
  status: CertificateStatus;
  issuedAt: Date | null;
  revokedAt: Date | null;
}
