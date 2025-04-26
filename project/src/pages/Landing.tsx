import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowRight,
  LogIn,
  Microscope,
  Calendar,
  BarChart3,
  Users,
  GraduationCap,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -8 }}
      sx={{
        height: '100%',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[10],
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <IconButton
          sx={{
            mb: 2,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
          size="large"
        >
          {icon}
        </IconButton>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <Microscope size={24} />,
      title: 'Smart Equipment Management',
      description: 'Track and manage laboratory equipment with real-time monitoring and automated maintenance schedules.',
    },
    {
      icon: <Calendar size={24} />,
      title: 'Efficient Booking System',
      description: 'Streamline equipment reservations with our intuitive booking system and automated approval workflow.',
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Advanced Analytics',
      description: 'Gain valuable insights with comprehensive usage analytics and resource utilization reports.',
    },
  ];

  const stats = [
    { icon: <Users size={24} />, value: '5,000+', label: 'Active Users' },
    { icon: <Building2 size={24} />, value: '15+', label: 'Laboratories' },
    { icon: <GraduationCap size={24} />, value: '98%', label: 'Success Rate' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
        }}
      >
        {/* Animated Background Elements */}
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Transform Your Lab Management
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 4,
                  }}
                >
                  Soroti University's Digital Laboratory Solution
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                    endIcon={<ArrowRight />}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.9)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                    startIcon={<LogIn />}
                  >
                    Login
                  </Button>
                </Stack>

                {/* Stats */}
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Box sx={{ color: 'white' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {stat.icon}
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {stat.value}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Box
                  component="img"
                  src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg"
                  alt="Laboratory Equipment"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg)',
                    },
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                  About Soroti University
                </Typography>
                <Typography variant="body1" paragraph>
                  Soroti University stands as a beacon of academic excellence in Uganda, dedicated to nurturing the next generation of innovators and leaders. Our state-of-the-art laboratories provide students with hands-on experience using cutting-edge equipment.
                </Typography>
                <Typography variant="body1" paragraph>
                  The Smart Lab Management System represents our commitment to digital transformation, ensuring efficient resource utilization and enhanced learning experiences for our students and staff.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => window.open('https://suni.ac.ug', '_blank')}
                  sx={{ mt: 2 }}
                >
                  Visit University Website
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Box
                  component="img"
                  src="https://images.pexels.com/photos/2982449/pexels-photo-2982449.jpeg"
                  alt="Soroti University Campus"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: theme.shadows[10],
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Soroti University Smart Lab Management System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;