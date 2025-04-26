import { useState } from 'react';
import { useSnackbar } from 'notistack';
import api from '../services/api';

interface UseFileUploadOptions {
  endpoint: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export const useFileUpload = ({
  endpoint,
  onSuccess,
  onError,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
}: UseFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${maxFileSize / 1024 / 1024}MB`;
    }
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    return null;
  };

  const uploadFile = async (files: File[]) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate all files
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess?.(response.data);
      enqueueSnackbar('Files uploaded successfully', { variant: 'success' });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload file';
      setError(errorMessage);
      onError?.(error);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
    setError,
  };
};

export default useFileUpload;