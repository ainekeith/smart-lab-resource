import React from "react";
import { Typography, Box } from "@mui/material";

const Inventory = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory
      </Typography>
      <Typography variant="body1">Manage laboratory inventory here</Typography>
    </Box>
  );
};

export default Inventory;
