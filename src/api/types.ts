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

export type UserApprovalStatus = "Pending" | "Approved" | "Declined";

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  staffTitle: string | null;
  isActive: boolean;
  roles: string[];
  approvalStatus: UserApprovalStatus;
  approvalDecidedAtUtc: string | null;
}

export interface CreateStaffUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  staffTitle?: string;
  roles: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ApproveUserRequest {
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

export type PatientSearchBy = "name" | "phone" | "mrn" | "identity" | "email";
export type PatientStatusFilter = "all" | "initial" | "archived";

export interface PatientSummary {
  id: string;
  patientNumber: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

export interface Patient {
  id: string;
  patientNumber: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string | null;
  phone: string | null;
  email: string | null;
  identityNumber: string | null;
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
  identityNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
}

export interface PatientStatusCounts {
  all: number;
  initial: number;
  archived: number;
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
  hasLoggedSupplies: boolean;
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

export interface ItemSupplierLink {
  id: string;
  supplierId: string;
  supplierName: string;
  lastUnitCost: number | null;
  supplierSku: string | null;
  isPreferred: boolean;
}

export type InventorySaleType = "ForDoctor" | "ForPatient";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  sku: string | null;
  notes: string | null;
  currentStock: number;
  parLevel: number;
  reorderQuantity: number | null;
  isActive: boolean;
  isForSale: boolean;
  purchaseFee: number | null;
  saleFee: number | null;
  saleType: InventorySaleType | null;
  package: string | null;
  dimensions: string | null;
  weight: number | null;
  averageCost: number | null;
  margin: number | null;
  valuation: number;
  batches: InventoryBatch[];
  suppliers: ItemSupplierLink[];
}

export interface CreateInventoryItemRequest {
  name: string;
  category: InventoryCategory;
  unit: string;
  sku?: string;
  notes?: string;
  parLevel: number;
  reorderQuantity?: number;
  isForSale: boolean;
  purchaseFee?: number;
  saleFee?: number;
  saleType?: InventorySaleType;
  package?: string;
  dimensions?: string;
  weight?: number;
}

export interface InventorySummary {
  totalValuation: number;
  lowStockCount: number;
  expiringSoonCount: number;
  negativeMarginCount: number;
}

export interface UpdateInventoryItemRequest extends CreateInventoryItemRequest {
  isActive: boolean;
}

export type StockMovementType = "Restock" | "UsageDeduction" | "Waste" | "Adjustment";

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  inventoryBatchId: string | null;
  appointmentTypeId: string | null;
  supplierId: string | null;
  supplierName: string | null;
  unitCost: number | null;
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
  supplierId?: string;
  unitCost?: number;
  notes?: string;
}

export interface AppointmentSupplyUsage {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  type: StockMovementType;
  quantity: number;
  recordedByName: string;
  recordedAtUtc: string;
}

export interface ExpiringBatch {
  inventoryItemId: string;
  inventoryItemName: string;
  batchId: string;
  lotNumber: string | null;
  expiryDate: string;
  quantityRemaining: number;
}

export interface AdjustmentLogEntry {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  newQuantity: number;
  notes: string | null;
  recordedByName: string;
  recordedAtUtc: string;
}

export interface InventoryAlerts {
  lowStock: InventoryItem[];
  expiringSoon: ExpiringBatch[];
}

export interface SupplierItemLink {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  lastUnitCost: number | null;
  supplierSku: string | null;
  isPreferred: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
  linkedItems: SupplierItemLink[];
}

export interface CreateSupplierRequest {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface LinkItemSupplierRequest {
  supplierId: string;
  lastUnitCost?: number;
  supplierSku?: string;
  isPreferred: boolean;
}

export interface DashboardSummary {
  todaysAppointmentsCount: number;
  appointmentsThisWeekCount: number;
  activePatientsCount: number;
  lowStockCount: number;
  expiringSoonCount: number;
  recallDueCount: number;
  estimatedRevenueThisMonth: number;
  inventoryValuation: number;
  completedLast7DaysCount: number;
  noShowLast7DaysCount: number;
  cancelledLast7DaysCount: number;
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

export interface DailyAppointmentStats {
  date: string;
  scheduled: number;
  completed: number;
  noShow: number;
  cancelled: number;
}

export interface AppointmentsTrend {
  from: string;
  to: string;
  daily: DailyAppointmentStats[];
  completionRate: number;
  noShowRate: number;
}

export interface WeeklyPatientGrowth {
  weekStart: string;
  newPatients: number;
}

export interface PatientGrowth {
  from: string;
  to: string;
  totalNewPatients: number;
  weekly: WeeklyPatientGrowth[];
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  estimatedRevenue: number;
}

export interface RevenueTrend {
  monthly: MonthlyRevenue[];
}

export type PurchaseListReason = "LowStock" | "ExpiringSoon" | "Both";

export interface PurchaseListLine {
  inventoryItemId: string;
  inventoryItemName: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  parLevel: number;
  suggestedQuantity: number;
  reason: PurchaseListReason;
}

export interface PurchaseListSupplierGroup {
  supplierId: string | null;
  supplierName: string;
  lines: PurchaseListLine[];
}

export interface CategoryUsage {
  category: InventoryCategory;
  usageQuantity: number;
  wasteQuantity: number;
  estimatedCost: number;
}

export interface ItemUsage {
  inventoryItemId: string;
  inventoryItemName: string;
  usageQuantity: number;
  estimatedCost: number;
}

export interface WasteStat {
  inventoryItemId: string;
  inventoryItemName: string;
  wasteQuantity: number;
  wastePercentage: number;
}

export interface MonthlyCostPoint {
  year: number;
  month: number;
  estimatedCost: number;
}

export interface DoctorUsage {
  dentistUserId: string;
  dentistName: string;
  usageQuantity: number;
  wasteQuantity: number;
  estimatedCost: number;
}

export interface UsageCostReport {
  from: string;
  to: string;
  totalUsageCost: number;
  totalWasteCost: number;
  categoryUsage: CategoryUsage[];
  topUsedItems: ItemUsage[];
  wasteStats: WasteStat[];
  costOverTime: MonthlyCostPoint[];
  usageByDoctor: DoctorUsage[];
}
