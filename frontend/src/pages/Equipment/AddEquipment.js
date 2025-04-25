import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LoadingButton } from "@mui/lab";
import { Science, ArrowBack } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment } from "../../redux/slices/equipmentSlice";

const categories = [
  "Microscopes",
  "Centrifuges",
  "Analyzers",
  "Measurement",
  "Processing",
];
const locations = ["Lab 101", "Lab 102", "Lab 103", "Lab 104"];

const AddEquipment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: null,
    warrantyDate: null,
    maintenanceInterval: "",
    specifications: "",
    image: null,
  });

  const [validation, setValidation] = useState({
    name: "",
    category: "",
    location: "",
    description: "",
    manufacturer: "",
    serialNumber: "",
  });

  // Check if user has permission to add equipment
  if (!["admin", "staff"].includes(user?.role)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  const validateForm = () => {
    const newValidation = {
      name: !formData.name ? "Name is required" : "",
      category: !formData.category ? "Category is required" : "",
      location: !formData.location ? "Location is required" : "",
      description: !formData.description ? "Description is required" : "",
      manufacturer: !formData.manufacturer ? "Manufacturer is required" : "",
      serialNumber: !formData.serialNumber ? "Serial number is required" : "",
    };

    setValidation(newValidation);
    return !Object.values(newValidation).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user types
    if (validation[name]) {
      setValidation((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const equipmentData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          equipmentData.append(key, formData[key]);
        }
      });

      // Dispatch action to add equipment
      await dispatch(addEquipment(equipmentData)).unwrap();
      setSuccess(true);

      // Redirect to equipment list after successful addition
      setTimeout(() => {
        navigate("/equipment");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to add equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/equipment")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ color: "#1a237e", fontWeight: 600 }}>
          Add New Equipment
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Equipment added successfully!
        </Alert>
      )}

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Equipment Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!validation.name}
                  helperText={validation.name}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validation.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validation.location}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    label="Location"
                  >
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  error={!!validation.manufacturer}
                  helperText={validation.manufacturer}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  error={!!validation.serialNumber}
                  helperText={validation.serialNumber}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, purchaseDate: newValue }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Warranty Expiry Date"
                  value={formData.warrantyDate}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, warrantyDate: newValue }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  error={!!validation.description}
                  helperText={validation.description}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Enter technical specifications, features, and capabilities"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="file"
                  label="Equipment Image"
                  name="image"
                  onChange={handleImageChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    accept: "image/*",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Maximum file size: 5MB. Supported formats: JPG, PNG
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/equipment")}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={loading}
                    startIcon={<Science />}
                    sx={{
                      bgcolor: "#1a237e",
                      "&:hover": { bgcolor: "#0d47a1" },
                    }}
                  >
                    Add Equipment
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddEquipment;
