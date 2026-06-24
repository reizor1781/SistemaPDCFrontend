import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ElectricBolt,
  Park,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const mockAccounts = [
  { email: 'admin@parquedelcafe.com', password: 'admin123', role: 'Administrador', color: '#f44336', description: 'Acceso total al sistema' },
  { email: 'ingeniero@parquedelcafe.com', password: 'ing123', role: 'Ingeniero', color: '#2196f3', description: 'Crea y edita planos y atracciones' },
  { email: 'tecnico@parquedelcafe.com', password: 'tec123', role: 'Técnico', color: '#ff9800', description: 'Gestión de mantenimiento' },
  { email: 'operador@parquedelcafe.com', password: 'op123', role: 'Operador', color: '#4caf50', description: 'Solo lectura' },
];

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Error de autenticación');
    }
    setLoading(false);
  };

  const quickLogin = async (acc: typeof mockAccounts[0]) => {
    setLoading(true);
    setError('');
    const result = await login(acc.email, acc.password);
    if (!result.success) {
      setError(result.error || 'Error de autenticación');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f140f 0%, #1a2a18 50%, #0f1a0f 100%)'
          : 'linear-gradient(135deg, #1a3a14 0%, #2d5a27 40%, #3d7a35 70%, #1a3a14 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: 200 + i * 80,
            height: 200 + i * 80,
            borderRadius: '50%',
            border: `1px solid rgba(245,197,24,${0.03 + i * 0.01})`,
            top: `${10 + i * 12}%`,
            left: `${-5 + i * 5}%`,
            animation: `rotate ${20 + i * 5}s linear infinite`,
            '@keyframes rotate': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,197,24,0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(77,150,64,0.08) 0%, transparent 40%)`,
        }}
      />

      {/* Left side branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 6,
          position: 'relative',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            
        <img src="/logo.png" alt="logo" style={{ width: '250px', height: '250px', borderRadius: '50%' }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#f5c518', mb: 1, fontSize: '2.5rem' }}>
            Parque del Café
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 300 }}>
            Sistema de Gestión de
          </Typography>
          <Typography variant="h4" sx={{ color: '#a8d5a2', fontWeight: 700, mb: 4 }}>
            Planos Eléctricos
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 4 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            {[
              { icon: '⚡', text: 'Visualizador PDF avanzado con anotaciones' },
              { icon: '🗂️', text: 'Gestión de versiones y revisiones' },
              { icon: '🔍', text: 'Búsqueda inteligente de componentes' },
              { icon: '👥', text: 'Control de acceso por roles' },
              { icon: '📊', text: 'Dashboard de estadísticas en tiempo real' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right side — login form */}
      <Box
        sx={{
          width: { xs: '100%', md: 480 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: 4,
            borderRadius: 4,
            background: theme.palette.mode === 'dark' ? 'rgba(26,38,24,0.95)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
          }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 3 }}>
            <img src="/logo.png" alt="logo" style={{ width: '150px', height: '150px', borderRadius: '50%' }} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ElectricBolt sx={{ color: 'secondary.main', fontSize: 20 }} />
              <Typography variant="h5" fontWeight={700}>
                Iniciar Sesión
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Sistema de Planos Eléctricos — Acceso seguro
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || !email || !password}
              size="large"
              sx={{ height: 48, fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar al Sistema'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              Acceso rápido demo
            </Typography>
          </Divider>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            {mockAccounts.map(acc => (
              <Tooltip
                key={acc.email}
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="caption" display="block" fontWeight={700} sx={{ color: acc.color }}>
                      {acc.role}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ opacity: 0.85 }}>
                      {acc.description}
                    </Typography>
                    <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      {acc.email}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ opacity: 0.7, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                      🔑 {acc.password}
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Chip
                  label={acc.role}
                  size="small"
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  sx={{
                    cursor: 'pointer',
                    borderColor: acc.color,
                    color: acc.color,
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: `${acc.color}22`,
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${acc.color}44`,
                    },
                  }}
                  variant="outlined"
                />
              </Tooltip>
            ))}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            © 2026 Parque del Café · Montenegro, Quindío · Colombia
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
