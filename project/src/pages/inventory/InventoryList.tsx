import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import inventoryService from '../../services/inventory.service';
import { withAccessControl } from '../../components/common/withAccessControl';

const stockStatusColors = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'error',
};

const InventoryList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => inventoryService.getAll(filters),
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (event: unknown, value: number) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading inventory data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/inventory/new')}
        >
          Add Item
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search inventory..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Filter size={16} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="chemicals">Chemicals</MenuItem>
                <MenuItem value="glassware">Glassware</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="consumables">Consumables</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filters.status}
                label="Stock Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Filter size={16} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="low_stock">Low Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !data?.results || data.results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No inventory items found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Start by adding items to your inventory
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => navigate('/inventory/new')}
          >
            Add Item
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Min. Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.name}
                        {item.quantity <= item.minimum_quantity && (
                          <AlertTriangle size={16} color="#ff9800" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell align="right">
                      {item.minimum_quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.stock_status.replace('_', ' ')}
                        size="small"
                        color={stockStatusColors[item.stock_status] as any}
                      />
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/inventory/${item.id}`)}
                        >
                          <Eye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/inventory/${item.id}/edit`)}
                        >
                          <Edit size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/inventory/${item.id}/movement`)}
                        >
                          <ArrowUpDown size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data.count > filters.pageSize && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(data.count / filters.pageSize)}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default withAccessControl(InventoryList, {
  requiredRoles: ['admin', 'staff'],
});

