import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Science,
  Inventory2,
  CalendarMonth,
  Assessment,
  CheckCircle,
  Warning,
  Schedule,
  Person,
  ArrowForward,
  TrendingUp,
  Groups,
  Timer,
  Construction,
  School,
  SupervisorAccount,
  Assignment,
  Refresh,
  Notifications,
  Add,
} from "@mui/icons-material";
import axiosInstance from "../services/axiosConfig";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Get user type from Redux store
  const { user } = useSelector((state) => state.auth);
  const userType = user?.user_type || "student"; // Default to student if no type

  // State for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentBookings: [],
    equipmentStatus: [],
    notifications: [],
  });

  // Transform stats data to match frontend format
  const transformStats = (statsData) => {
    if (!statsData) return [];

    switch (userType) {
      case "admin":
        return [
          {
            title: "Total Equipment",
            value: statsData.total_equipment || 0,
            icon: <Science sx={{ color: theme.palette.primary.main }} />,
            trend: `+${statsData.new_equipment || 0} this month`,
            trendColor: theme.palette.success.main,
          },
          {
            title: "Active Users",
            value: statsData.active_users || 0,
            icon: <Groups sx={{ color: theme.palette.primary.main }} />,
            trend: `+${statsData.new_users || 0} this month`,
            trendColor: theme.palette.success.main,
          },
          {
            title: "Pending Requests",
            value: statsData.pending_requests || 0,
            icon: <Schedule sx={{ color: theme.palette.warning.main }} />,
            trend: `${statsData.pending_change || 0} from yesterday`,
            trendColor: theme.palette.warning.main,
          },
          {
            title: "Success Rate",
            value: `${statsData.success_rate || 0}%`,
            icon: <CheckCircle sx={{ color: theme.palette.success.main }} />,
            trend: `${statsData.success_rate_change || 0}% from last month`,
            trendColor: theme.palette.success.main,
          },
        ];
      case "staff":
        return [
          {
            title: "Equipment Status",
            value: statsData.equipment_status || 0,
            icon: <Science sx={{ color: theme.palette.primary.main }} />,
            trend: "Active Now",
            trendColor: theme.palette.success.main,
          },
          {
            title: "Student Requests",
            value: statsData.student_requests || 0,
            icon: <School sx={{ color: theme.palette.warning.main }} />,
            trend: "Pending Review",
            trendColor: theme.palette.warning.main,
          },
          {
            title: "Maintenance Due",
            value: statsData.maintenance_due || 0,
            icon: <Construction sx={{ color: theme.palette.error.main }} />,
            trend: "Next 7 days",
            trendColor: theme.palette.error.main,
          },
          {
            title: "Department Usage",
            value: `${statsData.department_usage || 0}%`,
            icon: <Assessment sx={{ color: theme.palette.info.main }} />,
            trend: `${statsData.usage_change || 0}% efficiency`,
            trendColor: theme.palette.success.main,
          },
        ];
      default: // student
        return [
          {
            title: "My Bookings",
            value: statsData.total_bookings || 0,
            icon: <CalendarMonth sx={{ color: theme.palette.primary.main }} />,
            trend: `${statsData.upcoming_bookings || 0} Upcoming`,
            trendColor: theme.palette.success.main,
          },
          {
            title: "Lab Hours",
            value: `${statsData.lab_hours || 0}h`,
            icon: <Timer sx={{ color: theme.palette.primary.main }} />,
            trend: "This Month",
            trendColor: theme.palette.success.main,
          },
          {
            title: "Success Rate",
            value: `${statsData.success_rate || 0}%`,
            icon: <CheckCircle sx={{ color: theme.palette.success.main }} />,
            trend: "Completed Sessions",
            trendColor: theme.palette.success.main,
          },
        ];
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats based on user type
        const statsResponse = await axiosInstance.get(
          `/reports/${userType}_statistics/`
        );

        // Fetch recent bookings
        const bookingsResponse = await axiosInstance.get(
          "/reports/recent_bookings/"
        );

        // Fetch equipment status
        const equipmentResponse = await axiosInstance.get(
          "/reports/equipment_status/"
        );

        // Fetch notifications
        const notificationsResponse = await axiosInstance.get(
          "/reports/notifications/"
        );

        setDashboardData({
          stats: transformStats(statsResponse.data),
          recentBookings: bookingsResponse.data || [],
          equipmentStatus: equipmentResponse.data || [],
          notifications: notificationsResponse.data || [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userType]);

  const getStatusColor = (status) => {
    const colors = {
      approved: theme.palette.success.main,
      pending: theme.palette.warning.main,
      rejected: theme.palette.error.main,
      available: theme.palette.success.main,
      "in use": theme.palette.info.main,
      maintenance: theme.palette.warning.main,
    };
    return colors[status?.toLowerCase()] || theme.palette.grey[500];
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case "in use":
        return <Schedule sx={{ color: theme.palette.info.main }} />;
      case "maintenance":
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      default:
        return <Warning sx={{ color: theme.palette.error.main }} />;
    }
  };

  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    switch (userType) {
      case "admin":
        return "System Overview";
      case "staff":
        return "Laboratory Management";
      default:
        return "My Laboratory Dashboard";
    }
  };

  // Get role-specific icon
  const getRoleIcon = () => {
    switch (userType) {
      case "admin":
        return <SupervisorAccount sx={{ color: theme.palette.primary.main }} />;
      case "staff":
        return <Person sx={{ color: theme.palette.primary.main }} />;
      default:
        return <School sx={{ color: theme.palette.primary.main }} />;
    }
  };

  const StatCard = ({ stat }) => (
    <motion.div variants={itemVariants}>
      <Card
        sx={{
          height: "100%",
          bgcolor: theme.palette.background.paper,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          borderRadius: 2,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {stat.icon}
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stat.value}
              </Typography>
            </Box>
            <Typography variant="subtitle2" color="text.secondary">
              {stat.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "flex",
                alignItems: "center",
                color: stat.trendColor,
                gap: 0.5,
              }}
            >
              <TrendingUp sx={{ fontSize: 16 }} />
              {stat.trend}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  const handleRefresh = () => {
    // Implement refresh functionality
    window.location.reload();
  };

  const handleViewAll = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
            }}
          >
            {getWelcomeMessage()}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            {getRoleIcon()}
            <Typography variant="subtitle1" color="text.secondary">
              {userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard
            </Typography>
          </Stack>
        </Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mt: { xs: 2, sm: 0 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Refresh
          </Button>
          {(userType === "admin" || userType === "staff") && (
            <Button
              variant="contained"
              startIcon={<Assessment />}
              sx={{
                bgcolor: theme.palette.primary.main,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": { bgcolor: theme.palette.primary.dark },
              }}
              onClick={() => navigate("/reports")}
            >
              Generate Report
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Role-specific Alert */}
      {userType === "student" && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Welcome to Sororti University Lab Management System. You have{" "}
          {
            dashboardData.recentBookings.filter((b) => b.status === "approved")
              .length
          }{" "}
          upcoming lab sessions.
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {dashboardData.stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard stat={stat} />
              </Grid>
            ))}
          </Grid>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Recent Bookings - Visible to all users */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {userType === "student"
                        ? "My Bookings"
                        : "Recent Bookings"}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View all bookings">
                        <IconButton onClick={() => handleViewAll("/bookings")}>
                          <ArrowForward />
                        </IconButton>
                      </Tooltip>
                      {userType === "student" && (
                        <Tooltip title="New booking">
                          <IconButton
                            onClick={() => handleViewAll("/bookings/new")}
                          >
                            <Add />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {dashboardData.recentBookings.length > 0 ? (
                    <List>
                      {dashboardData.recentBookings.map((booking, index) => (
                        <React.Fragment key={booking.id}>
                          <ListItem sx={{ px: 2, py: 1.5 }}>
                            <ListItemIcon>
                              <Person
                                sx={{ color: theme.palette.primary.main }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={booking.equipment_name}
                              secondary={`${booking.user_name} • ${new Date(
                                booking.start_time
                              ).toLocaleDateString()}`}
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                            <Chip
                              label={booking.status}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(booking.status)}15`,
                                color: getStatusColor(booking.status),
                                fontWeight: 500,
                                borderRadius: 1,
                              }}
                            />
                          </ListItem>
                          {index < dashboardData.recentBookings.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bookings found
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Equipment Status - Visible to staff and admin */}
            {(userType === "admin" || userType === "staff") && (
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Equipment Status
                      </Typography>
                      <Tooltip title="View all equipment">
                        <IconButton onClick={() => handleViewAll("/equipment")}>
                          <ArrowForward />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {dashboardData.equipmentStatus.length > 0 ? (
                      <List>
                        {dashboardData.equipmentStatus.map(
                          (equipment, index) => (
                            <React.Fragment key={equipment.id}>
                              <ListItem sx={{ px: 2, py: 1.5 }}>
                                <ListItemIcon>
                                  {getStatusIcon(equipment.status)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={equipment.name}
                                  secondary={
                                    <Box sx={{ mt: 1 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          mb: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Utilization
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {equipment.utilization}%
                                        </Typography>
                                      </Box>
                                      <LinearProgress
                                        variant="determinate"
                                        value={equipment.utilization}
                                        sx={{
                                          height: 6,
                                          borderRadius: 3,
                                          bgcolor: "#e3f2fd",
                                          "& .MuiLinearProgress-bar": {
                                            borderRadius: 3,
                                            bgcolor: getStatusColor(
                                              equipment.status
                                            ),
                                          },
                                        }}
                                      />
                                    </Box>
                                  }
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                />
                                <Chip
                                  label={equipment.status}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getStatusColor(
                                      equipment.status
                                    )}15`,
                                    color: getStatusColor(equipment.status),
                                    fontWeight: 500,
                                    borderRadius: 1,
                                  }}
                                />
                              </ListItem>
                              {index <
                                dashboardData.equipmentStatus.length - 1 && (
                                <Divider />
                              )}
                            </React.Fragment>
                          )
                        )}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No equipment data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Student-specific content */}
            {userType === "student" && (
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Available Equipment
                      </Typography>
                      <Tooltip title="View all equipment">
                        <IconButton onClick={() => handleViewAll("/equipment")}>
                          <ArrowForward />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {dashboardData.equipmentStatus.filter(
                      (eq) => eq.status?.toLowerCase() === "available"
                    ).length > 0 ? (
                      <List>
                        {dashboardData.equipmentStatus
                          .filter(
                            (eq) => eq.status?.toLowerCase() === "available"
                          )
                          .map((equipment, index) => (
                            <React.Fragment key={equipment.id}>
                              <ListItem sx={{ px: 2, py: 1.5 }}>
                                <ListItemIcon>
                                  {getStatusIcon(equipment.status)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={equipment.name}
                                  secondary="Available for booking"
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    handleViewAll(
                                      `/bookings/new?equipment=${equipment.id}`
                                    )
                                  }
                                  sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                      borderColor: theme.palette.primary.dark,
                                    },
                                  }}
                                >
                                  Book Now
                                </Button>
                              </ListItem>
                              {index <
                                dashboardData.equipmentStatus.filter(
                                  (eq) =>
                                    eq.status?.toLowerCase() === "available"
                                ).length -
                                  1 && <Divider />}
                            </React.Fragment>
                          ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No available equipment at the moment
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notifications - All users */}
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Notifications
                    </Typography>
                    <Tooltip title="View all notifications">
                      <IconButton
                        onClick={() => handleViewAll("/notifications")}
                      >
                        <ArrowForward />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {dashboardData.notifications.length > 0 ? (
                    <List>
                      {dashboardData.notifications.map(
                        (notification, index) => (
                          <React.Fragment key={notification.id}>
                            <ListItem sx={{ px: 2, py: 1.5 }}>
                              <ListItemIcon>
                                <Badge
                                  color="error"
                                  variant="dot"
                                  invisible={notification.read}
                                >
                                  <Notifications
                                    sx={{ color: theme.palette.primary.main }}
                                  />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText
                                primary={notification.title}
                                secondary={
                                  <>
                                    <Typography
                                      variant="body2"
                                      component="span"
                                    >
                                      {notification.message}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        notification.created_at
                                      ).toLocaleString()}
                                    </Typography>
                                  </>
                                }
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItem>
                            {index < dashboardData.notifications.length - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        )
                      )}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No notifications
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Box>
  );
};

export default Dashboard;
