import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  useTheme,
  Divider,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add,
  Upload,
  PictureAsPdf,
  Delete,
  Edit,
  History,
  CheckCircle,
  Pending,
  Info,
  FilterList,
  CloudUpload,
  OpenInNew,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Attraction, ElectricalPlan, PlanType, PlanStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const planTypeLabels: Record<PlanType, string> = {
  power_diagram: '⚡ Diagrama de Potencia',
  control_diagram: '🔧 Diagrama de Control',
  single_line: '📊 Diagrama Unifilar',
  plc_diagram: '💻 Diagrama PLC',
  communication: '📡 Comunicaciones',
  grounding: '⏚ Puesta a Tierra',
  lighting: '💡 Iluminación',
  mechanical: '⚙️ Mecánico',
  hydraulic: '🔵 Hidráulico',
  pneumatic: '💨 Neumático',
};

const planStatusConfig = {
  approved: { label: 'Aprobado', color: '#2e7d32', bg: '#e8f5e9' },
  draft: { label: 'Borrador', color: '#757575', bg: '#f5f5f5' },
  review: { label: 'En Revisión', color: '#0288d1', bg: '#e3f2fd' },
  obsolete: { label: 'Obsoleto', color: '#f44336', bg: '#ffebee' },
};

interface UploadDialogProps {
  open: boolean;
  attractions: Attraction[];
  onClose: () => void;
  onUpload: (data: Partial<ElectricalPlan>, file: File) => Promise<void>;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, attractions, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    attraction_id: '',
    title: '',
    type: 'single_line' as PlanType,
    description: '',
    plan_number: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!file || !formData.attraction_id || !formData.title) return;
    setUploading(true);
    try {
      await onUpload(formData, file);
      onClose();
      setFormData({ attraction_id: '', title: '', type: 'single_line', description: '', plan_number: '' });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>Cargar Nuevo Plano</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Atracción *</InputLabel>
              <Select value={formData.attraction_id} onChange={e => setFormData(d => ({ ...d, attraction_id: e.target.value }))} label="Atracción *">
                {attractions.map(a => (
                  <MenuItem key={a.id} value={a.id}>{a.name} ({a.code})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Número de plano *"
              placeholder="Ej: MR-EL-004-0"
              value={formData.plan_number}
              onChange={e => setFormData(d => ({ ...d, plan_number: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de diagrama *</InputLabel>
              <Select value={formData.type} onChange={e => setFormData(d => ({ ...d, type: e.target.value as PlanType }))} label="Tipo de diagrama *">
                {Object.entries(planTypeLabels).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Título del plano *"
              value={formData.title}
              onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Descripción"
              multiline
              rows={2}
              value={formData.description}
              onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
            />
          </Grid>

          {/* Dropzone */}
          <Grid item xs={12}>
            <Box
              {...getRootProps()}
              sx={{
                border: `2px dashed ${isDragActive ? '#3d7a35' : '#ccc'}`,
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'rgba(61,122,53,0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(61,122,53,0.04)' },
              }}
            >
              <input {...getInputProps()} />
              {file ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <PictureAsPdf sx={{ color: 'error.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{(file.size / 1024).toFixed(0)} KB</Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Upload sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {isDragActive ? 'Suelta el PDF aquí...' : 'Arrastra un PDF aquí, o haz clic para seleccionar'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">Solo archivos PDF · máx 50MB</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {uploading && (
            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Cargando plano al servidor...
                </Typography>
                <LinearProgress sx={{ borderRadius: 2 }} />
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={handleSubmit}
          disabled={!file || !formData.attraction_id || !formData.title || uploading}
        >
          Cargar Plano
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PlansManagementPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [plans, setPlans] = useState<ElectricalPlan[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAttraction, setFilterAttraction] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingPlan, setEditingPlan] = useState<ElectricalPlan | null>(null);
  const [editForm, setEditForm] = useState({
    attraction_id: '',
    plan_number: '',
    title: '',
    type: 'single_line' as PlanType,
    status: 'draft' as PlanStatus,
    description: '',
  });

  useEffect(() => {
    Promise.all([api.getPlans(), api.getAttractions()])
      .then(([loadedPlans, loadedAttractions]) => {
        setPlans(loadedPlans);
        setAttractions(loadedAttractions);
      })
      .catch(() => setErrorMsg('No se pudo cargar informacion desde el servidor.'));
  }, []);

  const filtered = plans.filter(p => {
    const matchType = !filterType || p.type === filterType;
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchAttr = !filterAttraction || p.attraction_id === filterAttraction;
    return matchType && matchStatus && matchAttr;
  });

  const handleUpload = async (data: Partial<ElectricalPlan>, file: File) => {
    setErrorMsg('');
    try {
      const newPlan = await api.uploadPlan(data, file);
      setPlans(prev => [newPlan, ...prev]);
      setSuccessMsg(`Plano "${newPlan.title}" cargado exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo cargar el plano.');
      throw err;
    }
  };

  const openEditPlan = (plan: ElectricalPlan) => {
    setEditingPlan(plan);
    setEditForm({
      attraction_id: plan.attraction_id,
      plan_number: plan.plan_number,
      title: plan.title,
      type: plan.type,
      status: plan.status,
      description: plan.description,
    });
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !editForm.attraction_id || !editForm.title || !editForm.plan_number) return;
    setErrorMsg('');
    try {
      const saved = await api.updatePlan(editingPlan.id, editForm);
      setPlans(prev => prev.map(plan => plan.id === saved.id ? saved : plan));
      setEditingPlan(null);
      setSuccessMsg(`Plano "${saved.title}" actualizado exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo actualizar el plano.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el plano "${title}"?`)) {
      try {
        setErrorMsg('');
        await api.deletePlan(id);
        setPlans(prev => prev.filter(p => p.id !== id));
        setSuccessMsg(`Plano "${title}" eliminado exitosamente.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar el plano.');
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Gestión de Planos</Typography>
          <Typography variant="body2" color="text.secondary">
            {plans.length} planos registrados · {filtered.length} mostrando
          </Typography>
        </Box>
        {hasPermission('upload_plans') && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>
            Nuevo Plano
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

      {/* Stats summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(planStatusConfig).map(([status, cfg]) => {
          const count = plans.filter(p => p.status === status).length;
          return (
            <Grid key={status} item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: filterStatus === status ? `${cfg.color}12` : 'transparent',
                  borderColor: filterStatus === status ? cfg.color : theme.palette.divider,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: cfg.color },
                }}
                onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              >
                <Typography variant="h4" fontWeight={800} sx={{ color: cfg.color }}>{count}</Typography>
                <Typography variant="caption" color="text.secondary">{cfg.label}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterList sx={{ color: 'text.secondary' }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Atracción</InputLabel>
          <Select value={filterAttraction} onChange={e => setFilterAttraction(e.target.value)} label="Atracción">
            <MenuItem value="">Todas</MenuItem>
            {attractions.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de diagrama</InputLabel>
          <Select value={filterType} onChange={e => setFilterType(e.target.value)} label="Tipo de diagrama">
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(planTypeLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </Select>
        </FormControl>
        <Button size="small" onClick={() => { setFilterType(''); setFilterStatus(''); setFilterAttraction(''); }}>
          Limpiar filtros
        </Button>
      </Box>

      {/* Plans table */}
      <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            <TableRow>
              {['N° Plano', 'Título', 'Atracción', 'Tipo', 'Estado', 'Revisiones', 'Actualizado', 'Tamaño', ''].map(h => (
                <TableCell key={h}><Typography variant="caption" fontWeight={700}>{h}</Typography></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(plan => {
              const attr = attractions.find(a => a.id === plan.attraction_id);
              const sCfg = planStatusConfig[plan.status];
              return (
                <TableRow key={plan.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: theme.palette.divider, px: 0.8, py: 0.3, borderRadius: 1 }}>
                      {plan.plan_number}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{plan.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{plan.current_version} · {plan.pages} págs.</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={500}>{attr?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{attr?.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{planTypeLabels[plan.type]}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sCfg.label}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.mode === 'dark' ? `${sCfg.color}22` : sCfg.bg,
                        color: sCfg.color,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={plan.revisions.length} icon={<History />} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(plan.updated_date), 'dd/MM/yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {(plan.file_size_kb / 1024).toFixed(1)} MB
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Visualizar">
                        <IconButton size="small" onClick={() => navigate(`/viewer/${plan.id}`)}>
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {hasPermission('upload_plans') && (
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEditPlan(plan)}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                      )}
                      {hasPermission('delete_plans') && (
                        <Tooltip title="Eliminar">
                          <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDelete(plan.id, plan.title)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <UploadDialog open={uploadOpen} attractions={attractions} onClose={() => setUploadOpen(false)} onUpload={handleUpload} />
      <Dialog open={Boolean(editingPlan)} onClose={() => setEditingPlan(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>Editar Plano</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Atraccion *</InputLabel>
                <Select value={editForm.attraction_id} label="Atraccion *" onChange={e => setEditForm(d => ({ ...d, attraction_id: e.target.value }))}>
                  {attractions.map(a => (
                    <MenuItem key={a.id} value={a.id}>{a.name} ({a.code})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Numero de plano *" value={editForm.plan_number} onChange={e => setEditForm(d => ({ ...d, plan_number: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado *</InputLabel>
                <Select value={editForm.status} label="Estado *" onChange={e => setEditForm(d => ({ ...d, status: e.target.value as PlanStatus }))}>
                  <MenuItem value="draft">Borrador</MenuItem>
                  <MenuItem value="review">En Revision</MenuItem>
                  <MenuItem value="approved">Aprobado</MenuItem>
                  <MenuItem value="obsolete">Obsoleto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Titulo *" value={editForm.title} onChange={e => setEditForm(d => ({ ...d, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de diagrama *</InputLabel>
                <Select value={editForm.type} label="Tipo de diagrama *" onChange={e => setEditForm(d => ({ ...d, type: e.target.value as PlanType }))}>
                  {Object.entries(planTypeLabels).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Descripcion" multiline rows={2} value={editForm.description} onChange={e => setEditForm(d => ({ ...d, description: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingPlan(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdatePlan} disabled={!editForm.attraction_id || !editForm.plan_number || !editForm.title}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlansManagementPage;
