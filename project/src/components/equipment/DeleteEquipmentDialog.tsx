import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteEquipmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  equipmentName: string;
}

export const DeleteEquipmentDialog = ({
  open,
  onClose,
  onConfirm,
  equipmentName,
}: DeleteEquipmentDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Equipment</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{equipmentName}"? This action cannot
          be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
