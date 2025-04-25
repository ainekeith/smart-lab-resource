import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Science,
  CheckCircle,
  Warning,
  Schedule,
  LocationOn,
  Description,
  Build,
  CalendarMonth,
  AccessTime,
  Person,
  Close,
  Edit,
} from "@mui/icons-material";

// Mock data - Replace with API calls in production
const mockEquipment = {
  id: 1,
  name: "Microscope XR-200",
  category: "Microscopes",
  status: "available",
  location: "Lab 101",
  image: "https://example.com/microscope.jpg",
  description:
    "High-precision digital microscope with 1000x magnification. Features include digital imaging capabilities, fluorescence microscopy, and automated stage control.",
  specifications: {
    manufacturer: "TechLabs",
    model: "XR-200",
    serialNumber: "MSC-2024-001",
    purchaseDate: "2023-01-15",
    warranty: "2025-01-15",
  },
  maintenanceHistory: [
    {
      id: 1,
      date: "2024-02-15",
      type: "Regular Maintenance",
      description: "Calibration and lens cleaning",
      technician: "John Smith",
    },
    {
      id: 2,
      date: "2023-11-10",
      type: "Repair",
      description: "Stage motor replacement",
      technician: "Sarah Johnson",
    },
  ],
  bookingHistory: [
    {
      id: 1,
      user: "Alice Brown",
      date: "2024-03-15",
      duration: "2 hours",
      status: "completed",
    },
    {
      id: 2,
      user: "Bob Wilson",
      date: "2024-03-16",
      duration: "3 hours",
      status: "upcoming",
    },
  ],
  nextMaintenance: "2024-04-15",
  usage: {
    totalHours: 450,
    totalBookings: 45,
    averageRating: 4.8,
  },
};

const EquipmentDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: null,
    endDate: null,
    purpose: "",
  });

  const getStatusColor = (status) => {
    const colors = {
      available: "#4caf50",
      in_use: "#2196f3",
      maintenance: "#ff9800",
      unavailable: "#f44336",
      completed: "#4caf50",
      upcoming: "#2196f3",
    };
    return colors[status] || "#757575";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <CheckCircle sx={{ color: getStatusColor(status) }} />;
      case "in_use":
        return <Schedule sx={{ color: getStatusColor(status) }} />;
      case "maintenance":
        return <Warning sx={{ color: getStatusColor(status) }} />;
      default:
        return <Warning sx={{ color: getStatusColor("unavailable") }} />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBookingOpen = () => {
    setIsBooking(true);
  };

  const handleBookingClose = () => {
    setIsBooking(false);
  };

  const handleBookingSubmit = () => {
    // TODO: Implement booking submission
    console.log("Booking submitted:", bookingData);
    setIsBooking(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Equipment Overview */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Stack spacing={3}>
                {/* Header */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ color: "#1a237e", fontWeight: 600 }}
                    >
                      {mockEquipment.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <Chip
                        icon={getStatusIcon(mockEquipment.status)}
                        label={mockEquipment.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(mockEquipment.status)}15`,
                          color: getStatusColor(mockEquipment.status),
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        icon={<Science sx={{ fontSize: 16 }} />}
                        label={mockEquipment.category}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<LocationOn sx={{ fontSize: 16 }} />}
                        label={mockEquipment.location}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<CalendarMonth />}
                    onClick={handleBookingOpen}
                    disabled={mockEquipment.status !== "available"}
                    sx={{
                      bgcolor: "#1a237e",
                      "&:hover": { bgcolor: "#0d47a1" },
                    }}
                  >
                    Book Equipment
                  </Button>
                </Stack>

                {/* Image */}
                <Box
                  component="img"
                  src={mockEquipment.image}
                  alt={mockEquipment.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x400?text=Equipment+Image";
                  }}
                  sx={{
                    width: "100%",
                    height: 400,
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                />

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Details" />
                    <Tab label="Specifications" />
                    <Tab label="Maintenance History" />
                    <Tab label="Booking History" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box>
                  {activeTab === 0 && (
                    <Typography variant="body1">
                      {mockEquipment.description}
                    </Typography>
                  )}
                  {activeTab === 1 && (
                    <List>
                      {Object.entries(mockEquipment.specifications).map(
                        ([key, value]) => (
                          <ListItem key={key}>
                            <ListItemText
                              primary={
                                key.charAt(0).toUpperCase() + key.slice(1)
                              }
                              secondary={value}
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  )}
                  {activeTab === 2 && (
                    <List>
                      {mockEquipment.maintenanceHistory.map((maintenance) => (
                        <ListItem key={maintenance.id}>
                          <ListItemIcon>
                            <Build sx={{ color: "#ff9800" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={maintenance.type}
                            secondary={
                              <Stack spacing={1}>
                                <Typography variant="body2">
                                  {maintenance.description}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {maintenance.date}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Technician: {maintenance.technician}
                                  </Typography>
                                </Stack>
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {activeTab === 3 && (
                    <List>
                      {mockEquipment.bookingHistory.map((booking) => (
                        <ListItem key={booking.id}>
                          <ListItemIcon>
                            <Person sx={{ color: "#2196f3" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={booking.user}
                            secondary={
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {booking.date}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Duration: {booking.duration}
                                </Typography>
                                <Chip
                                  label={booking.status}
                                  size="small"
                                  sx={{
                                    bgcolor: `${getStatusColor(
                                      booking.status
                                    )}15`,
                                    color: getStatusColor(booking.status),
                                    fontWeight: 500,
                                  }}
                                />
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipment Stats */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card
              sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Usage Statistics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Usage Hours
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {mockEquipment.usage.totalHours}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {mockEquipment.usage.totalBookings}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {mockEquipment.usage.averageRating}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Maintenance Schedule
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Next Maintenance Date
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#ff9800" }}
                    >
                      {mockEquipment.nextMaintenance}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Build />}
                    fullWidth
                    sx={{
                      borderColor: "#ff9800",
                      color: "#ff9800",
                      "&:hover": {
                        borderColor: "#f57c00",
                      },
                    }}
                  >
                    Report Issue
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={isBooking}
        onClose={handleBookingClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Book Equipment
          <IconButton
            onClick={handleBookingClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <DateTimePicker
                label="Start Date & Time"
                value={bookingData.startDate}
                onChange={(newValue) =>
                  setBookingData({ ...bookingData, startDate: newValue })
                }
              />
              <DateTimePicker
                label="End Date & Time"
                value={bookingData.endDate}
                onChange={(newValue) =>
                  setBookingData({ ...bookingData, endDate: newValue })
                }
              />
              <TextField
                fullWidth
                label="Purpose of Use"
                multiline
                rows={4}
                value={bookingData.purpose}
                onChange={(e) =>
                  setBookingData({ ...bookingData, purpose: e.target.value })
                }
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>Cancel</Button>
          <Button
            onClick={handleBookingSubmit}
            variant="contained"
            sx={{
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d47a1" },
            }}
          >
            Submit Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentDetail;
