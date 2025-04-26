export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: "student" | "staff" | "admin";
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  user_type: "student" | "staff";
  department?: string;
  phone_number?: string;
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
  model_number: string;
  serial_number: string;
  category: string;
  location: string;
  condition: "excellent" | "good" | "fair" | "poor" | "maintenance";
  status:
    | "available"
    | "in_use"
    | "reserved"
    | "maintenance"
    | "out_of_service";
  image_url?: string;
  manual_url?: string;
  purchase_date?: string;
  last_maintained?: string;
  next_maintenance?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  maintenance_type: "routine" | "repair" | "inspection" | "calibration";
  description: string;
  maintenance_date: string;
  next_maintenance_date?: string;
  cost?: number;
  performed_by: string;
  created_at: string;
}

export interface Booking {
  id: number;
  equipment: Equipment;
  user: User;
  start_time: string;
  end_time: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  approved_by?: User;
  rejection_reason?: string;
  created_at: string;
}

export interface BookingRequest {
  equipment_id: number;
  start_time: string;
  end_time: string;
  purpose: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minimum_quantity: number;
  unit: string;
  location: string;
  price_per_unit: number;
  last_restocked: string;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface StockMovement {
  id: number;
  item_id: number;
  movement_type: "in" | "out" | "adjust";
  quantity: number;
  reference: string;
  notes?: string;
  created_by: number;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  related_object?: {
    type: string;
    id: number;
    str: string;
  };
}

export interface DashboardStats {
  equipment_stats: {
    total: number;
    available: number;
    under_maintenance: number;
  };
  booking_stats: {
    pending: number;
    active: number;
    monthly_usage: number;
  };
  inventory_stats: {
    low_stock: number;
    total_items: number;
  };
  maintenance_stats: {
    scheduled: number;
    completed: number;
  };
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface FileUploadResponse {
  urls: string[];
  fileIds: string[];
}

export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  mimetype: string;
  created_at: string;
}

export interface BookingFilters {
  start_date?: string | Date;
  end_date?: string | Date;
  status?: "pending" | "approved" | "rejected" | "cancelled";
  equipment_id?: number;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
