export interface Student {
  id: string;
  tenantId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  career: string;
}
