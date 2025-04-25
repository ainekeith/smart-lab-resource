import React from "react";
import { useSelector } from "react-redux";
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
} from "@mui/icons-material";

// Mock data for demonstration
const stats = [
  {
    title: "Total Equipment",
    value: "156",
    icon: <Science sx={{ color: "#2196f3" }} />,
    trend: "+12% from last month",
    trendColor: "#4caf50",
  },
  {
    title: "Active Bookings",
    value: "28",
    icon: <CalendarMonth sx={{ color: "#4caf50" }} />,
    trend: "+5% from last week",
    trendColor: "#4caf50",
  },
  {
    title: "Low Stock Items",
    value: "8",
    icon: <Inventory2 sx={{ color: "#ff9800" }} />,
    trend: "-3% from last week",
    trendColor: "#f44336",
  },
  {
    title: "Pending Requests",
    value: "15",
    icon: <Schedule sx={{ color: "#f44336" }} />,
    trend: "+2% from yesterday",
    trendColor: "#4caf50",
  },
];

const additionalStats = [
  {
    title: "Active Users",
    value: "324",
    icon: <Groups sx={{ color: "#2196f3" }} />,
    trend: "+8% from last month",
    trendColor: "#4caf50",
  },
  {
    title: "Average Usage Time",
    value: "2.5h",
    icon: <Timer sx={{ color: "#9c27b0" }} />,
    trend: "+15% efficiency",
    trendColor: "#4caf50",
  },
  {
    title: "Maintenance Due",
    value: "12",
    icon: <Construction sx={{ color: "#ff9800" }} />,
    trend: "Next: 3 days",
    trendColor: "#ff9800",
  },
  {
    title: "Success Rate",
    value: "98%",
    icon: <CheckCircle sx={{ color: "#4caf50" }} />,
    trend: "+4% from last month",
    trendColor: "#4caf50",
  },
];

const recentBookings = [
  {
    id: 1,
    user: "John Doe",
    equipment: "Microscope XR-200",
    date: "2024-03-15",
    status: "approved",
  },
  {
    id: 2,
    user: "Jane Smith",
    equipment: "Centrifuge C-100",
    date: "2024-03-16",
    status: "pending",
  },
  {
    id: 3,
    user: "Mike Johnson",
    equipment: "Spectrophotometer",
    date: "2024-03-17",
    status: "rejected",
  },
];

const equipmentStatus = [
  {
    name: "Microscope XR-200",
    status: "Available",
    utilization: 75,
  },
  {
    name: "Centrifuge C-100",
    status: "In Use",
    utilization: 90,
  },
  {
    name: "Spectrophotometer",
    status: "Maintenance",
    utilization: 30,
  },
];

// Mock data for demonstration - In production, this would come from API
const adminStats = [
  {
    title: "Total Equipment",
    value: "156",
    icon: <Science sx={{ color: "#2196f3" }} />,
    trend: "+12% from last month",
    trendColor: "#4caf50",
  },
  {
    title: "Active Users",
    value: "324",
    icon: <Groups sx={{ color: "#4caf50" }} />,
    trend: "+8% from last month",
    trendColor: "#4caf50",
  },
  {
    title: "Pending Requests",
    value: "15",
    icon: <Schedule sx={{ color: "#f44336" }} />,
    trend: "+2% from yesterday",
    trendColor: "#4caf50",
  },
  {
    title: "Success Rate",
    value: "98%",
    icon: <CheckCircle sx={{ color: "#4caf50" }} />,
    trend: "+4% from last month",
    trendColor: "#4caf50",
  },
];

const staffStats = [
  {
    title: "Equipment Status",
    value: "45",
    icon: <Science sx={{ color: "#2196f3" }} />,
    trend: "Active Now",
    trendColor: "#4caf50",
  },
  {
    title: "Student Requests",
    value: "28",
    icon: <School sx={{ color: "#9c27b0" }} />,
    trend: "Pending Review",
    trendColor: "#ff9800",
  },
  {
    title: "Maintenance Due",
    value: "12",
    icon: <Construction sx={{ color: "#ff9800" }} />,
    trend: "Next: 3 days",
    trendColor: "#ff9800",
  },
  {
    title: "Department Usage",
    value: "85%",
    icon: <Assessment sx={{ color: "#4caf50" }} />,
    trend: "+5% efficiency",
    trendColor: "#4caf50",
  },
];

