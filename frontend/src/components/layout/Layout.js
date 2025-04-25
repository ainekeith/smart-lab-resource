import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar onMenuClick={handleDrawerToggle} />
      {isAuthenticated && <Sidebar open={sidebarOpen} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          ml: sidebarOpen ? "240px" : 0,
          mt: "64px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
