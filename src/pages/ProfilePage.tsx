import React, { useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Lock,
  Person,
  Email,
  Badge,
  Work,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { resolveFileUrl } from '../services/api';

const roleColors: Record<string, string> = {
  admin: '#f44336',
  engineer: '#2196f3',
  technician: '#ff9800',
  operator: '#4caf50',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  engineer: 'Ingeniero',
  technician: 'Técnico de Mantenimiento',
  operator: 'Operador',
};

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { user, updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError('');
    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(
        { name: name !== user?.name ? name : undefined, password: password || undefined },
        avatarFile ?? undefined,
      );
      setPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
      setAvatarPreview('');
      setSuccess('Perfil actualizado correctamente.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const avatarSrc = avatarPreview || (user.avatar ? resolveFileUrl(user.avatar) : '');
  const roleColor = roleColors[user.role] || '#607d8b';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Mi Perfil
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Administra tu información personal y preferencias de seguridad.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Avatar card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: roleColor,
                  fontSize: 36,
                  fontWeight: 700,
                  mx: 'auto',
                  border: `3px solid ${roleColor}44`,
                }}
              >
                {!avatarSrc && user.name.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                size="small"
                onClick={() => avatarInputRef.current?.click()}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <PhotoCamera sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <Typography variant="h6" fontWeight={700}>
              {user.name}
            </Typography>
            <Chip
              label={roleLabels[user.role] || user.role}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: `${roleColor}18`,
                color: roleColor,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'left' }}>
              {[
                { icon: <Email sx={{ fontSize: 16 }} />, label: 'Correo', value: user.email },
                { icon: <Work sx={{ fontSize: 16 }} />, label: 'Departamento', value: user.department },
                { icon: <Badge sx={{ fontSize: 16 }} />, label: 'ID', value: user.id.slice(0, 12) + '...' },
              ].map(({ icon, label, value }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: 'text.disabled' }}>{icon}</Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled" display="block">
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {value}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {user.lastLogin && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: 'text.disabled' }}>
                    <Person sx={{ fontSize: 16 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.disabled" display="block">
                      Último acceso
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {new Date(user.lastLogin).toLocaleString('es-CO', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Edit form */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={1}
            sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: 'primary.main' }} />
              Información Personal
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Correo electrónico"
                  value={user.email}
                  disabled
                  helperText="El correo solo puede cambiarlo un administrador."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lock sx={{ color: 'primary.main' }} />
              Cambiar Contraseña
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nueva contraseña"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  helperText="Mínimo 6 caracteres. Dejar vacío para no cambiar."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Confirmar contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  error={!!password && !!confirmPassword && password !== confirmPassword}
                  helperText={password && confirmPassword && password !== confirmPassword ? 'Las contraseñas no coinciden' : ' '}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
