import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowLeft, Edit, Trash2, Calendar, Download, PenTool as Tool, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import equipmentService from '../../services/equipment.service';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  available: 'success',
  in_use: 'warning',
  maintenance: 'error',
  out_of_service: 'default',
};

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: equipment, isLoading, error } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.getById(Number(id)),
  });

  const { data: maintenanceRecords, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => equipmentService.getMaintenanceRecords(Number(id)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => equipmentService.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      enqueueSnackbar('Equipment deleted successfully', { variant: 'success' });
      navigate('/equipment');
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || 'Failed to delete equipment',
        { variant: 'error' }
      );
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !equipment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading equipment details. Please try again later.
        </Alert>
      </Box>
    );
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/equipment')}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Equipment Details
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={20} />}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          startIcon={<Edit size={20} />}
          onClick={() => navigate(`/equipment/${id}/edit`)}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          startIcon={<Calendar size={20} />}
          onClick={() => navigate(`/bookings/new?equipment=${id}`)}
          disabled={equipment.status !== 'available'}
        >
          Book Equipment
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              <Box
                component="img"
                src={equipment.image_url || 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg'}
                alt={equipment.name}
                sx={{
                  width: 200,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h5" component="h2">
                    {equipment.name}
                  </Typography>
                  <Chip
                    label={equipment.status}
                    color={statusColors[equipment.status]}
                    size="small"
                  />
                </Box>
                <Typography color="text.secondary" paragraph>
                  {equipment.description}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Model Number
                    </Typography>
                    <Typography>{equipment.model_number}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Serial Number
                    </Typography>
                    <Typography>{equipment.serial_number}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography>{equipment.category}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography>{equipment.location}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Maintenance History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {isLoadingMaintenance ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : maintenanceRecords && maintenanceRecords.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Performed By</TableCell>
                      <TableCell>Next Due</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.maintenance_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.maintenance_type}
                            size="small"
                            color={record.maintenance_type === 'repair' ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{record.performed_by}</TableCell>
                        <TableCell>
                          {record.next_maintenance_date
                            ? format(new Date(record.next_maintenance_date), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No maintenance records found
              </Typography>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Tool size={20} />}
                onClick={() => navigate(`/equipment/${id}/maintenance/new`)}
              >
                Add Maintenance Record
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Current Condition
              </Typography>
              <Chip
                label={equipment.condition}
                size="small"
                color={equipment.condition === 'excellent' ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
            
            {equipment.next_maintenance && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Next Maintenance Due
                </Typography>
                <Typography>
                  {format(new Date(equipment.next_maintenance), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}
            
            {equipment.last_maintained && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Maintained
                </Typography>
                <Typography>
                  {format(new Date(equipment.last_maintained), 'MMM dd, yyyy')}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documentation
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {equipment.manual_url ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download size={20} />}
                onClick={() => window.open(equipment.manual_url, '_blank')}
                sx={{ mb: 2 }}
              >
                Download Manual
              </Button>
            ) : (
              <Alert
                severity="info"
                icon={<AlertTriangle size={20} />}
                sx={{ mb: 2 }}
              >
                No manual available
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this equipment? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentDetails;