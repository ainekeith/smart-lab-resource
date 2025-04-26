import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { ArrowLeft, Save } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import inventoryService from "../../services/inventory.service";
import { withAccessControl } from "../../components/common/withAccessControl";

const CATEGORY_OPTIONS = [
  { value: "CHEMICALS", label: "Chemicals" },
  { value: "GLASSWARE", label: "Glassware" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "CONSUMABLES", label: "Consumables" },
  { value: "OTHER", label: "Other" },
] as const;

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .trim()
    .min(2, "Name must be at least 2 characters"),
  description: Yup.string().trim(),
  category: Yup.string()
    .required("Category is required")
    .oneOf(
      CATEGORY_OPTIONS.map((opt) => opt.value),
      "Please select a valid category"
    )
    .trim(),
  sku: Yup.string().required("SKU is required").trim(),
  unit: Yup.string().required("Unit is required").trim(),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(0, "Quantity must be positive")
    .transform((value) => (isNaN(value) ? undefined : Number(value))),
  minimum_quantity: Yup.number()
    .required("Minimum quantity is required")
    .min(0, "Minimum quantity must be positive")
    .transform((value) => (isNaN(value) ? undefined : Number(value)))
    .test(
      "less-than-quantity",
      "Minimum quantity must be less than quantity",
      function (value) {
        return !value || !this.parent.quantity || value <= this.parent.quantity;
      }
    ),
  location: Yup.string().required("Location is required").trim(),
  price_per_unit: Yup.string()
    .required("Price per unit is required")
    .trim()
    .matches(
      /^\d+(\.\d{1,2})?$/,
      "Price must be a valid number with up to 2 decimal places"
    ),
});

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventory", id],
    queryFn: () => inventoryService.getById(Number(id)),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (values: any) => {
      // Log the mutation payload
      console.log("[InventoryForm] Submitting data:", {
        method: id ? "UPDATE" : "CREATE",
        payload: values,
        endpoint: id ? `/inventory/${id}/` : "/inventory/",
      });

      return id
        ? inventoryService.update(Number(id), values)
        : inventoryService.create(values);
    },
    onSuccess: (data) => {
      // Log successful response
      console.log("[InventoryForm] Success response:", data);

      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      enqueueSnackbar(
        `Inventory item ${id ? "updated" : "created"} successfully`,
        { variant: "success" }
      );
      navigate("/inventory");
    },
    onError: (error: any) => {
      // Log error details
      console.error("[InventoryForm] Submission error:", {
        error,
        response: error.response?.data,
        status: error.response?.status,
      });

      enqueueSnackbar(
        error.response?.data?.detail || "Failed to save inventory item",
        { variant: "error" }
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      category: "OTHER", // Set default category
      sku: "",
      unit: "",
      quantity: 0,
      minimum_quantity: 0,
      location: "",
      price_per_unit: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Log form values before submission
      console.log("[InventoryForm] Form values before submission:", {
        values,
        validationErrors: formik.errors,
        isValid: formik.isValid,
      });

      mutation.mutate(values);
    },
  });

  useEffect(() => {
    if (item) {
      formik.setValues({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "",
        sku: item.sku || "",
        unit: item.unit || "",
        quantity: item.quantity || 0,
        minimum_quantity: item.minimum_quantity || 0,
        location: item.location || "",
        price_per_unit: item.price_per_unit || "",
      });
    }
  }, [item]);

  if (isLoading && id) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading inventory item. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate("/inventory")}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {id ? "Edit Inventory Item" : "Add Inventory Item"}
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
                label="Item Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="sku"
                label="SKU"
                value={formik.values.sku}
                onChange={formik.handleChange}
                error={formik.touched.sku && Boolean(formik.errors.sku)}
                helperText={formik.touched.sku && formik.errors.sku}
              />
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
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  label="Category"
                  error={
                    formik.touched.category && Boolean(formik.errors.category)
                  }
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="location"
                label="Storage Location"
                value={formik.values.location}
                onChange={formik.handleChange}
                error={
                  formik.touched.location && Boolean(formik.errors.location)
                }
                helperText={formik.touched.location && formik.errors.location}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Stock Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                name="quantity"
                label="Current Quantity"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                error={
                  formik.touched.quantity && Boolean(formik.errors.quantity)
                }
                helperText={formik.touched.quantity && formik.errors.quantity}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                name="minimum_quantity"
                label="Minimum Quantity"
                value={formik.values.minimum_quantity}
                onChange={formik.handleChange}
                error={
                  formik.touched.minimum_quantity &&
                  Boolean(formik.errors.minimum_quantity)
                }
                helperText={
                  formik.touched.minimum_quantity &&
                  formik.errors.minimum_quantity
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                name="unit"
                label="Unit of Measurement"
                value={formik.values.unit}
                onChange={formik.handleChange}
                error={formik.touched.unit && Boolean(formik.errors.unit)}
                helperText={formik.touched.unit && formik.errors.unit}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="price_per_unit"
                label="Price per Unit"
                value={formik.values.price_per_unit}
                onChange={formik.handleChange}
                error={
                  formik.touched.price_per_unit &&
                  Boolean(formik.errors.price_per_unit)
                }
                helperText={
                  formik.touched.price_per_unit && formik.errors.price_per_unit
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/inventory")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save size={20} />}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Saving..." : "Save Item"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default withAccessControl(InventoryForm, {
  requiredRoles: ["admin", "staff"],
});
