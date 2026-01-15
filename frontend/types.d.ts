/**
 * Centralized Type Definitions for Southern Apparels ERP System
 * All entity types, API types, and common types are defined here
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/** Base entity with common fields */
interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

/** Pagination parameters for list queries */
interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  per_page?: number;
}

/** Generic API response wrapper */
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  total?: number;
  page?: number;
  per_page?: number;
}

/** API error response */
interface ApiError {
  detail: string;
  status_code?: number;
  errors?: Record<string, string[]>;
}

/** HTTP methods used in API calls */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

/** User entity */
interface User extends BaseEntity {
  username: string;
  email: string;
  full_name: string;
  role?: string;
  department?: string;
  designation?: string;
  is_active: boolean;
  is_superuser: boolean;
  department_access?: string[];
  last_login?: string;
  avatar_url?: string;
}

/** User creation payload */
interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: string;
  department?: string;
  designation?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  department_access?: string[];
}

/** User update payload */
interface UserUpdate extends Partial<Omit<UserCreate, "password">> {
  password?: string;
}

/** Login credentials */
interface LoginCredentials {
  username: string;
  password: string;
}

/** Login response */
interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/** Password reset request */
interface PasswordResetRequest {
  email: string;
}

/** Password reset confirmation */
interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// ============================================================================
// CLIENT TYPES (BUYERS & SUPPLIERS)
// ============================================================================

/** Buyer type entity */
interface BuyerType extends BaseEntity {
  name: string;
  description?: string;
  is_active: boolean;
}

/** Buyer entity */
interface Buyer extends BaseEntity {
  buyer_name?: string; // Optional: some pages use this
  brand_name: string;
  company_name?: string;
  country?: string;
  head_office_country?: string; // Optional: some pages use this
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  payment_terms?: string;
  credit_limit?: number;
  currency?: string;
  notes?: string;
  is_active?: boolean;
  logo_url?: string;
  rating?: number; // Optional: buyer rating 0-5
  status?: string; // Optional: active/inactive/on-hold
  buyer_type_id?: number; // Optional: FK to buyer_types table
  buyer_type?: BuyerType; // Optional: populated buyer type relationship
}

/** Buyer creation/update payload */
interface BuyerInput {
  brand_name: string;
  company_name?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  payment_terms?: string;
  credit_limit?: number;
  currency?: string;
  notes?: string;
  is_active?: boolean;
}

/** Supplier entity */
interface Supplier extends BaseEntity {
  supplier_name: string;
  company_name?: string;
  supplier_type?: SupplierType;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  payment_terms?: string;
  currency?: string;
  notes?: string;
  is_active?: boolean;
  rating?: number;
  contact_person?: string;
}

/** Supplier types */
type SupplierType = "fabric" | "trim" | "accessory" | "packaging" | "service" | "other";

/** Supplier creation/update payload */
interface SupplierInput {
  supplier_name: string;
  company_name?: string;
  supplier_type?: SupplierType;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  payment_terms?: string;
  currency?: string;
  notes?: string;
  is_active?: boolean;
}

/** Contact entity */
interface Contact extends BaseEntity {
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  buyer_id?: number;
  supplier_id?: number;
  is_primary?: boolean;
  notes?: string;
  buyer?: Buyer;
  supplier?: Supplier;
  // Additional fields used by contacts page
  contact_person_name?: string;
  department?: string;
  corporate_mail?: string;
  country?: string;
  phone_number?: string;
}

/** Contact creation/update payload */
interface ContactInput {
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  buyer_id?: number;
  supplier_id?: number;
  is_primary?: boolean;
  notes?: string;
}

/** Shipping address entity */
interface ShippingAddress extends BaseEntity {
  address_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  buyer_id?: number;
  supplier_id?: number;
  is_default?: boolean;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
  buyer?: Buyer;
  supplier?: Supplier;
  // Additional fields used by shipping page
  buyer_name?: string;
  brand_name?: string;
  company_name?: string;
  destination_country?: string;
  destination_country_code?: string;
  destination_port?: string;
  place_of_delivery?: string;
  destination_code?: string;
  warehouse_no?: string;
  address?: string;
}

/** Shipping address creation/update payload */
interface ShippingAddressInput {
  address_name: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  buyer_id?: number;
  supplier_id?: number;
  is_default?: boolean;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
}

