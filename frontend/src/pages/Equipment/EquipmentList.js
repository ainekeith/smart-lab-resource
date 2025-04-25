import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search,
  Science,
  CheckCircle,
  Warning,
  Schedule,
  Add,
  FilterList,
  Sort,
  Edit,
  Delete,
} from "@mui/icons-material";
import {
  fetchEquipment,
  deleteEquipment,
} from "../../redux/slices/equipmentSlice";

// Mock data - Replace with API calls in production
const mockEquipment = [
  {
    id: 1,
    name: "Microscope XR-200",
    category: "Microscopes",
    status: "available",
    location: "Lab 101",
    image: "https://example.com/microscope.jpg",
    description: "High-precision digital microscope with 1000x magnification",
    maintenanceDate: "2024-04-15",
    bookings: 45,
  },
  {
    id: 2,
    name: "Centrifuge C-100",
    category: "Centrifuges",
    status: "in_use",
    location: "Lab 102",
    image: "https://example.com/centrifuge.jpg",
    description: "High-speed centrifuge with temperature control",
    maintenanceDate: "2024-05-01",
    bookings: 32,
  },
  {
    id: 3,
    name: "Spectrophotometer",
    category: "Analyzers",
    status: "maintenance",
    location: "Lab 103",
    image: "https://example.com/spectrophotometer.jpg",
    description: "UV-Visible spectrophotometer for chemical analysis",
    maintenanceDate: "2024-03-20",
    bookings: 28,
  },
];

const categories = [
  "All",
  "Microscopes",
  "Centrifuges",
  "Analyzers",
  "Measurement",
  "Processing",
];
const locations = ["All", "Lab 101", "Lab 102", "Lab 103", "Lab 104"];

const EquipmentList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { equipment, loading, error } = useSelector((state) => state.equipment);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Check if user has admin/staff privileges
  const hasManageAccess = ["admin", "staff"].includes(user?.role);

  useEffect(() => {
    // Fetch equipment list when filters change
    const fetchData = () => {
      dispatch(
        fetchEquipment({
          search: searchQuery,
          category: selectedCategory,
          location: selectedLocation,
          sort: sortBy,
        })
      );
    };

    // Debounce search query
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [dispatch, searchQuery, selectedCategory, selectedLocation, sortBy]);

  const getStatusColor = (status) => {
    const colors = {
      available: "#4caf50",
      in_use: "#2196f3",
      maintenance: "#ff9800",
      unavailable: "#f44336",
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

  const handleEquipmentClick = (id) => {
    navigate(`/equipment/${id}`);
  };

  const handleAddEquipment = () => {
    navigate("/equipment/add");
  };

  const handleEditEquipment = (e, id) => {
    e.stopPropagation();
    navigate(`/equipment/${id}/edit`);
  };

  const handleDeleteEquipment = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await dispatch(deleteEquipment(id)).unwrap();
      } catch (err) {
        console.error("Failed to delete equipment:", err);
      }
    }
  };

  if (loading && !equipment.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" sx={{ color: "#1a237e", fontWeight: 600 }}>
          Laboratory Equipment
        </Typography>
        {hasManageAccess && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddEquipment}
            sx={{
              bgcolor: "#1a237e",
              "&:hover": { bgcolor: "#0d47a1" },
            }}
          >
            Add Equipment
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              }
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              label="Location"
              onChange={(e) => setSelectedLocation(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              }
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Sort />
                </InputAdornment>
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="bookings">Most Booked</MenuItem>
              <MenuItem value="maintenance">Maintenance Date</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Equipment Grid */}
      <Grid container spacing={3}>
        {equipment.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-4px)",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
              onClick={() => handleEquipmentClick(item.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.name}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x200?text=Equipment+Image";
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.name}
                      </Typography>
                      {hasManageAccess && (
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleEditEquipment(e, item.id)}
                            sx={{ color: "#1a237e" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteEquipment(e, item.id)}
                            sx={{ color: "#f44336" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={item.status.replace("_", " ").toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(item.status)}15`,
                        color: getStatusColor(item.status),
                        fontWeight: 500,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Chip
                      icon={<Science sx={{ fontSize: 16 }} />}
                      label={item.category}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.bookings} bookings
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EquipmentList;
