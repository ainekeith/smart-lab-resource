import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Badge,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Box as BoxIcon,
  Clock,
  Wrench,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import DashboardCard from './DashboardCard';
import bookingService from '../../services/booking.service';
import equipmentService from '../../services/equipment.service';
import inventoryService from '../../services/inventory.service';
import { Booking, Equipment, InventoryItem } from '../../types';
import { format } from 'date-fns';
import { withAccessControl } from '../common/withAccessControl';

const StaffDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending bookings
        const bookingsResponse = await bookingService.getAll({ status: 'pending' });
        setPendingBookings(bookingsResponse.data);
        
        // Fetch equipment under maintenance
        const equipmentResponse = await equipmentService.getAll({ status: 'maintenance' });
        setMaintenanceEquipment(equipmentResponse.data);
        
        // Fetch low stock inventory items
        const inventoryResponse = await inventoryService.getLowStockItems();
        setLowStockItems(inventoryResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleApprove = async (id: number) => {
    try {
      await bookingService.approve(id);
      setPendingBookings(bookings => bookings.filter(booking => booking.id !== id));
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };
  
  const handleReject = async (id: number) => {
    try {
      await bookingService.reject(id, 'Request rejected by staff');
      setPendingBookings(bookings => bookings.filter(booking => booking.id !== id));
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Staff Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<BoxIcon size={20} />}
          onClick={() => navigate('/equipment/manage')}
        >
          Manage Equipment
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Requests"
            value={pendingBookings.length}
            icon={<Clock size={24} />}
            description="Awaiting approval"
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Equipment in Maintenance"
            value={maintenanceEquipment.length}
            icon={<Wrench size={24} />}
            description="Under repair/service"
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Low Stock Items"
            value={lowStockItems.length}
            icon={<AlertTriangle size={24} />}
            description="Need restocking"
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Equipment Utilization"
            value="78%"
            icon={<BoxIcon size={24} />}
            description="Overall usage"
            color={theme.palette.success.main}
            trend={5} // Example trend
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  <Badge badgeContent={pendingBookings.length} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                    Pending Approvals
                  </Badge>
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowUpRight size={16} />}
                  onClick={() => navigate('/bookings?status=pending')}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {pendingBookings.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No pending booking requests
                  </Typography>
                </Paper>
              ) : (
                <List>
                  {pendingBookings.slice(0, 4).map((booking) => (
                    <ListItem
                      key={booking.id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        p: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2">
                              {booking.equipment.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(booking.created_at), 'MMM dd, h:mm a')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" component="span">
                              <strong>User:</strong> {booking.user.first_name} {booking.user.last_name}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                              <strong>Time:</strong> {format(new Date(booking.start_time), 'MMM dd, h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                              <strong>Purpose:</strong> {booking.purpose}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle2 size={16} />}
                                onClick={() => handleApprove(booking.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<XCircle size={16} />}
                                onClick={() => handleReject(booking.id)}
                              >
                                Reject
                              </Button>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  <Badge badgeContent={lowStockItems.length} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                    Low Stock Items
                  </Badge>
                </Typography>
                <Button
                  variant="text"
                  endIcon={<ArrowUpRight size={16} />}
                  onClick={() => navigate('/inventory?low_stock=true')}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {lowStockItems.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    All inventory items are in good stock
                  </Typography>
                </Paper>
              ) : (
                <List>
                  {lowStockItems.slice(0, 5).map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'background.default',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">
                              {item.name}
                            </Typography>
                            <Chip
                              label={`${item.quantity} / ${item.minimum_quantity}`}
                              size="small"
                              color="error"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.category} - {item.location}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withAccessControl(StaffDashboard, {
  requiredRoles: ['staff'],
});