/** Banking detail entity */
interface BankingDetail extends BaseEntity {
  bank_name: string;
  account_name?: string;
  account_number: string;
  branch_name?: string;
  branch_code?: string;
  swift_code?: string;
  iban?: string;
  routing_number?: string;
  currency?: string;
  buyer_id?: number;
  supplier_id?: number;
  is_primary?: boolean;
  notes?: string;
  buyer?: Buyer;
  supplier?: Supplier;
  // Additional fields used by banking page
  client_name?: string;
  client_type?: string;
  client_id?: number;
  country?: string;
  sort_code?: string;
}

/** Banking detail creation/update payload */
interface BankingDetailInput {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string;
  branch_code?: string;
  swift_code?: string;
  iban?: string;
  routing_number?: string;
  currency?: string;
  buyer_id?: number;
  supplier_id?: number;
  is_primary?: boolean;
  notes?: string;
}

// ============================================================================
// MERCHANDISING TYPES (STYLES, VARIANTS, MATERIALS)
// ============================================================================

/** Style summary entity */
interface StyleSummary extends BaseEntity {
  style_no: string;
  style_name: string;
  description?: string;
  buyer_id: number;
  category?: GarmentCategory;
  sub_category?: string;
  season?: string;
  year?: number;
  target_cost?: number;
  target_price?: number;
  currency?: string;
  status?: StyleStatus;
  image_url?: string;
  tech_pack_url?: string;
  notes?: string;
  buyer?: Buyer;
  variants?: StyleVariant[];
}

/** Style status options */
type StyleStatus = "draft" | "development" | "approved" | "production" | "discontinued";

/** Garment categories */
type GarmentCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "activewear"
  | "intimates"
  | "accessories"
  | "other";

/** Style summary creation/update payload */
interface StyleSummaryInput {
  style_no: string;
  style_name: string;
  description?: string;
  buyer_id: number;
  category?: GarmentCategory;
  sub_category?: string;
  season?: string;
  year?: number;
  target_cost?: number;
  target_price?: number;
  currency?: string;
  status?: StyleStatus;
  image_url?: string;
  notes?: string;
}

/** Style variant entity */
interface StyleVariant extends BaseEntity {
  style_summary_id: number;
  variant_name: string;
  color_id?: number;
  color_name?: string;
  color_code?: string;
  size_range?: string;
  fabric_code?: string;
  fabric_description?: string;
  gsm?: number;
  fabric_composition?: string;
  wash_type?: string;
  print_type?: string;
  embroidery_type?: string;
  status?: StyleStatus;
  cost_per_piece?: number;
  notes?: string;
  style_summary?: StyleSummary;
  required_materials?: RequiredMaterial[];
  color?: ColorMaster;
}

/** Style variant creation/update payload */
interface StyleVariantInput {
  style_summary_id: number;
  variant_name: string;
  color_id?: number;
  color_name?: string;
  color_code?: string;
  size_range?: string;
  fabric_code?: string;
  fabric_description?: string;
  gsm?: number;
  fabric_composition?: string;
  wash_type?: string;
  print_type?: string;
  embroidery_type?: string;
  status?: StyleStatus;
  cost_per_piece?: number;
  notes?: string;
}

/** Material entity */
interface Material extends BaseEntity {
  material_code: string;
  material_name: string;
  material_type: MaterialType;
  category?: string;
  sub_category?: string;
  unit_of_measure: UnitOfMeasure;
  unit_price?: number;
  currency?: string;
  supplier_id?: number;
  lead_time_days?: number;
  min_order_qty?: number;
  description?: string;
  specifications?: string;
  is_active?: boolean;
  supplier?: Supplier;
}

/** Material types */
type MaterialType =
  | "fabric"
  | "trim"
  | "accessory"
  | "packaging"
  | "label"
  | "thread"
  | "button"
  | "zipper"
  | "elastic"
  | "other";

/** Units of measure */
type UnitOfMeasure =
  | "meter"
  | "yard"
  | "kg"
  | "gram"
  | "piece"
  | "dozen"
  | "gross"
  | "roll"
  | "set"
  | "pair";

/** Material creation/update payload */
interface MaterialInput {
  material_code: string;
  material_name: string;
  material_type: MaterialType;
  category?: string;
  sub_category?: string;
  unit_of_measure: UnitOfMeasure;
  unit_price?: number;
  currency?: string;
  supplier_id?: number;
  lead_time_days?: number;
  min_order_qty?: number;
  description?: string;
  specifications?: string;
  is_active?: boolean;
}

