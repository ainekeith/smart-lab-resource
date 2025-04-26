import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import api from '../../services/api';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string(),
  permissions: Yup.array().of(Yup.string()),
});

const availablePermissions = [
  { value: 'equipment_create', label: 'Create Equipment' },
  { value: 'equipment_edit', label: 'Edit Equipment' },
  { value: 'equipment_delete', label: 'Delete Equipment' },
  { value: 'booking_approve', label: 'Approve Bookings' },
  { value: 'booking_reject', label: 'Reject Bookings' },
  { value: 'inventory_manage', label: 'Manage Inventory' },
  { value: 'reports_view', label: 'View Reports' },
  { value: 'user_manage', label: 'Manage Users' },
];

const RoleManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles/').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (values: Partial<Role>) => {
      if (editingRole) {
        return api.put(`/roles/${editingRole.id}/`, values);
      }
      return api.post('/roles/', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      enqueueSnackbar(
        `Role ${editingRole ? 'updated' : 'created'} successfully`,
        { variant: 'success' }
      );
      handleCloseDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || `Failed to ${editingRole ? 'update' : 'create'} role`,
        { variant: 'error' }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      enqueueSnackbar('Role deleted successfully', { variant: 'success' });
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      permissions: [] as string[],
    },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      formik.setValues({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      formik.resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    formik.resetForm();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePermissionChange = (permission: string) => {
    const currentPermissions = formik.values.permissions;
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    formik.setFieldValue('permissions', newPermissions);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading roles. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Role Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Role
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : roles?.length === 0 ? (
          <Alert severity="info">No roles found</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles?.map((role: Role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Shield size={20} />
                        <Typography>{role.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {role.permissions.map((permission) => (
                          <Chip
                            key={permission}
                            label={availablePermissions.find(p => p.value === permission)?.label || permission}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(role)}
                        >
                          <Edit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(role.id)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingRole ? 'Edit Role' : 'Add Role'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="Role Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
              
              <Typography variant="subtitle2" gutterBottom>
                Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {availablePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission.value}
                    control={
                      <Checkbox
                        checked={formik.values.permissions.includes(permission.value)}
                        onChange={() => handlePermissionChange(permission.value)}
                      />
                    }
                    label={permission.label}
                  />
                ))}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;