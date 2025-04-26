import { Box, Grid, Skeleton, Paper } from '@mui/material';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
  count: number;
}

const LoadingSkeleton = ({ viewMode, count }: LoadingSkeletonProps) => {
  if (viewMode === 'grid') {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(count)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={200} />
              <Box sx={{ pt: 2 }}>
                <Skeleton width="60%" height={32} />
                <Skeleton width="100%" height={20} sx={{ mt: 1 }} />
                <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton width={80} height={24} />
                  <Skeleton width={80} height={24} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {Array.from(new Array(count)).map((_, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2, display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={100} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton width="30%" height={32} />
            <Skeleton width="100%" height={20} sx={{ mt: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton width={80} height={24} />
              <Skeleton width={80} height={24} />
              <Skeleton width={120} height={24} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Skeleton width={80} height={36} />
            <Skeleton width={80} height={36} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default LoadingSkeleton;