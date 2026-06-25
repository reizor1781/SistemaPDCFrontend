// ========================
// AUTH & USERS
// ========================
export type UserRole = 'admin' | 'engineer' | 'technician' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  lastLogin?: string;
  active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ========================
// PARK AREAS
// ========================
export type ParkArea =
  | 'Vertigo'
  | 'Infantiles'
  | 'Familiares'
  | 'Acuaticas';

// ========================
// ATTRACTIONS
// ========================
export type AttractionStatus = 'operational' | 'maintenance' | 'inactive' | 'inspection';

export interface Motor {
  id: string;
  tag: string;
  description: string;
  power_kw: number;
  voltage_v: number;
  current_a: number;
  rpm: number;
  phase: number;
}

export interface VFD {
  id: string;
  tag: string;
  brand: string;
  model: string;
  power_kw: number;
  associated_motor: string;
}

export interface PLC {
  id: string;
  tag: string;
  brand: string;
  model: string;
  io_digital_in: number;
  io_digital_out: number;
  io_analog_in: number;
  io_analog_out: number;
  program_version: string;
}

export interface Sensor {
  id: string;
  tag: string;
  type: string;
  brand: string;
  model: string;
  location: string;
}

export interface TechnicalSpecs {
  manufacturer: string;
  model: string;
  year_installed: number;
  installed_power_kw: number;
  operating_voltage_v: number[];
  control_voltage_v: number;
  frequency_hz: number;
  protection_ip: string;
  motors: Motor[];
  vfds: VFD[];
  plcs: PLC[];
  sensors: Sensor[];
  certifications: string[];
}

export interface Attraction {
  id: string;
  name: string;
  code: string;
  area: ParkArea;
  status: AttractionStatus;
  description: string;
  image: string;
  capacity: number;
  height_m: number;
  duration_min: number;
  technical_specs: TechnicalSpecs;
  total_plans: number;
  total_manuals: number;
  pending_docs: number;
  pending_plans?: number;
  pending_manuals?: number;
  last_maintenance: string;
  next_maintenance: string;
}

// ========================
// PLANS / DOCUMENTS
// ========================
export type PlanType =
  | 'power_diagram'
  | 'control_diagram'
  | 'single_line'
  | 'plc_diagram'
  | 'communication'
  | 'grounding'
  | 'lighting'
  | 'mechanical'
  | 'hydraulic'
  | 'pneumatic';

export type PlanStatus = 'approved' | 'draft' | 'review' | 'obsolete';

export interface PlanRevision {
  id: string;
  version: string;
  date: string;
  author: string;
  description: string;
  file_url: string;
  file_size_kb: number;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  content: string;
  date: string;
  resolved: boolean;
  page_ref?: number;
}

export interface ElectricalPlan {
  id: string;
  attraction_id: string;
  plan_number: string;
  title: string;
  type: PlanType;
  status: PlanStatus;
  current_version: string;
  created_date: string;
  updated_date: string;
  author: string;
  reviewer?: string;
  approver?: string;
  file_url: string;
  file_size_kb: number;
  pages: number;
  revisions: PlanRevision[];
  comments: Comment[];
  tags: string[];
  description: string;
}

export type ManualCategory = 'operation' | 'maintenance';
export type ManualStatus = 'active' | 'draft' | 'review' | 'obsolete';

export interface AttractionManual {
  id: string;
  attraction_id: string;
  manual_number: string;
  title: string;
  category: ManualCategory;
  status: ManualStatus;
  current_version: string;
  created_date: string;
  updated_date: string;
  author: string;
  file_url: string;
  file_size_kb: number;
  pages: number;
  tags: string[];
  description: string;
}

// ========================
// MAINTENANCE
// ========================
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'inspection';
export type MaintenanceStatus = 'completed' | 'in_progress' | 'scheduled' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  attraction_id: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  date: string;
  technician: string;
  description: string;
  duration_hours: number;
  parts_replaced?: string[];
  observations?: string;
  next_action?: string;
}

// ========================
// DASHBOARD STATS
// ========================
export interface DashboardStats {
  total_attractions: number;
  total_plans: number;
  pending_docs: number;
  operational: number;
  in_maintenance: number;
  recent_updates: RecentUpdate[];
  plans_by_type: { type: string; count: number }[];
  status_distribution: { status: string; count: number }[];
}

export interface RecentUpdate {
  id: string;
  type: 'plan_upload' | 'plan_update' | 'maintenance' | 'comment';
  attraction_name: string;
  description: string;
  user: string;
  date: string;
}
