import { useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon, LogOut, User, Bell, Sun, Moon, LayoutDashboard, FlaskRound as Flask, Calendar, Package, FileText, Users, Settings } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getAppTheme } from '../../utils/theme';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/uiSlice';

interface MainLayoutProps {
  children: ReactNode;
}

const drawerWidth = 280;

export const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { themeMode } = useSelector((state: RootState) => state.ui);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };
  
  const navItems = [
    { 
      text: 'Dashboard',
      icon: <LayoutDashboard size={22} />,
      path: '/dashboard',
    },
    { 
      text: 'Equipment',
      icon: <Flask size={22} />,
      path: '/equipment',
    },
    { 
      text: 'Bookings',
      icon: <Calendar size={22} />,
      path: '/bookings',
    },
    { 
      text: 'Inventory',
      icon: <Package size={22} />,
      path: '/inventory',
    },
    { 
      text: 'Reports',
      icon: <FileText size={22} />,
      path: '/reports',
    },
  ];
  
  // Only show Users menu for admin
  if (user?.user_type === 'admin') {
    navItems.push({
      text: 'Users',
      icon: <Users size={22} />,
      path: '/users',
    });
  }
  
  navItems.push({
    text: 'Settings',
    icon: <Settings size={22} />,
    path: '/settings',
  });
  
  const drawer = (
    <>
      <Toolbar sx={{ justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Smart Lab Management
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ pl: 2, pr: 2, py: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.user_type === 'admin' ? 'Administrator' : 
               user?.user_type === 'staff' ? 'Staff Member' : 'Student'}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleThemeChange}
          startIcon={themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        >
          {themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={getAppTheme(themeMode === 'dark' ? 'dark' : 'light')}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}
            >
              {/* Page title could go here */}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                onClick={handleNotificationClick}
                aria-label="show notifications"
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Bell size={20} />
                </Badge>
              </IconButton>
              
              <IconButton
                onClick={handleProfileClick}
                size="small"
                edge="end"
                aria-label="account menu"
                aria-haspopup="true"
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <Toolbar />
          {children}
        </Box>
        
        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogOut size={18} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
        
        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400, overflow: 'auto' },
          }}
        >
          <MenuItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" fontWeight={600}>Notifications</Typography>
            </Box>
          </MenuItem>
          <Divider />
          {unreadCount === 0 ? (
            <MenuItem>
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', width: '100%' }}>
                No new notifications
              </Typography>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => { handleNotificationClose(); navigate('/notifications'); }}>
              <Typography variant="body2" color="primary">
                View all notifications
              </Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;