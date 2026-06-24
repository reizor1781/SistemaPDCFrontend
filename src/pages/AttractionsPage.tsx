import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  useTheme,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Search,
  Description,
  People,
  ElectricBolt,
  AccessTime,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AttractionStatus, ParkArea, Attraction } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const statusConfig: Record<AttractionStatus, { color: string; label: string; dotColor: string }> = {
  operational: { color: 'success', label: 'Operacional', dotColor: '#2e7d32' },
  maintenance: { color: 'warning', label: 'Mantenimiento', dotColor: '#ed6c02' },
  inspection: { color: 'info', label: 'Inspección', dotColor: '#0288d1' },
  inactive: { color: 'default', label: 'Inactivo', dotColor: '#757575' },
};

const areaColors: Record<string, string> = {
  'Zona Extrema': '#d32f2f',
  'Zona Aventura': '#f57c00',
  'Zona Familiar': '#388e3c',
  'Zona Infantil': '#7b1fa2',
  'Zona Cultural': '#1565c0',
  'Servicios Generales': '#455a64',
};

const emptyForm = {
  name: '',
  code: '',
  area: 'Zona Aventura' as ParkArea,
  status: 'operational' as AttractionStatus,
  description: '',
  manufacturer: '',
  model: '',
  installed_power_kw: 0,
  capacity: 0,
  height_m: 0,
  duration_min: 0,
  total_plans: 0,
  pending_docs: 0,
};

const parkAreas: ParkArea[] = [
  'Zona Aventura',
  'Zona Infantil',
  'Zona Cultural',
  'Zona Extrema',
  'Zona Familiar',
  'Servicios Generales',
];

// Simple SVG attraction icons as placeholder images
const AttractionCard: React.FC<{
  attraction: Attraction;
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ attraction, canManage, onView, onEdit, onDelete }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const sCfg = statusConfig[attraction.status];
  const areaColor = areaColors[attraction.area] || '#3d7a35';
  const docPercent = attraction.total_plans > 0
    ? Math.round(((attraction.total_plans - attraction.pending_docs) / attraction.total_plans) * 100)
    : 0;

  const iconMap: Record<string, string> = {
    'Montaña Rusa': '🎢',
    'Tren del Café': '🚂',
    'Rápidos del Río': '🌊',
    'Carrusel Clásico': '🎠',
    'Teleférico': '🚠',
    'Torre Mirador': '🗼',
    'Sillas Voladoras': '🎡',
    'Splash Acuático': '💦',
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px ${areaColor}22`,
        },
      }}
    >
      {/* Image / icon header */}
      <Box
        sx={{
          height: 140,
          background: `linear-gradient(135deg, ${areaColor}88, ${areaColor}55)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1,
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '12px 12px',
        }} />
        <Typography sx={{ fontSize: '4rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
          {iconMap[attraction.name] || '⚙️'}
        </Typography>
        <Chip
          label={sCfg.label}
          size="small"
          color={sCfg.color as any}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
        <Chip
          label={attraction.area}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(0,0,0,0.4)',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.65rem',
          }}
        />
        {attraction.pending_docs > 0 && (
          <Tooltip title={`${attraction.pending_docs} planos pendientes`}>
            <Avatar
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 28,
                height: 28,
                bgcolor: '#ed6c02',
                fontSize: '0.7rem',
                fontWeight: 700,
              }}
            >
              {attraction.pending_docs}
            </Avatar>
          </Tooltip>
        )}
        {canManage && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 0.5 }}>
            <Tooltip title="Editar atraccion">
              <IconButton size="small" onClick={onEdit} sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar atraccion">
              <IconButton size="small" onClick={onDelete} sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: 'error.main' }}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, flex: 1, pr: 1 }}>
            {attraction.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ bgcolor: theme.palette.divider, px: 1, py: 0.3, borderRadius: 1, whiteSpace: 'nowrap' }}>
            {attraction.code}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem', lineHeight: 1.4 }}>
          {attraction.description.substring(0, 90)}...
        </Typography>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{attraction.capacity} personas</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ElectricBolt sx={{ fontSize: 14, color: 'secondary.main' }} />
              <Typography variant="caption" color="text.secondary">{attraction.technical_specs.installed_power_kw} kW</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Description sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{attraction.total_plans} planos</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{attraction.duration_min} min</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Doc progress */}
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Documentación</Typography>
            <Typography variant="caption" fontWeight={600} color={docPercent === 100 ? 'success.main' : 'warning.main'}>
              {docPercent}%
            </Typography>
          </Box>
          <Box sx={{ height: 4, bgcolor: theme.palette.divider, borderRadius: 2 }}>
            <Box
              sx={{
                height: '100%',
                width: `${docPercent}%`,
                bgcolor: docPercent === 100 ? 'success.main' : 'warning.main',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<Description />}
          onClick={onView}
          size="small"
        >
          Ver Documentación
        </Button>
      </CardActions>
    </Card>
  );
};

const AttractionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Attraction | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const canManage = hasPermission('manage_attractions');

  useEffect(() => {
    api.getAttractions()
      .then(setAttractions)
      .catch(err => setError(err instanceof Error ? err.message : 'No se pudieron cargar las atracciones'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = attractions.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.technical_specs.manufacturer.toLowerCase().includes(search.toLowerCase());
    const matchArea = !areaFilter || a.area === areaFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchArea && matchStatus;
  });

  const areas = [...new Set(attractions.map(a => a.area))];

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (attraction: Attraction) => {
    setEditing(attraction);
    setFormData({
      name: attraction.name,
      code: attraction.code,
      area: attraction.area,
      status: attraction.status,
      description: attraction.description,
      manufacturer: attraction.technical_specs.manufacturer,
      model: attraction.technical_specs.model,
      installed_power_kw: attraction.technical_specs.installed_power_kw,
      capacity: attraction.capacity,
      height_m: attraction.height_m,
      duration_min: attraction.duration_min,
      total_plans: attraction.total_plans,
      pending_docs: attraction.pending_docs,
    });
    setDialogOpen(true);
  };

  const toPayload = () => ({
    name: formData.name,
    code: formData.code,
    area: formData.area,
    status: formData.status,
    description: formData.description,
    capacity: Number(formData.capacity),
    height_m: Number(formData.height_m),
    duration_min: Number(formData.duration_min),
    total_plans: Number(formData.total_plans),
    pending_docs: Number(formData.pending_docs),
    technical_specs: {
      manufacturer: formData.manufacturer || 'Sin registrar',
      model: formData.model || 'Sin registrar',
      year_installed: editing?.technical_specs.year_installed ?? new Date().getFullYear(),
      installed_power_kw: Number(formData.installed_power_kw),
      operating_voltage_v: editing?.technical_specs.operating_voltage_v ?? [220],
      control_voltage_v: editing?.technical_specs.control_voltage_v ?? 24,
      frequency_hz: editing?.technical_specs.frequency_hz ?? 60,
      protection_ip: editing?.technical_specs.protection_ip ?? 'N/A',
      motors: editing?.technical_specs.motors ?? [],
      vfds: editing?.technical_specs.vfds ?? [],
      plcs: editing?.technical_specs.plcs ?? [],
      sensors: editing?.technical_specs.sensors ?? [],
      certifications: editing?.technical_specs.certifications ?? [],
    },
  });

  const saveAttraction = async () => {
    if (!formData.name || !formData.code) return;
    try {
      const saved = editing
        ? await api.updateAttraction(editing.id, toPayload())
        : await api.createAttraction(toPayload());

      setAttractions(prev => editing
        ? prev.map(item => item.id === saved.id ? saved : item)
        : [saved, ...prev]);
      setDialogOpen(false);
      setSuccess(editing ? 'Atraccion actualizada correctamente.' : 'Atraccion creada correctamente.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la atraccion');
    }
  };

  const deleteAttraction = async (attraction: Attraction) => {
    const confirmed = window.confirm(`Eliminar ${attraction.name}?`);
    if (!confirmed) return;
    try {
      await api.deleteAttraction(attraction.id);
      setAttractions(prev => prev.filter(item => item.id !== attraction.id));
      setSuccess('Atraccion eliminada correctamente.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la atraccion');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Atracciones
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {attractions.length} atracciones registradas · {filtered.length} mostrando
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {canManage && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nueva Atraccion
          </Button>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por nombre, código, fabricante..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Zona del parque</InputLabel>
          <Select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} label="Zona del parque">
            <MenuItem value="">Todas las zonas</MenuItem>
            {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Estado">
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="operational">Operacional</MenuItem>
            <MenuItem value="maintenance">Mantenimiento</MenuItem>
            <MenuItem value="inspection">Inspección</MenuItem>
            <MenuItem value="inactive">Inactivo</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Cards grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No se encontraron atracciones con los filtros aplicados.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map(attraction => (
            <Grid key={attraction.id} item xs={12} sm={6} md={4} lg={3}>
              <AttractionCard
                attraction={attraction}
                canManage={canManage}
                onView={() => navigate(`/documentation/${attraction.id}`)}
                onEdit={() => openEdit(attraction)}
                onDelete={() => deleteAttraction(attraction)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Editar atraccion' : 'Nueva atraccion'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Nombre" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Codigo" value={formData.code} onChange={e => setFormData(d => ({ ...d, code: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Zona</InputLabel>
                <Select value={formData.area} label="Zona" onChange={e => setFormData(d => ({ ...d, area: e.target.value as ParkArea }))}>
                  {parkAreas.map(area => <MenuItem key={area} value={area}>{area}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select value={formData.status} label="Estado" onChange={e => setFormData(d => ({ ...d, status: e.target.value as AttractionStatus }))}>
                  <MenuItem value="operational">Operacional</MenuItem>
                  <MenuItem value="maintenance">Mantenimiento</MenuItem>
                  <MenuItem value="inspection">Inspeccion</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" multiline rows={2} label="Descripcion" value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Fabricante" value={formData.manufacturer} onChange={e => setFormData(d => ({ ...d, manufacturer: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Modelo" value={formData.model} onChange={e => setFormData(d => ({ ...d, model: e.target.value }))} />
            </Grid>
            {[
              ['installed_power_kw', 'Potencia instalada (kW)'],
              ['capacity', 'Capacidad'],
              ['height_m', 'Altura (m)'],
              ['duration_min', 'Duracion (min)'],
              ['total_plans', 'Total planos'],
              ['pending_docs', 'Planos pendientes'],
            ].map(([key, label]) => (
              <Grid key={key} item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={label}
                  value={formData[key as keyof typeof formData]}
                  onChange={e => setFormData(d => ({ ...d, [key]: Number(e.target.value) }))}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveAttraction} disabled={!formData.name || !formData.code}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttractionsPage;
