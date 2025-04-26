import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CardActions,
  Button,
} from '@mui/material';
import { MoreVertical, Edit, Trash2, Calendar, PenTool as Tool } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Equipment } from '../../types';

interface EquipmentCardProps {
  equipment: Equipment;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  available: 'success',
  in_use: 'warning',
  maintenance: 'error',
  out_of_service: 'default',
};

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/equipment/${equipment.id}/edit`);
  };

  const handleDelete = () => {
    handleMenuClose();
    // Implement delete confirmation dialog
  };

  const handleBook = () => {
    navigate(`/bookings/new?equipment=${equipment.id}`);
  };

  const handleMaintenance = () => {
    navigate(`/equipment/${equipment.id}/maintenance`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={equipment.image_url || 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg'}
        alt={equipment.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {equipment.name}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertical size={20} />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {equipment.description}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={equipment.status}
            size="small"
            color={statusColors[equipment.status]}
          />
          <Chip
            label={equipment.category}
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Location: {equipment.location}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          startIcon={<Calendar size={16} />}
          onClick={handleBook}
          disabled={equipment.status !== 'available'}
        >
          Book
        </Button>
        <Button
          size="small"
          startIcon={<Tool size={16} />}
          onClick={handleMaintenance}
        >
          Maintenance
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default EquipmentCard;