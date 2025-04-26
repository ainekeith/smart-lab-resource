import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, Plus, Filter, Grid as GridIcon, List as ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import equipmentService from '../../services/equipment.service';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import EquipmentListItem from '../../components/equipment/EquipmentListItem';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useAccess } from '../../hooks/useAccess';

const EquipmentList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAdmin, isStaff } = useAccess();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    pageSize: 12,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentService.getAll(filters),
  });

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

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
          Error loading equipment. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Equipment Management
        </Typography>
        {(isAdmin || isStaff) && (
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => navigate('/equipment/new')}
          >
            Add Equipment
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Filter size={16} />
              </InputAdornment>
            }
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="in_use">In Use</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="out_of_service">Out of Service</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          startIcon={viewMode === 'grid' ? <ListIcon size={20} /> : <GridIcon size={20} />}
        >
          {viewMode === 'grid' ? 'List View' : 'Grid View'}
        </Button>
      </Box>

      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} count={12} />
      ) : !data?.results || data.results.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No equipment found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {isAdmin || isStaff ? 'Start by adding new equipment' : 'No equipment is available at the moment'}
          </Typography>
          {(isAdmin || isStaff) && (
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => navigate('/equipment/new')}
            >
              Add Equipment
            </Button>
          )}
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {data.results.map((equipment) => (
            <Grid item xs={12} sm={6} md={4} key={equipment.id}>
              <EquipmentCard equipment={equipment} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {data.results.map((equipment) => (
            <EquipmentListItem key={equipment.id} equipment={equipment} />
          ))}
        </Box>
      )}

      {data?.count > filters.pageSize && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(data.count / filters.pageSize)}
            page={filters.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default EquipmentList;