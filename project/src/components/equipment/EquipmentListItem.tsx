import {
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import { MoreVertical, Edit, Trash2, Calendar, PenTool as Tool } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Equipment } from '../../types';

interface EquipmentListItemProps {
  equipment: Equipment;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  available: 'success',
  in_use: 'warning',
  maintenance: 'error',
  out_of_service: 'default',
};

const EquipmentListItem = ({ equipment }: EquipmentListItemProps) => {
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
    <Paper 
      sx={{ 
        p: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '&:hover': {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <Box
        component="img"
        src={equipment.image_url || 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg'}
        alt={equipment.name}
        sx={{
          width: 100,
          height: 100,
          objectFit: 'cover',
          borderRadius: 1,
        }}
      />

      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h2">
            {equipment.name}
          </Typography>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertical size={20} />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {equipment.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <Typography variant="body2" color="text.secondary">
            Location: {equipment.location}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
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
      </Box>

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
    </Paper>
  );
};

export default EquipmentListItem;