import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AdminPanelSettings,
  Engineering,
  Build,
  Person,
  CheckCircle,
  Cancel,
  LockReset,
  ManageAccounts,
} from '@mui/icons-material';
import { User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; permissions: string[] }> = {
  admin: {
    label: 'Administrador',
    icon: <AdminPanelSettings />,
    color: '#d32f2f',
    permissions: ['Ver todo', 'Cargar planos', 'Eliminar planos', 'Gestionar usuarios', 'Aprobar documentos', 'Editar especificaciones', 'Comentar', 'Gestionar mantenimiento'],
  },
  engineer: {
    label: 'Ingeniero',
    icon: <Engineering />,
    color: '#1565c0',
    permissions: ['Ver todo', 'Cargar planos', 'Aprobar documentos', 'Editar especificaciones', 'Comentar', 'Gestionar mantenimiento'],
  },
  technician: {
    label: 'Técnico de Mantenimiento',
    icon: <Build />,
    color: '#e65100',
    permissions: ['Ver todo', 'Comentar', 'Ver mantenimiento', 'Gestionar mantenimiento'],
  },
  operator: {
    label: 'Operador',
    icon: <Person />,
    color: '#2e7d32',
    permissions: ['Ver todo'],
  },
};

const UsersPage: React.FC = () => {
  const theme = useTheme();
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'technician' as UserRole, department: '', active: true, password: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(() => setSuccessMsg('No se pudieron cargar usuarios desde el servidor.'));
  }, []);

  const handleOpen = (user?: User) => {
    if (user) {
      setEditUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, department: user.department, active: user.active, password: '' });
    } else {
      setEditUser(null);
      setFormData({ name: '', email: '', role: 'technician', department: '', active: true, password: '' });
    }
    setDialogOpen(true);
  };

  const userPayload = () => {
    const { password, ...data } = formData;
    return password ? { ...data, password } : data;
  };

  const handleSave = async () => {
    setErrorMsg('');
    try {
      if (editUser) {
        const saved = await api.updateUser(editUser.id, userPayload());
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        setSuccessMsg('Usuario actualizado correctamente.');
      } else {
        const created = await api.createUser(userPayload());
        setUsers(prev => [...prev, created]);
        setSuccessMsg('Usuario creado correctamente.');
      }
      setDialogOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo guardar el usuario.');
    }
  };

  const handleToggleActive = async (selectedUser: User) => {
    setErrorMsg('');
    try {
      const saved = await api.updateUser(selectedUser.id, { active: !selectedUser.active });
      setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
      setSuccessMsg(saved.active ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo cambiar el estado del usuario.');
    }
  };

  const handleDelete = async (selectedUser: User) => {
    if (!window.confirm(`Eliminar usuario "${selectedUser.name}"?`)) return;
    setErrorMsg('');
    try {
      await api.deleteUser(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setSuccessMsg('Usuario eliminado correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Gestión de Usuarios</Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} usuarios registrados · {users.filter(u => u.active).length} activos
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Nuevo Usuario
          </Button>
        )}
      </Box>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}

      {/* Role summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(roleConfig).map(([role, cfg]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <Grid key={role} item xs={12} sm={6} lg={3}>
              <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: `${cfg.color}18`, color: cfg.color, width: 40, height: 40 }}>
                    {cfg.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{cfg.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{count} usuarios</Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                  Permisos:
                </Typography>
                {cfg.permissions.slice(0, 3).map(p => (
                  <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                    <CheckCircle sx={{ fontSize: 12, color: cfg.color }} />
                    <Typography variant="caption" color="text.secondary">{p}</Typography>
                  </Box>
                ))}
                {cfg.permissions.length > 3 && (
                  <Typography variant="caption" color="text.disabled">+{cfg.permissions.length - 3} más...</Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Users table */}
      <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            <TableRow>
              {['Usuario', 'Correo', 'Departamento', 'Rol', 'Último acceso', 'Estado', ''].map(h => (
                <TableCell key={h}><Typography variant="caption" fontWeight={700}>{h}</Typography></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => {
              const rCfg = roleConfig[u.role];
              const isSelf = u.id === currentUser?.id;
              return (
                <TableRow key={u.id} hover sx={{ opacity: u.active ? 1 : 0.6 }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{ width: 36, height: 36, bgcolor: `${rCfg.color}22`, color: rCfg.color, fontSize: 14, fontWeight: 700 }}
                      >
                        {u.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {u.name}
                          {isSelf && <Chip label="Tú" size="small" sx={{ ml: 0.5, height: 16, fontSize: '0.6rem' }} />}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{u.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{u.department}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rCfg.label}
                      size="small"
                      icon={rCfg.icon as any}
                      sx={{ bgcolor: `${rCfg.color}18`, color: rCfg.color, fontWeight: 600, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.active ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={u.active ? 'success' : 'default'}
                      icon={u.active ? <CheckCircle /> : <Cancel />}
                      sx={{ fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    {isAdmin && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar usuario">
                          <IconButton size="small" onClick={() => handleOpen(u)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!isSelf && (
                          <Tooltip title={u.active ? 'Desactivar' : 'Activar'}>
                            <IconButton size="small" onClick={() => handleToggleActive(u)} sx={{ color: u.active ? 'warning.main' : 'success.main' }}>
                              {u.active ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                        {!isSelf && (
                          <Tooltip title="Eliminar usuario">
                            <IconButton size="small" onClick={() => handleDelete(u)} sx={{ color: 'error.main' }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {!isAdmin && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          Solo los administradores pueden gestionar usuarios y cambiar permisos.
        </Alert>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ManageAccounts sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>
              {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Nombre completo *" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Correo electrónico *" type="email" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Rol *</InputLabel>
                <Select value={formData.role} onChange={e => setFormData(d => ({ ...d, role: e.target.value as UserRole }))} label="Rol *">
                  {Object.entries(roleConfig).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Departamento" value={formData.department} onChange={e => setFormData(d => ({ ...d, department: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label={editUser ? 'Nueva contrasena (opcional)' : 'Contrasena inicial'}
                type="password"
                value={formData.password}
                onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                helperText={!editUser && !formData.password ? 'Si se deja vacia, se usara usuario123.' : ' '}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.active} onChange={e => setFormData(d => ({ ...d, active: e.target.checked }))} color="success" />}
                label="Usuario activo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name || !formData.email}>
            {editUser ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
