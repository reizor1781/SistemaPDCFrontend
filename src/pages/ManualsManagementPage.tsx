import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, CloudUpload, Delete, Edit, FilterList, MenuBook, OpenInNew, PictureAsPdf, Upload } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Attraction, AttractionManual, ManualCategory, ManualStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const categoryLabels: Record<ManualCategory, string> = {
  operation: 'Operacion',
  maintenance: 'Mantenimiento',
};

const statusConfig: Record<ManualStatus, { label: string; color: 'success' | 'info' | 'default' | 'error' }> = {
  active: { label: 'Activo', color: 'success' },
  draft: { label: 'Borrador', color: 'default' },
  review: { label: 'En revision', color: 'info' },
  obsolete: { label: 'Obsoleto', color: 'error' },
};

interface UploadDialogProps {
  open: boolean;
  attractions: Attraction[];
  onClose: () => void;
  onUpload: (data: Partial<AttractionManual>, file: File) => Promise<void>;
}

const UploadDialog: React.FC<UploadDialogProps> = ({ open, attractions, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    attraction_id: '',
    manual_number: '',
    title: '',
    category: 'operation' as ManualCategory,
    description: '',
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

  const reset = () => {
    setFormData({ attraction_id: '', manual_number: '', title: '', category: 'operation', description: '' });
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file || !formData.attraction_id || !formData.title) return;
    setUploading(true);
    try {
      await onUpload(formData, file);
      reset();
      onClose();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>Cargar Nuevo Manual</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Atraccion *</InputLabel>
              <Select value={formData.attraction_id} label="Atraccion *" onChange={e => setFormData(d => ({ ...d, attraction_id: e.target.value }))}>
                {attractions.map(a => <MenuItem key={a.id} value={a.id}>{a.name} ({a.code})</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Numero de manual" placeholder="Ej: MR-MAN-001" value={formData.manual_number} onChange={e => setFormData(d => ({ ...d, manual_number: e.target.value }))} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria *</InputLabel>
              <Select value={formData.category} label="Categoria *" onChange={e => setFormData(d => ({ ...d, category: e.target.value as ManualCategory }))}>
                {Object.entries(categoryLabels).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Titulo *" value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="Descripcion" multiline rows={2} value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} />
          </Grid>
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
                    {isDragActive ? 'Suelta el PDF aqui...' : 'Arrastra un PDF aqui, o haz clic para seleccionar'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">Solo archivos PDF, max 50MB</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          {uploading && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">Cargando manual al servidor...</Typography>
              <LinearProgress sx={{ borderRadius: 2 }} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading}>Cancelar</Button>
        <Button variant="contained" startIcon={<CloudUpload />} onClick={handleSubmit} disabled={!file || !formData.attraction_id || !formData.title || uploading}>
          Cargar Manual
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ManualsManagementPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [manuals, setManuals] = useState<AttractionManual[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAttraction, setFilterAttraction] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingManual, setEditingManual] = useState<AttractionManual | null>(null);
  const [editForm, setEditForm] = useState({
    attraction_id: '',
    manual_number: '',
    title: '',
    category: 'technical' as ManualCategory,
    status: 'active' as ManualStatus,
    description: '',
  });

  useEffect(() => {
    Promise.all([api.getManuals(), api.getAttractions()])
      .then(([loadedManuals, loadedAttractions]) => {
        setManuals(loadedManuals);
        setAttractions(loadedAttractions);
      })
      .catch(() => setErrorMsg('No se pudo cargar informacion desde el servidor.'));
  }, []);

  const filtered = manuals.filter(manual => {
    const matchCategory = !filterCategory || manual.category === filterCategory;
    const matchStatus = !filterStatus || manual.status === filterStatus;
    const matchAttraction = !filterAttraction || manual.attraction_id === filterAttraction;
    return matchCategory && matchStatus && matchAttraction;
  });

  const handleUpload = async (data: Partial<AttractionManual>, file: File) => {
    setErrorMsg('');
    try {
      const newManual = await api.uploadManual(data, file);
      setManuals(prev => [newManual, ...prev]);
      setSuccessMsg(`Manual "${newManual.title}" cargado exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo cargar el manual.');
      throw err;
    }
  };

  const openEditManual = (manual: AttractionManual) => {
    setEditingManual(manual);
    setEditForm({
      attraction_id: manual.attraction_id,
      manual_number: manual.manual_number,
      title: manual.title,
      category: manual.category,
      status: manual.status,
      description: manual.description,
    });
  };

  const handleUpdateManual = async () => {
    if (!editingManual || !editForm.attraction_id || !editForm.title || !editForm.manual_number) return;
    setErrorMsg('');
    try {
      const saved = await api.updateManual(editingManual.id, editForm);
      setManuals(prev => prev.map(manual => manual.id === saved.id ? saved : manual));
      setEditingManual(null);
      setSuccessMsg(`Manual "${saved.title}" actualizado exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo actualizar el manual.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Eliminar el manual "${title}"?`)) return;
    try {
      setErrorMsg('');
      await api.deleteManual(id);
      setManuals(prev => prev.filter(manual => manual.id !== id));
      setSuccessMsg(`Manual "${title}" eliminado exitosamente.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar el manual.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>Gestion de Manuales</Typography>
          <Typography variant="body2" color="text.secondary">
            {manuals.length} manuales registrados - {filtered.length} mostrando
          </Typography>
        </Box>
        {hasPermission('manage_manuals') && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>
            Nuevo Manual
          </Button>
        )}
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(statusConfig).map(([status, cfg]) => {
          const count = manuals.filter(manual => manual.status === status).length;
          return (
            <Grid key={status} item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: filterStatus === status ? 'action.selected' : 'transparent',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              >
                <Typography variant="h4" fontWeight={800}>{count}</Typography>
                <Typography variant="caption" color="text.secondary">{cfg.label}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FilterList sx={{ color: 'text.secondary' }} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Atraccion</InputLabel>
          <Select value={filterAttraction} onChange={e => setFilterAttraction(e.target.value)} label="Atraccion">
            <MenuItem value="">Todas</MenuItem>
            {attractions.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Categoria</InputLabel>
          <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} label="Categoria">
            <MenuItem value="">Todas</MenuItem>
            {Object.entries(categoryLabels).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
          </Select>
        </FormControl>
        <Button size="small" onClick={() => { setFilterCategory(''); setFilterStatus(''); setFilterAttraction(''); }}>
          Limpiar filtros
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            <TableRow>
              {['N Manual', 'Titulo', 'Atraccion', 'Categoria', 'Estado', 'Actualizado', 'Tamano', ''].map(header => (
                <TableCell key={header}><Typography variant="caption" fontWeight={700}>{header}</Typography></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(manual => {
              const attraction = attractions.find(item => item.id === manual.attraction_id);
              const status = statusConfig[manual.status];
              return (
                <TableRow key={manual.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: theme.palette.divider, px: 0.8, py: 0.3, borderRadius: 1 }}>
                      {manual.manual_number}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{manual.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{manual.current_version} - {manual.pages} pags.</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight={500}>{attraction?.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{attraction?.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip icon={<MenuBook />} label={categoryLabels[manual.category]} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{format(new Date(manual.updated_date), 'dd/MM/yyyy')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{(manual.file_size_kb / 1024).toFixed(1)} MB</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Visualizar">
                        <IconButton size="small" onClick={() => navigate(`/manual-viewer/${manual.id}`)}>
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {hasPermission('manage_manuals') && (
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => openEditManual(manual)}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                      )}
                      {hasPermission('manage_manuals') && (
                        <Tooltip title="Eliminar">
                          <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDelete(manual.id, manual.title)}>
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

      <Dialog open={Boolean(editingManual)} onClose={() => setEditingManual(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>Editar Manual</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Atraccion *</InputLabel>
                <Select value={editForm.attraction_id} label="Atraccion *" onChange={e => setEditForm(d => ({ ...d, attraction_id: e.target.value }))}>
                  {attractions.map(a => <MenuItem key={a.id} value={a.id}>{a.name} ({a.code})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Numero de manual *" value={editForm.manual_number} onChange={e => setEditForm(d => ({ ...d, manual_number: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado *</InputLabel>
                <Select value={editForm.status} label="Estado *" onChange={e => setEditForm(d => ({ ...d, status: e.target.value as ManualStatus }))}>
                  {Object.entries(statusConfig).map(([key, cfg]) => <MenuItem key={key} value={key}>{cfg.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Titulo *" value={editForm.title} onChange={e => setEditForm(d => ({ ...d, title: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria *</InputLabel>
                <Select value={editForm.category} label="Categoria *" onChange={e => setEditForm(d => ({ ...d, category: e.target.value as ManualCategory }))}>
                  {Object.entries(categoryLabels).map(([key, label]) => <MenuItem key={key} value={key}>{label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Descripcion" multiline rows={2} value={editForm.description} onChange={e => setEditForm(d => ({ ...d, description: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingManual(null)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateManual} disabled={!editForm.attraction_id || !editForm.manual_number || !editForm.title}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualsManagementPage;
