import React from "react";
import { Typography, Box } from "@mui/material";

const Bookings = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bookings
      </Typography>
      <Typography variant="body1">
        Manage your equipment bookings here
      </Typography>
    </Box>
  );
};

export default Bookings;
