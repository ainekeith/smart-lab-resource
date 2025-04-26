import { ReactNode } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  SxProps, 
  Theme,
  useTheme
} from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  color?: string;
  trend?: number;
  sx?: SxProps<Theme>;
}

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  color, 
  trend,
  sx = {} 
}: DashboardCardProps) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        ...sx
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: color || 'primary.main',
              color: 'white',
              mr: 2,
            }}
          >
            {icon}
          </Paper>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {value}
            </Typography>
          </Box>
        </Box>
        
        {(description || trend !== undefined) && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
            
            {trend !== undefined && (
              <Typography
                variant="body2"
                sx={{
                  ml: description ? 'auto' : 0,
                  color: trend >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 500,
                }}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;