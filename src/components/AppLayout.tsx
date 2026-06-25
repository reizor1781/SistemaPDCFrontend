import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Attractions,
  Description,
  PictureAsPdf,
  ManageAccounts,
  Search,
  Build,
  MenuBook,
  LightMode,
  DarkMode,
  Logout,
  Person,
  NotificationsNone,
  Park,
  ChevronLeft,
  ElectricBolt,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { resolveFileUrl } from '../services/api';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { label: 'Atracciones', icon: <Attractions />, path: '/attractions' },
  { label: 'Documentación', icon: <Description />, path: '/documentation' },
  { label: 'Visor de Planos', icon: <PictureAsPdf />, path: '/viewer' },
  { label: 'Gestión de Planos', icon: <Build />, path: '/plans', permission: 'upload_plans' },
  { label: 'Gestión de Manuales', icon: <MenuBook />, path: '/manuals', permission: 'manage_manuals' },
  { label: 'Búsqueda', icon: <Search />, path: '/search' },
  { label: 'Usuarios', icon: <ManageAccounts />, path: '/users', permission: 'manage_users' },
];

const roleColors: Record<string, string> = {
  admin: '#f44336',
  engineer: '#2196f3',
  technician: '#ff9800',
  operator: '#4caf50',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  engineer: 'Ingeniero',
  technician: 'Técnico',
  operator: 'Operador',
};

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const { user, logout, hasPermission } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const drawerWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const visibleNavItems = navItems.filter(item => !item.permission || hasPermission(item.permission));

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 1 : 2.5,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 64,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img src="/logo.png" alt="logo" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight={800} lineHeight={1.1} sx={{ color: 'primary.main' }}>
                Parque del Café
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>
                Documentos
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && !isMobile && (
          <img src="/logo.png" alt="logo" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ ml: collapsed ? 0 : 'auto' }}>
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Nav Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {visibleNavItems.map(item => {
          const active = isActive(item.path);
          return (
            <Tooltip
              key={item.path}
              title={collapsed && !isMobile ? item.label : ''}
              placement="right"
            >
              <Box
                onClick={() => handleNavClick(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: collapsed && !isMobile ? 0 : 2,
                  py: 1.2,
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  background: active
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.primary.main}11)`
                    : 'transparent',
                  borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  color: active ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: `${theme.palette.primary.main}14`,
                    color: 'primary.main',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', minWidth: 24 }}>{item.icon}</Box>
                {(!collapsed || isMobile) && (
                  <Typography variant="body2" fontWeight={active ? 600 : 400} noWrap>
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* User info at bottom */}
      {user && (
        <Box
          sx={{
            px: collapsed && !isMobile ? 1 : 2,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: roleColors[user.role],
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          {(!collapsed || isMobile) && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" fontWeight={600} noWrap display="block">
                {user.name}
              </Typography>
              <Chip
                label={roleLabels[user.role]}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: `${roleColors[user.role]}22`,
                  color: roleColors[user.role],
                  fontWeight: 600,
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            transition: 'width 0.3s ease',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin 0.3s ease',
        }}
      >
        {/* AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: 'text.primary',
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              sx={{ display: { md: 'none' } }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>

            {/* Breadcrumb / Current page title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <ElectricBolt sx={{ color: 'secondary.main', fontSize: 18 }} />
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {visibleNavItems.find(n => isActive(n.path))?.label || 'Sistema de Gestión de documentos'}
              </Typography>
            </Box>

            {/* Actions */}
            <Tooltip title="Notificaciones">
              <IconButton size="small">
                <Badge badgeContent={3} color="warning" max={9}>
                  <NotificationsNone />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}>
              <IconButton size="small" onClick={toggleTheme}>
                {isDarkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Mi cuenta">
              <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
                <Avatar
                  src={user?.avatar ? resolveFileUrl(user.avatar) : undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: roleColors[user?.role || 'operator'],
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {user?.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                Mi Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
