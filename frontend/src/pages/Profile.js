import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Edit,
  Email,
  Phone,
  School,
  Badge,
  CalendarMonth,
  AccessTime,
  SupervisorAccount,
  Person,
  Science,
  Close,
} from "@mui/icons-material";

// Mock data - Replace with actual API calls in production
const mockActivityHistory = [
  {
    id: 1,
    type: "booking",
    equipment: "Microscope XR-200",
    date: "2024-03-15",
    status: "completed",
  },
  {
    id: 2,
    type: "maintenance",
    equipment: "Centrifuge C-100",
    date: "2024-03-10",
    status: "reported",
  },
  {
    id: 3,
    type: "booking",
    equipment: "Spectrophotometer",
    date: "2024-03-05",
    status: "cancelled",
  },
];

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe",
    email: user?.email || "john.doe@sororti.edu",
    phone: user?.phone || "+1 234 567 8900",
    department: user?.department || "Chemistry",
    role: user?.role || "student",
    studentId: user?.studentId || "STU123456",
  });

  const getStatusColor = (status) => {
    const colors = {
      completed: "#4caf50",
      reported: "#ff9800",
      cancelled: "#f44336",
      active: "#2196f3",
    };
    return colors[status] || "#757575";
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO: Implement API call to update profile
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedProfile({
      ...editedProfile,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "#1a237e",
                    fontSize: "3rem",
                  }}
                >
                  {editedProfile.firstName[0]}
                  {editedProfile.lastName[0]}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {editedProfile.firstName} {editedProfile.lastName}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {editedProfile.department}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {editedProfile.role === "admin" && (
                      <Chip
                        icon={<SupervisorAccount />}
                        label="Administrator"
                        color="primary"
                        size="small"
                      />
                    )}
                    {editedProfile.role === "staff" && (
                      <Chip
                        icon={<Person />}
                        label="Staff"
                        color="secondary"
                        size="small"
                      />
                    )}
                    {editedProfile.role === "student" && (
                      <Chip
                        icon={<School />}
                        label="Student"
                        color="info"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditClick}
                  fullWidth
                  sx={{
                    borderColor: "#1a237e",
                    color: "#1a237e",
                    "&:hover": {
                      borderColor: "#0d47a1",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email sx={{ color: "#1a237e" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={editedProfile.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone sx={{ color: "#1a237e" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={editedProfile.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Badge sx={{ color: "#1a237e" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="ID"
                    secondary={editedProfile.studentId}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity History */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activity History
              </Typography>
              <List>
                {mockActivityHistory.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === "booking" ? (
                          <CalendarMonth sx={{ color: "#2196f3" }} />
                        ) : (
                          <Science sx={{ color: "#ff9800" }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.equipment}
                        secondary={
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTime
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {activity.date}
                              </Typography>
                            </Box>
                            <Chip
                              label={activity.status}
                              size="small"
                              sx={{
                                bgcolor: `${getStatusColor(activity.status)}15`,
                                color: getStatusColor(activity.status),
                                fontWeight: 500,
                                borderRadius: 1,
                              }}
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Profile
          <IconButton
            onClick={handleClose}
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editedProfile.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editedProfile.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editedProfile.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editedProfile.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={editedProfile.department}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d47a1" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
