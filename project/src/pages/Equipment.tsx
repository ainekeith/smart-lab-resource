import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  IconButton,
  CardActions,
  Skeleton,
  ButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Search, Filter, Grid as GridView, List as ViewList, InfoIcon, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import equipmentService from '../services/equipment.service';
import { Equipment } from '../types';

const statusColors: Record<string, string> = {
  available: 'success',
  in_use: 'warning',
  reserved: 'info',
  maintenance: 'error',
  out_of_service: 'default',
};

const EquipmentPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    fetchEquipment();
  }, [page, statusFilter, categoryFilter]);
  
  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const filters: any = {
        page,
        page_size: 12,
      };
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await equipmentService.getAll(filters);
      setEquipment(response.data);
      
      // Calculate total pages based on total items
      setTotalPages(Math.ceil(response.total / 12));
      
      // Extract unique categories for filter
      const uniqueCategories = [...new Set(response.data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchEquipment();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };
  
  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value);
    setPage(1);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleViewDetails = (id: number) => {
    navigate(`/equipment/${id}`);
  };
  
  const handleBookEquipment = (id: number) => {
    navigate(`/bookings/create?equipment=${id}`);
  };
  
  const renderGridView = () => (
    <Grid container spacing={3}>
      {loading
        ? Array.from(new Array(12)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        : equipment.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image_url || 'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.category} | {item.location}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={item.status.replace('_', ' ')}
                      size="small"
                      color={statusColors[item.status] as any}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Model: {item.model_number}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<InfoIcon size={16} />}
                    onClick={() => handleViewDetails(item.id)}
                  >
                    Details
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Calendar size={16} />}
                    color="primary"
                    disabled={item.status !== 'available'}
                    onClick={() => handleBookEquipment(item.id)}
                  >
                    Book
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
    </Grid>
  );
  
  const renderListView = () => (
    <Box>
      {loading
        ? Array.from(new Array(10)).map((_, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="rectangular" width={80} height={80} sx={{ mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="30%" />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={120} height={32} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        : equipment.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Box
                  component="img"
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mr: 2,
                  }}
                  src={item.image_url || 'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'}
                  alt={item.name}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.status.replace('_', ' ')}
                      size="small"
                      color={statusColors[item.status] as any}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.category} | {item.location} | Model: {item.model_number}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <ButtonGroup variant="outlined" size="small">
                      <Button onClick={() => handleViewDetails(item.id)}>
                        Details
                      </Button>
                      <Button
                        color="primary"
                        disabled={item.status !== 'available'}
                        onClick={() => handleBookEquipment(item.id)}
                      >
                        Book
                      </Button>
                    </ButtonGroup>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
    </Box>
  );
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: { xs: 2, sm: 0 } }}>
          Equipment
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color={viewMode === 'grid' ? 'primary' : 'default'}
            onClick={() => setViewMode('grid')}
          >
            <GridView />
          </IconButton>
          <IconButton
            color={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          >
            <ViewList />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        <TextField
          placeholder="Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button 
                  size="small"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          fullWidth={isMobile}
          sx={{ flexGrow: 1 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <Filter size={16} />
                </InputAdornment>
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in_use">In Use</MenuItem>
              <MenuItem value="reserved">Reserved</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="out_of_service">Out of Service</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={categoryFilter}
              label="Category"
              onChange={handleCategoryFilterChange}
              startAdornment={
                <InputAdornment position="start">
                  <Filter size={16} />
                </InputAdornment>
              }
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {viewMode === 'grid' ? renderGridView() : renderListView()}
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default EquipmentPage;