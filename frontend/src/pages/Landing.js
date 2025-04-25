import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  Avatar,
  AvatarGroup,
  Divider,
} from "@mui/material";
import {
  Science,
  Inventory2,
  CalendarMonth,
  Assessment,
  Speed,
  Security,
  School,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, description }) => (
  <Card
    component={motion.div}
    whileHover={{ y: -8, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      transition: "0.3s",
      border: "none",
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(20px)",
      "&:hover": {
        transform: "translateY(-8px)",
      },
    }}
  >
    <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          color: "primary.main",
        }}
      >
        {icon}
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <Science fontSize="large" />,
      title: "Equipment Management",
      description:
        "Efficiently track and manage laboratory equipment with real-time status updates.",
    },
    {
      icon: <Inventory2 fontSize="large" />,
      title: "Inventory Control",
      description:
        "Keep track of laboratory supplies with automated stock alerts and analytics.",
    },
    {
      icon: <CalendarMonth fontSize="large" />,
      title: "Smart Booking",
      description:
        "Streamline equipment booking with an intuitive calendar interface.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", overflow: "hidden" }}>
      {/* Hero Section */}
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 8 },
            maxWidth: "1400px",
            mx: "auto",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Left Content */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "60%" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  color: "#1a237e",
                  lineHeight: 1.1,
                  mb: 2,
                }}
              >
                Smart Lab Resource Management
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mb: 4,
                  fontWeight: 400,
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  maxWidth: "600px",
                }}
              >
                Build Trust, Stand Out, and Transform Your Laboratory Operations
                at Sororti University
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    bgcolor: "#2196f3",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      bgcolor: "#1976d2",
                    },
                  }}
                >
                  Get Started (Free)
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderColor: "#2196f3",
                    color: "#2196f3",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      borderColor: "#1976d2",
                      bgcolor: "rgba(33, 150, 243, 0.04)",
                    },
                  }}
                >
                  Login
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={4}
                alignItems="center"
                justifyContent={{ xs: "center", md: "flex-start" }}
                sx={{ flexWrap: "wrap", gap: 2 }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <School sx={{ color: "#1a237e", fontSize: 28 }} />
                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ fontWeight: 700 }}
                    >
                      5,000+
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Students Served
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ fontWeight: 700 }}
                  >
                    15+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Laboratories
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ fontWeight: 700 }}
                  >
                    98%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
              </Stack>
            </motion.div>
          </Box>

          {/* Right Image */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "40%" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ width: "100%", height: "100%" }}
            >
              <Box
                component="img"
                src="/images/logos/logo.jpeg.jpg"
                alt="Sororti University Lab Management"
                sx={{
                  width: "100%",
                  maxWidth: { xs: "300px", md: "500px" },
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transform: "perspective(1000px) rotateY(-5deg)",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "perspective(1000px) rotateY(0deg)",
                  },
                }}
              />
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;
