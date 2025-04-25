import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) => theme.palette.grey[100],
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        {"© "}
        {new Date().getFullYear()}
        {" Smart Lab Resource Management. All rights reserved."}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        <Link color="inherit" href="/privacy">
          Privacy Policy
        </Link>
        {" | "}
        <Link color="inherit" href="/terms">
          Terms of Service
        </Link>
        {" | "}
        <Link color="inherit" href="/contact">
          Contact Us
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
