import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ArrowLeft, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import inventoryService from '../../services/inventory.service';
import { withAccessControl } from '../../components/common/withAccessControl';

const StockMovement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  const [movementData, setMovementData] = useState({
    movement_type: 'in',
    quantity: '',
    reference: '',
    notes: '',
  });

  const { data: item, isLoading: isLoadingItem } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: () => inventoryService.getById(Number(id)),
  });

  const { data: movements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['stock-movements', id],
    queryFn: () => inventoryService.getStockMovements(Number(id)),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => inventoryService.addStockMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item', id] });
      enqueueSnackbar('Stock movement recorded successfully', { variant: 'success' });
      setMovementData({
        movement_type: 'in',
        quantity: '',
        reference: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error.response?.data?.detail || 'Failed to record stock movement',
        { variant: 'error' }
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementData.quantity || !movementData.reference) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    mutation.mutate({
      item_id: Number(id),
      ...movementData,
      quantity: Number(movementData.quantity),
    });
  };

  if (isLoadingItem) {
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
          Item not found
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Stock Movement - {item.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Record Movement
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Movement Type</InputLabel>
                  <Select
                    value={movementData.movement_type}
                    label="Movement Type"
                    onChange={(e) => setMovementData(prev => ({
                      ...prev,
                      movement_type: e.target.value,
                    }))}
                  >
                    <MenuItem value="in">Stock In</MenuItem>
                    <MenuItem value="out">Stock Out</MenuItem>
                    <MenuItem value="adjust">Adjustment</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={movementData.quantity}
                  onChange={(e) => setMovementData(prev => ({
                    ...prev,
                    quantity: e.target.value,
                  }))}
                  InputProps={{
                    endAdornment: <Typography>{item.unit}</Typography>,
                  }}
                />

                <TextField
                  fullWidth
                  label="Reference"
                  value={movementData.reference}
                  onChange={(e) => setMovementData(prev => ({
                    ...prev,
                    reference: e.target.value,
                  }))}
                  helperText="e.g., Purchase Order #, Usage Request #"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={movementData.notes}
                  onChange={(e) => setMovementData(prev => ({
                    ...prev,
                    notes: e.target.value,
                  }))}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Recording...' : 'Record Movement'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Movement History
            </Typography>

            {isLoadingMovements ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : movements?.length === 0 ? (
              <Alert severity="info">
                No movement history found
              </Alert>
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
                      <TableCell>Recorded By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movements?.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {format(new Date(movement.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={movement.movement_type === 'in' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
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
                        <TableCell>{movement.created_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAccessControl(StockMovement, {
  requiredRoles: ['admin', 'staff'],
});