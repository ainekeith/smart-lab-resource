import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  helperText?: string;
  isUploading?: boolean;
  error?: string;
}

const FileUpload = ({
  onUpload,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf'],
  },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  helperText = 'Drag and drop files here, or click to select files',
  isUploading = false,
  error,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
        setFiles(newFiles);
        await onUpload(newFiles);
      } catch (error) {
        enqueueSnackbar('Failed to upload files. Please try again.', { variant: 'error' });
      }
    },
    [files, maxFiles, onUpload, enqueueSnackbar]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={24} />;
    }
    return <FileText size={24} />;
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {isUploading ? (
            <CircularProgress size={40} />
          ) : (
            <Upload size={40} color={isDragActive ? '#1976d2' : '#9e9e9e'} />
          )}
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 400 }}
          >
            {helperText}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Max file size: {maxSize / 1024 / 1024}MB
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                {getFileIcon(file)}
              </Box>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024).toFixed(1)} KB`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X size={20} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUpload;