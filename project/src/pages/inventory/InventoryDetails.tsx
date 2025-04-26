import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import inventoryService from '../../services/inventory.service';
import { withAccessControl } from '../../components/common/withAccessControl';

const InventoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryService.getById(Number(id)),
  });

  const { data: movements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['stock-movements', id],
    queryFn: () => inventoryService.getStockMovements(Number(id)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => inventoryService.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      enqueueSnackbar('Inventory item deleted successfully', { variant: 'success' });
      navigate('/inventory');
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || 'Failed to delete inventory item',
        { variant: 'error' }
      );
    },
  });

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Inventory item not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/inventory')}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Inventory Details
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
          onClick={() => navigate(`/inventory/${id}/edit`)}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          startIcon={<ArrowUpDown size={20} />}
          onClick={() => navigate(`/inventory/${id}/movement`)}
        >
          Stock Movement
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Item Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Item Name
                </Typography>
                <Typography variant="body1">{item.name}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body1">{item.sku}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                  {item.category}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">{item.location}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body1">{item.notes || 'No notes available'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stock Movement History
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {isLoadingMovements ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : !movements?.results.length ? (
              <Alert severity="info">No stock movements recorded</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Created By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movements.results.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {format(new Date(movement.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={movement.movement_type === 'in' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            label={movement.movement_type === 'in' ? 'Stock In' : 'Stock Out'}
                            color={movement.movement_type === 'in' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {movement.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{movement.reference}</TableCell>
                        <TableCell>{movement.notes}</TableCell>
                        <TableCell>{movement.created_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stock Status
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Quantity
                </Typography>
                <Typography variant="h4" color={item.quantity <= item.minimum_quantity ? 'error.main' : 'success.main'}>
                  {item.quantity} {item.unit}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Minimum Quantity
                </Typography>
                <Typography variant="h6">
                  {item.minimum_quantity} {item.unit}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Price per Unit
                </Typography>
                <Typography variant="h6">
                  ${typeof item.price_per_unit === 'number' 
                    ? item.price_per_unit.toFixed(2)
                    : parseFloat(item.price_per_unit).toFixed(2)}
                </Typography>
              </Box>

              {item.quantity <= item.minimum_quantity && (
                <Alert
                  severity="warning"
                  icon={<AlertTriangle size={24} />}
                >
                  Stock is below minimum quantity
                </Alert>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this inventory item? This action cannot be undone.
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

export default withAccessControl(InventoryDetails, {
  requiredRoles: ['admin', 'staff'],
});