/** Required material entity (BOM - Bill of Materials) */
interface RequiredMaterial extends BaseEntity {
  style_variant_id: number;
  material_id: number;
  consumption_per_piece: number;
  wastage_percentage?: number;
  unit_of_measure: UnitOfMeasure;
  placement?: string;
  notes?: string;
  style_variant?: StyleVariant;
  material?: Material;
}

/** Required material creation/update payload */
interface RequiredMaterialInput {
  style_variant_id: number;
  material_id: number;
  consumption_per_piece: number;
  wastage_percentage?: number;
  unit_of_measure: UnitOfMeasure;
  placement?: string;
  notes?: string;
}

// ============================================================================
// SAMPLE DEPARTMENT TYPES
// ============================================================================

/** Sample entity */
interface Sample extends BaseEntity {
  sample_id: string;
  style_variant_id: number;
  sample_type: SampleType;
  buyer_id: number;
  status: SampleStatus;
  requested_date?: string;
  due_date?: string;
  completion_date?: string;
  quantity?: number;
  size?: string;
  color?: string;
  fabric_details?: string;
  wash_details?: string;
  print_details?: string;
  embroidery_details?: string;
  remarks?: string;
  courier_details?: string;
  tracking_number?: string;
  shipped_date?: string;
  received_date?: string;
  feedback?: string;
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_date?: string;
  style_variant?: StyleVariant;
  buyer?: Buyer;
  tna?: SampleTNA[];
  operations?: SampleOperation[];
}

/** Sample types */
type SampleType =
  | "proto"
  | "fit"
  | "size_set"
  | "pp"
  | "top"
  | "shipment"
  | "photo"
  | "sales"
  | "other";

/** Sample status options */
type SampleStatus =
  | "pending"
  | "in_progress"
  | "cutting"
  | "sewing"
  | "finishing"
  | "quality_check"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Approval status options */
type ApprovalStatus = "pending" | "approved" | "rejected" | "conditional";

/** Sample creation/update payload */
interface SampleInput {
  sample_id?: string;
  style_variant_id: number;
  sample_type: SampleType;
  buyer_id: number;
  status?: SampleStatus;
  requested_date?: string;
  due_date?: string;
  quantity?: number;
  size?: string;
  color?: string;
  fabric_details?: string;
  wash_details?: string;
  print_details?: string;
  embroidery_details?: string;
  remarks?: string;
}

/** Sample TNA (Time and Action) entity */
interface SampleTNA extends BaseEntity {
  sample_id: number;
  activity_name: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  responsible_person?: string;
  status: TNAStatus;
  remarks?: string;
  sequence_order?: number;
  sample?: Sample;
}

/** TNA status options */
type TNAStatus = "not_started" | "in_progress" | "completed" | "delayed" | "cancelled";

/** Sample TNA creation/update payload */
interface SampleTNAInput {
  sample_id: number;
  activity_name: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  responsible_person?: string;
  status?: TNAStatus;
  remarks?: string;
  sequence_order?: number;
}

/** Sample operation entity */
interface SampleOperation extends BaseEntity {
  sample_id: number;
  operation_name: string;
  operation_code?: string;
  machine_type?: string;
  smv: number;
  sequence_order: number;
  notes?: string;
  sample?: Sample;
}

/** Sample operation creation/update payload */
interface SampleOperationInput {
  sample_id: number;
  operation_name: string;
  operation_code?: string;
  machine_type?: string;
  smv: number;
  sequence_order: number;
  notes?: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

/** Order entity */
interface Order extends BaseEntity {
  order_no: string;
  po_number?: string;
  buyer_id: number;
  style_variant_id: number;
  order_date: string;
  delivery_date: string;
  status: OrderStatus;
  total_quantity: number;
  unit_price: number;
  total_value: number;
  currency?: string;
  payment_terms?: string;
  shipping_terms?: string;
  destination_port?: string;
  ship_mode?: ShipMode;
  remarks?: string;
  buyer?: Buyer;
  style_variant?: StyleVariant;
  size_breakdown?: OrderSizeBreakdown[];
  shipments?: OrderShipment[];
}

/** Order status options */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready_to_ship"
  | "partially_shipped"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

/** Shipping modes */
type ShipMode = "sea" | "air" | "courier" | "road" | "multimodal";

/** Order creation/update payload */
interface OrderInput {
  order_no?: string;
  po_number?: string;
  buyer_id: number;
  style_variant_id: number;
  order_date: string;
  delivery_date: string;
  status?: OrderStatus;
  total_quantity: number;
  unit_price: number;
  currency?: string;
  payment_terms?: string;
  shipping_terms?: string;
  destination_port?: string;
  ship_mode?: ShipMode;
  remarks?: string;
}

/** Order size breakdown entity */
interface OrderSizeBreakdown extends BaseEntity {
  order_id: number;
  size: string;
  quantity: number;
  order?: Order;
}

/** Order shipment entity */
interface OrderShipment extends BaseEntity {
  order_id: number;
  shipment_no: string;
  shipped_quantity: number;
  shipped_date: string;
  eta_date?: string;
  actual_arrival_date?: string;
  container_number?: string;
  bl_number?: string;
  invoice_number?: string;
  invoice_value?: number;
  status: ShipmentStatus;
  order?: Order;
}

/** Shipment status options */
type ShipmentStatus =
  | "pending"
  | "loading"
  | "in_transit"
  | "arrived"
  | "customs_clearance"
  | "delivered";

// ============================================================================
// PRODUCTION TYPES
// ============================================================================

/** Production plan entity */
interface ProductionPlan extends BaseEntity {
  order_id: number;
  line_number?: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  target_quantity: number;
  completed_quantity?: number;
  efficiency?: number;
  status: ProductionStatus;
  remarks?: string;
  order?: Order;
}

/** Production status options */
type ProductionStatus =
  | "not_started"
  | "cutting"
  | "sewing"
  | "finishing"
  | "packing"
  | "completed"
  | "on_hold";

/** Production plan creation/update payload */
interface ProductionPlanInput {
  order_id: number;
  line_number?: string;
  planned_start_date: string;
  planned_end_date: string;
  target_quantity: number;
  status?: ProductionStatus;
  remarks?: string;
}

// ============================================================================
// INVENTORY TYPES
// ============================================================================

/** Inventory item entity */
interface InventoryItem extends BaseEntity {
  material_id: number;
  warehouse_location?: string;
  bin_location?: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  unit_of_measure: UnitOfMeasure;
  last_received_date?: string;
  last_issued_date?: string;
  reorder_level?: number;
  reorder_quantity?: number;
  material?: Material;
}

/** Inventory transaction entity */
interface InventoryTransaction extends BaseEntity {
  inventory_item_id: number;
  transaction_type: TransactionType;
  quantity: number;
  reference_type?: string;
  reference_id?: number;
  transaction_date: string;
  remarks?: string;
  performed_by?: string;
  inventory_item?: InventoryItem;
}

/** Transaction types */
type TransactionType =
  | "receipt"
  | "issue"
  | "adjustment"
  | "transfer"
  | "return";

/** Inventory item creation/update payload */
interface InventoryItemInput {
  material_id: number;
  warehouse_location?: string;
  bin_location?: string;
  quantity_on_hand: number;
  quantity_reserved?: number;
  unit_of_measure: UnitOfMeasure;
  reorder_level?: number;
  reorder_quantity?: number;
}

// ============================================================================
// MASTER DATA TYPES
// ============================================================================

/** Color master entity */
interface ColorMaster extends BaseEntity {
  color_name: string;
  color_code: string;
  hex_value?: string;
  category?: ColorCategory;
  pantone_code?: string;
  is_active?: boolean;
}

/** Color categories */
type ColorCategory =
  | "basic"
  | "primary"
  | "secondary"
  | "neutral"
  | "pastel"
  | "bright"
  | "dark"
  | "metallic";

/** Color master creation/update payload */
interface ColorMasterInput {
  color_name: string;
  color_code: string;
  hex_value?: string;
  category?: ColorCategory;
  pantone_code?: string;
  is_active?: boolean;
}

/** Size master entity */
interface SizeMaster extends BaseEntity {
  size_name: string;
  size_code: string;
  category?: SizeCategory;
  sort_order?: number;
  measurements?: Record<string, number>;
  is_active?: boolean;
}

/** Size categories */
type SizeCategory =
  | "numeric"
  | "alpha"
  | "age"
  | "waist"
  | "length"
  | "custom";

/** Size master creation/update payload */
interface SizeMasterInput {
  size_name: string;
  size_code: string;
  category?: SizeCategory;
  sort_order?: number;
  measurements?: Record<string, number>;
  is_active?: boolean;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/** Dashboard statistics */
interface DashboardStats {
  total_buyers: number;
  total_suppliers: number;
  total_styles: number;
  active_samples: number;
  active_orders: number;
  pending_orders: number;
  production_efficiency: number;
  inventory_value: number;
  revenue_this_month: number;
  orders_this_month: number;
}

/** Report export options */
interface ReportExportOptions {
  type: ReportType;
  format: ExportFormat;
  date_from?: string;
  date_to?: string;
  filters?: Record<string, any>;
}

/** Report types */
type ReportType =
  | "buyers"
  | "suppliers"
  | "orders"
  | "samples"
  | "production"
  | "inventory"
  | "financial";

/** Export formats */
type ExportFormat = "pdf" | "excel" | "csv";

// ============================================================================
// UI & NAVIGATION TYPES
// ============================================================================

/** Navigation group */
interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Navigation item */
interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  isAdminOnly?: boolean;
  items?: NavItem[];
}

/** Notification */
interface Notification {
  id: string;
  title: string;
  desc: string;
  date: string;
  type?: "info" | "confirm" | "warning" | "error";
  unread_message?: boolean;
  action_url?: string;
}

/** Table column definition */
interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string | number;
}

