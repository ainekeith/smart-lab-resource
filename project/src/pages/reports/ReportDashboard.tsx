import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, FileSpreadsheet, File as FilePdf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import reportService from '../../services/report.service';
import { withAccessControl } from '../../components/common/withAccessControl';
import { ReportData } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportDashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [reportType, setReportType] = useState('equipment_usage');

  const { data: reportData, isLoading, error } = useQuery<ReportData>({
    queryKey: ['report', reportType, dateRange],
    queryFn: () => reportService.getEquipmentUsageReport(
      dateRange.startDate.toISOString(),
      dateRange.endDate.toISOString()
    ),
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const blob = await reportService.exportReport(reportType, format, {
        start_date: dateRange.startDate.toISOString(),
        end_date: dateRange.endDate.toISOString(),
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${format}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading report data. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Reports & Analytics
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FileSpreadsheet size={20} />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilePdf size={20} />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
          </Stack>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="equipment_usage">Equipment Usage</MenuItem>
                  <MenuItem value="booking_analytics">Booking Analytics</MenuItem>
                  <MenuItem value="maintenance_history">Maintenance History</MenuItem>
                  <MenuItem value="inventory_status">Inventory Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, startDate: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, endDate: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : !reportData ? (
          <Alert severity="info">No data available for the selected period</Alert>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Usage Trends
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" name="Bookings" fill="#0088FE" />
                      <Bar dataKey="usage_hours" name="Usage Hours" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Equipment Distribution
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.distribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label
                      >
                        {reportData.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="primary.main">
                        {reportData.metrics.total_bookings}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Bookings
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {reportData.metrics.utilization_rate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Utilization Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="warning.main">
                        {reportData.metrics.avg_duration}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" color="error.main">
                        {reportData.metrics.maintenance_count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Maintenance Events
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default withAccessControl(ReportDashboard, {
  requiredRoles: ['admin', 'staff'],
});