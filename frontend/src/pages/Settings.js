import React from "react";
import { Typography, Box } from "@mui/material";

const Settings = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1">
        Manage your application settings here
      </Typography>
    </Box>
  );
};

export default Settings;