/** Filter option */
interface FilterOption {
  label: string;
  value: string | number;
}

/** Sort configuration */
interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

/** Pagination configuration */
interface PaginationConfig {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/** Form field configuration */
interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FilterOption[];
  validation?: FormValidation;
  defaultValue?: any;
}

/** Form field types */
type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "datetime"
  | "file";

/** Form validation rules */
interface FormValidation {
  required?: string;
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: (value: any) => string | undefined;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Make all properties optional deeply */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract the response type from a service function */
type ServiceResponse<T> = Promise<ApiResponse<T>>;

/** ID type (can be extended for UUID support) */
type EntityId = number;

/** Date string in ISO format */
type ISODateString = string;

/** Currency code (ISO 4217) */
type CurrencyCode = "USD" | "EUR" | "GBP" | "BDT" | "INR" | "CNY" | "JPY";

/** Country code (ISO 3166-1 alpha-2) */
type CountryCode = string;

// ============================================================================
// DEPARTMENT ACCESS TYPES
// ============================================================================

/** Department IDs for access control - Single source of truth */
const DEPARTMENT_IDS = {
  CLIENT_INFO: "client_info",
  SAMPLE_DEPARTMENT: "sample_department",
  MERCHANDISING: "merchandising",
  ORDERS: "orders",
  PRODUCTION: "production",
  INVENTORY: "inventory",
  REPORTS: "reports",
  USER_MANAGEMENT: "user_management",
} as const;

/** Department ID type derived from DEPARTMENT_IDS */
type DepartmentId = (typeof DEPARTMENT_IDS)[keyof typeof DEPARTMENT_IDS];

/** Department display names for UI */
const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  client_info: "Client Info",
  sample_department: "Sample Department",
  merchandising: "Merchandising",
  orders: "Orders",
  production: "Production",
  inventory: "Inventory",
  reports: "Reports",
  user_management: "User Management",
};

/** Menu title to Department ID mapping */
const MENU_TO_DEPARTMENT: Record<string, DepartmentId> = {
  "Client Info": "client_info",
  "Sample Department": "sample_department",
  "Merchandising": "merchandising",
  "Order Info": "orders",
  "Orders": "orders",
  "Production Planning": "production",
  "Store & Inventory": "inventory",
  "Reports": "reports",
  "User Management": "user_management",
  // Merchandising sub-items
  "Material Details": "merchandising",
  "Size Details": "merchandising",
  "Sample Development": "merchandising",
  "Style Management": "merchandising",
  "Style Variants": "merchandising",
  "CM Calculation": "merchandising",
};

/** Route prefix to Department ID mapping */
const ROUTE_TO_DEPARTMENT: Record<string, DepartmentId> = {
  "/dashboard/erp/clients": "client_info",
  "/dashboard/erp/samples": "sample_department",
  "/dashboard/erp/merchandising": "merchandising",
  "/dashboard/erp/orders": "orders",
  "/dashboard/erp/production": "production",
  "/dashboard/erp/inventory": "inventory",
  "/dashboard/erp/reports": "reports",
  "/dashboard/erp/users": "user_management",
};

/** User permissions */
interface UserPermissions {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_approve: boolean;
}

/** Department permission map */
type DepartmentPermissions = Record<DepartmentId, UserPermissions>;

/** All available department IDs as array for iteration */
const ALL_DEPARTMENT_IDS: DepartmentId[] = Object.values(DEPARTMENT_IDS);
