export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  skip: number;
  take: number;
}

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  user: UserSummary;
}

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  staffTitle: string | null;
  isActive: boolean;
  roles: string[];
}

export interface CreateStaffUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  staffTitle?: string;
  roles: string[];
}

export type MedicalHistoryType = "Allergy" | "Medication" | "Condition";

export interface MedicalHistoryEntry {
  id: string;
  type: MedicalHistoryType;
  description: string;
  severity: string | null;
  isActive: boolean;
  notedAtUtc: string;
}

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string | null;
  isActive: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceGroupNumber: string | null;
  isActive: boolean;
  medicalHistory: MedicalHistoryEntry[];
}

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
}

export interface CreateMedicalHistoryEntryRequest {
  type: MedicalHistoryType;
  description: string;
  severity?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  defaultDurationMinutes: number;
  color: string | null;
  recallIntervalMonths: number | null;
  isActive: boolean;
}

export interface Chair {
  id: string;
  name: string;
  isActive: boolean;
}

export interface StaffDirectoryEntry {
  id: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export type AppointmentStatus = "Scheduled" | "Confirmed" | "CheckedIn" | "Completed" | "NoShow" | "Cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistUserId: string;
  dentistName: string;
  chairId: string | null;
  chairName: string | null;
  appointmentTypeId: string;
  appointmentTypeName: string;
  startAtUtc: string;
  endAtUtc: string;
  status: AppointmentStatus;
  notes: string | null;
  cancelledReason: string | null;
}

export interface CreateAppointmentRequest {
  patientId: string;
  dentistUserId: string;
  chairId?: string;
  appointmentTypeId: string;
  startAtUtc: string;
  endAtUtc: string;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  cancelledReason?: string;
}

export interface RescheduleAppointmentRequest {
  dentistUserId: string;
  chairId?: string;
  appointmentTypeId: string;
  startAtUtc: string;
  endAtUtc: string;
  notes?: string;
}

export type ToothStatus =
  | "Healthy"
  | "Decayed"
  | "Filled"
  | "Crowned"
  | "RootCanal"
  | "Missing"
  | "Implant"
  | "Extracted";

export interface ToothRecord {
  id: string;
  toothNumber: number;
  status: ToothStatus;
  surface: string | null;
  notes: string | null;
  recordedAtUtc: string;
  recordedByName: string;
}

export interface UpsertToothRecordRequest {
  toothNumber: number;
  status: ToothStatus;
  surface?: string;
  notes?: string;
}

export type TreatmentPlanStatus = "Draft" | "Active" | "Completed" | "Cancelled";
export type TreatmentPlanItemStatus = "Planned" | "InProgress" | "Done" | "Cancelled";

export interface TreatmentPlanItem {
  id: string;
  description: string;
  toothNumber: number | null;
  status: TreatmentPlanItemStatus;
  appointmentId: string | null;
  estimatedCost: number | null;
  sortOrder: number;
}

export interface TreatmentPlan {
  id: string;
  title: string;
  status: TreatmentPlanStatus;
  createdAtUtc: string;
  items: TreatmentPlanItem[];
}

export interface CreateTreatmentPlanItemRequest {
  description: string;
  toothNumber?: number;
  estimatedCost?: number;
}

export interface CreateTreatmentPlanRequest {
  title: string;
  items: CreateTreatmentPlanItemRequest[];
}

export interface UpdateTreatmentPlanItemRequest {
  status: TreatmentPlanItemStatus;
  appointmentId?: string;
}

export interface VisitNote {
  id: string;
  appointmentId: string;
  patientId: string;
  authoredByName: string;
  noteText: string;
  proceduresPerformed: string | null;
  createdAtUtc: string;
}

export interface CreateVisitNoteRequest {
  noteText: string;
  proceduresPerformed?: string;
}

export type AttachmentType = "Xray" | "Photo" | "ConsentForm" | "Other";

export interface Attachment {
  id: string;
  type: AttachmentType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAtUtc: string;
  uploadedByName: string;
}

export type InventoryCategory = "Consumable" | "Anesthetic" | "Ppe" | "Instrument" | "Other";

export interface InventoryBatch {
  id: string;
  lotNumber: string | null;
  expiryDate: string | null;
  quantityRemaining: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  supplierName: string | null;
  supplierContact: string | null;
  currentStock: number;
  parLevel: number;
  isActive: boolean;
  batches: InventoryBatch[];
}

export interface CreateInventoryItemRequest {
  name: string;
  category: InventoryCategory;
  unit: string;
  supplierName?: string;
  supplierContact?: string;
  parLevel: number;
}

export type StockMovementType = "Restock" | "UsageDeduction" | "Waste" | "Adjustment";

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  inventoryBatchId: string | null;
  appointmentTypeId: string | null;
  notes: string | null;
  recordedByName: string;
  recordedAtUtc: string;
}

export interface CreateStockMovementRequest {
  type: StockMovementType;
  quantity: number;
  lotNumber?: string;
  expiryDate?: string;
  appointmentTypeId?: string;
  appointmentId?: string;
  notes?: string;
}

export interface ExpiringBatch {
  inventoryItemId: string;
  inventoryItemName: string;
  batchId: string;
  lotNumber: string | null;
  expiryDate: string;
  quantityRemaining: number;
}

export interface InventoryAlerts {
  lowStock: InventoryItem[];
  expiringSoon: ExpiringBatch[];
}

export interface DashboardSummary {
  todaysAppointmentsCount: number;
  appointmentsThisWeekCount: number;
  activePatientsCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  recallDueCount: number;
}

export interface RecallReminder {
  id: string;
  patientId: string;
  patientName: string;
  appointmentTypeName: string;
  dueDate: string;
}

export interface CombinedAlerts {
  lowStock: InventoryItem[];
  expiringSoon: ExpiringBatch[];
  recallDue: RecallReminder[];
}

export type AuditAction = "Created" | "Updated" | "Deleted";

export interface AuditLogEntry {
  id: string;
  userName: string;
  entityName: string;
  entityId: string;
  action: AuditAction;
  changedFieldsJson: string | null;
  timestampUtc: string;
}
