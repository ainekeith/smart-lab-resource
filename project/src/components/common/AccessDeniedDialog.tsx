import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
  redirectPath?: string;
}

const AccessDeniedDialog = ({
  open,
  onClose,
  message = "You don't have permission to access this resource.",
  redirectPath = '/dashboard',
}: AccessDeniedDialogProps) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    onClose();
    navigate(redirectPath);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Lock size={48} color="#f44336" />
        </Box>
        Access Denied
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ mr: 1 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleRedirect}
          color="primary"
        >
          Go to Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessDeniedDialog