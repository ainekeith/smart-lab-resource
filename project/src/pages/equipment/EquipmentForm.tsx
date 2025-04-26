import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Save, ArrowLeft } from "lucide-react";
import { useSnackbar } from "notistack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import equipmentService from "../../services/equipment.service";
import FileUpload from "../../components/common/FileUpload";
import { withAccessControl } from "../../components/common/withAccessControl";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  model_number: Yup.string().required("Model number is required"),
  serial_number: Yup.string().required("Serial number is required"),
  category: Yup.string().required("Category is required"),
  location: Yup.string().required("Location is required"),
  condition: Yup.string().required("Condition is required"),
  status: Yup.string().required("Status is required"),
  purchase_date: Yup.date().nullable(),
  last_maintained: Yup.date().nullable(),
  next_maintenance: Yup.date().nullable(),
  notes: Yup.string(),
});

const EquipmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment", id],
    queryFn: () => equipmentService.getById(Number(id)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      id
        ? equipmentService.update(Number(id), values)
        : equipmentService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      enqueueSnackbar(`Equipment ${id ? "updated" : "created"} successfully`, {
        variant: "success",
      });
      navigate("/equipment");
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || "Failed to save equipment",
        { variant: "error" }
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      model_number: "",
      serial_number: "",
      category: "",
      location: "",
      condition: "excellent",
      status: "available",
      purchase_date: null,
      last_maintained: null,
      next_maintenance: null,
      notes: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const formData = new FormData();

      // Handle basic fields
      Object.keys(values).forEach((key) => {
        const value = values[key];
        if (value !== null && value !== undefined && value !== "") {
          // Handle date fields
          if (value instanceof Date) {
            formData.append(key, value.toISOString().split("T")[0]);
          } else {
            formData.append(key, value);
          }
        }
      });

      // Handle file fields
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (manualFile) {
        formData.append("manual_file", manualFile);
      }

      // Log formData for debugging
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      mutation.mutate(formData);
    },
  });

  useEffect(() => {
    if (equipment) {
      formik.setValues({
        name: equipment.name,
        description: equipment.description,
        model_number: equipment.model_number,
        serial_number: equipment.serial_number,
        category: equipment.category,
        location: equipment.location,
        condition: equipment.condition,
        status: equipment.status,
        purchase_date: equipment.purchase_date
          ? new Date(equipment.purchase_date)
          : null,
        last_maintained: equipment.last_maintained
          ? new Date(equipment.last_maintained)
          : null,
        next_maintenance: equipment.next_maintenance
          ? new Date(equipment.next_maintenance)
          : null,
        notes: equipment.notes || "",
      });
    }
  }, [equipment]);

  if (isLoading && id) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading equipment details...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate("/equipment")}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {id ? "Edit Equipment" : "Add New Equipment"}
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Equipment Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    label="Category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.category && Boolean(formik.errors.category)
                    }
                  >
                    <MenuItem value="microscope">Microscope</MenuItem>
                    <MenuItem value="spectrometer">Spectrometer</MenuItem>
                    <MenuItem value="centrifuge">Centrifuge</MenuItem>
                    <MenuItem value="analyzer">Analyzer</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="model_number"
                  label="Model Number"
                  value={formik.values.model_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.model_number &&
                    Boolean(formik.errors.model_number)
                  }
                  helperText={
                    formik.touched.model_number && formik.errors.model_number
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="serial_number"
                  label="Serial Number"
                  value={formik.values.serial_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.serial_number &&
                    Boolean(formik.errors.serial_number)
                  }
                  helperText={
                    formik.touched.serial_number && formik.errors.serial_number
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Status & Location
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    label="Condition"
                    value={formik.values.condition}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.condition &&
                      Boolean(formik.errors.condition)
                    }
                  >
                    <MenuItem value="excellent">Excellent</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="fair">Fair</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                    <MenuItem value="maintenance">Needs Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    label="Status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.status && Boolean(formik.errors.status)
                    }
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="in_use">In Use</MenuItem>
                    <MenuItem value="maintenance">Under Maintenance</MenuItem>
                    <MenuItem value="out_of_service">Out of Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.location && Boolean(formik.errors.location)
                  }
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Maintenance Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Purchase Date"
                  value={formik.values.purchase_date}
                  onChange={(value) =>
                    formik.setFieldValue("purchase_date", value)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.purchase_date &&
                        Boolean(formik.errors.purchase_date),
                      helperText:
                        formik.touched.purchase_date &&
                        formik.errors.purchase_date,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Last Maintained"
                  value={formik.values.last_maintained}
                  onChange={(value) =>
                    formik.setFieldValue("last_maintained", value)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.last_maintained &&
                        Boolean(formik.errors.last_maintained),
                      helperText:
                        formik.touched.last_maintained &&
                        formik.errors.last_maintained,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Next Maintenance"
                  value={formik.values.next_maintenance}
                  onChange={(value) =>
                    formik.setFieldValue("next_maintenance", value)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.next_maintenance &&
                        Boolean(formik.errors.next_maintenance),
                      helperText:
                        formik.touched.next_maintenance &&
                        formik.errors.next_maintenance,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="notes"
                  label="Notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Files & Documentation
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Equipment Image
                </Typography>
                <FileUpload
                  onUpload={(files) => setImageFile(files[0])}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024} // 5MB
                  helperText="Upload equipment image (max 5MB)"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Manual / Documentation
                </Typography>
                <FileUpload
                  onUpload={(files) => setManualFile(files[0])}
                  accept={{ "application/pdf": [".pdf"] }}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024} // 10MB
                  helperText="Upload equipment manual (PDF, max 10MB)"
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/equipment")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save size={20} />}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Saving..." : "Save Equipment"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default withAccessControl(EquipmentForm, {
  requiredRoles: ["admin", "staff"],
});
