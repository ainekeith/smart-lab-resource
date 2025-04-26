import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Users, Database, Activity, BarChart } from "lucide-react";
import DashboardCard from "./DashboardCard";
import reportService from "../../services/report.service";
import { DashboardStats } from "../../types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { withAccessControl } from "../common/withAccessControl";
import dashboardService from "../../services/dashboard.service";
import { DashboardStats as DashboardStatsNew } from "../../types/dashboard";

const COLORS = ["#1976d2", "#00897b", "#ff9800", "#f44336"];

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsNew | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Replace mock data with real data
  const usageData =
    stats?.activity.daily_bookings.map((booking) => ({
      name: new Date(booking.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: booking.count,
    })) || [];

  const equipmentStatusData = stats?.equipment_status || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<BarChart size={20} />}
          onClick={() => navigate("/reports")}
        >
          View Reports
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Equipment"
            value={stats?.overview.total_equipment || 0}
            icon={<Database size={24} />}
            description={`${
              stats?.overview.available_equipment || 0
            } available`}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Utilization Rate"
            value={stats?.overview.utilization_rate || 0}
            icon={<Activity size={24} />}
            description="% Equipment in use"
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Bookings"
            value={stats?.overview.pending_bookings || 0}
            icon={<Users size={24} />}
            description="Need attention"
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Low Stock Items"
            value={stats?.overview.low_stock_items || 0}
            icon={<Database size={24} />}
            description="Need restocking"
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Equipment Usage Trend
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={usageData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Equipment Usage"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Equipment Status
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  width: "100%",
                  height: 250,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={equipmentStatusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      label={(entry) => entry.name}
                    >
                      {equipmentStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                System Overview
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="primary.main">
                      {stats?.equipment_stats.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Equipment
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="info.main">
                      {stats?.booking_stats.active || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Bookings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      {stats?.maintenance_stats.scheduled || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Maintenance
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {stats?.inventory_stats.total_items || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inventory Items
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAccessControl(AdminDashboard, {
  requiredRoles: ["admin"],
});
