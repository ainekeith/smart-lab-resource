import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
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
} from '@mui/material';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import api from '../../services/api';

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  created_at: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  code: Yup.string().required('Code is required'),
  description: Yup.string(),
});

const DepartmentList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['departments', searchTerm],
    queryFn: () => api.get('/departments/', { params: { search: searchTerm } }).then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (values: Partial<Department>) => {
      if (editingDepartment) {
        return api.put(`/departments/${editingDepartment.id}/`, values);
      }
      return api.post('/departments/', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      enqueueSnackbar(
        `Department ${editingDepartment ? 'updated' : 'created'} successfully`,
        { variant: 'success' }
      );
      handleCloseDialog();
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || `Failed to ${editingDepartment ? 'update' : 'create'} department`,
        { variant: 'error' }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/departments/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      enqueueSnackbar('Department deleted successfully', { variant: 'success' });
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      formik.setValues({
        name: department.name,
        code: department.code,
        description: department.description,
      });
    } else {
      setEditingDepartment(null);
      formik.resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDepartment(null);
    formik.resetForm();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading departments. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Department Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
        >
          Add Department
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
          }}
          sx={{ mb: 3 }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : departments?.length === 0 ? (
          <Alert severity="info">No departments found</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments?.map((department: Department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    <TableCell>{department.description}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(department)}
                        >
                          <Edit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(department.id)}
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
            {editingDepartment ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="Department Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                name="code"
                label="Department Code"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
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

export default DepartmentList;