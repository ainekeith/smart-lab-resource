export interface DashboardStats {
  overview: {
    total_equipment: number;
    available_equipment: number;
    maintenance_equipment: number;
    pending_bookings: number;
    low_stock_items: number;
    utilization_rate: number;
  };
  activity: {
    daily_bookings: Array<{
      date: string;
      count: number;
    }>;
    total_bookings: number;
    avg_duration: number;
  };
  equipment_status: Array<{
    name: string;
    value: number;
  }>;
}