const studentStats = [
  {
    title: "My Bookings",
    value: "3",
    icon: <CalendarMonth sx={{ color: "#2196f3" }} />,
    trend: "2 Upcoming",
    trendColor: "#4caf50",
  },
  {
    title: "Lab Hours",
    value: "24h",
    icon: <Timer sx={{ color: "#9c27b0" }} />,
    trend: "This Month",
    trendColor: "#4caf50",
  },
  {
    title: "Assignments",
    value: "5",
    icon: <Assignment sx={{ color: "#ff9800" }} />,
    trend: "2 Due Soon",
    trendColor: "#ff9800",
  },
  {
    title: "Success Rate",
    value: "92%",
    icon: <CheckCircle sx={{ color: "#4caf50" }} />,
    trend: "Experiments",
    trendColor: "#4caf50",
  },
];

const Dashboard = () => {
  // Get user role from Redux store
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "student"; // Default to student if no role

  const getStatusColor = (status) => {
    const colors = {
      approved: "#4caf50",
      pending: "#ff9800",
      rejected: "#f44336",
      available: "#4caf50",
      "in use": "#2196f3",
      maintenance: "#ff9800",
    };
    return colors[status.toLowerCase()] || "#757575";
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return <CheckCircle sx={{ color: "#4caf50" }} />;
      case "in use":
        return <Schedule sx={{ color: "#2196f3" }} />;
      case "maintenance":
        return <Warning sx={{ color: "#ff9800" }} />;
      default:
        return <Warning sx={{ color: "#f44336" }} />;
    }
  };

  // Get stats based on user role
  const getRoleStats = () => {
    switch (userRole) {
      case "admin":
        return adminStats;
      case "staff":
        return staffStats;
      default:
        return studentStats;
    }
  };

  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    switch (userRole) {
      case "admin":
        return "System Overview";
      case "staff":
        return "Laboratory Management";
      default:
        return "My Laboratory Dashboard";
    }
  };

  const StatCard = ({ stat }) => (
    <Card
      sx={{
        height: "100%",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        borderRadius: 2,
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "all 0.3s ease",
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
            {React.cloneElement(stat.icon, {
              sx: { ...stat.icon.props.sx, fontSize: 28 },
            })}
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
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: "#1a237e", fontWeight: 600 }}>
            {getWelcomeMessage()}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            {userRole === "admin" && (
              <SupervisorAccount sx={{ color: "#1a237e" }} />
            )}
            {userRole === "staff" && <Person sx={{ color: "#1a237e" }} />}
            {userRole === "student" && <School sx={{ color: "#1a237e" }} />}
            <Typography variant="subtitle1" color="text.secondary">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </Typography>
          </Stack>
        </Box>
        {(userRole === "admin" || userRole === "staff") && (
          <Button
            variant="contained"
            startIcon={<Assessment />}
            sx={{
              bgcolor: "#2196f3",
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              "&:hover": { bgcolor: "#1976d2" },
            }}
          >
            Generate Report
          </Button>
        )}
      </Stack>

      {/* Role-specific Alert */}
      {userRole === "student" && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Welcome to Sororti University Lab Management System. You have 2
          upcoming lab sessions this week.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getRoleStats().map((stat, index) => (
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
            sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {userRole === "student" ? "My Bookings" : "Recent Bookings"}
                </Typography>
                <IconButton>
                  <ArrowForward />
                </IconButton>
              </Stack>
              <List>
                {recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem sx={{ px: 2, py: 1.5 }}>
                      <ListItemIcon>
                        <Person sx={{ color: "#2196f3" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={booking.equipment}
                        secondary={`${booking.user} • ${booking.date}`}
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
                    {index < recentBookings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipment Status - Visible to staff and admin */}
        {(userRole === "admin" || userRole === "staff") && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
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
                  <IconButton>
                    <ArrowForward />
                  </IconButton>
                </Stack>
                <List>
                  {equipmentStatus.map((equipment, index) => (
                    <React.Fragment key={index}>
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
                                    bgcolor: getStatusColor(equipment.status),
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
                            bgcolor: `${getStatusColor(equipment.status)}15`,
                            color: getStatusColor(equipment.status),
                            fontWeight: 500,
                            borderRadius: 1,
                          }}
                        />
                      </ListItem>
                      {index < equipmentStatus.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Student-specific content */}
        {userRole === "student" && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
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
                  <IconButton>
                    <ArrowForward />
                  </IconButton>
                </Stack>
                <List>
                  {equipmentStatus
                    .filter((eq) => eq.status.toLowerCase() === "available")
                    .map((equipment, index) => (
                      <React.Fragment key={index}>
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
                            sx={{
                              borderColor: "#2196f3",
                              color: "#2196f3",
                              "&:hover": { borderColor: "#1976d2" },
                            }}
                          >
                            Book Now
                          </Button>
                        </ListItem>
                        {index < equipmentStatus.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
