import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Tab,
  Tabs,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Badge,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  ElectricBolt,
  Memory,
  Speed,
  Sensors,
  PictureAsPdf,
  MenuBook,
  Build,
  CheckCircle,
  Warning,
  Info,
  Add,
  SendRounded,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Attraction, AttractionManual, AttractionStatus, ElectricalPlan, MaintenanceRecord, PlanType, MaintenanceType, MaintenanceStatus, ManualCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const statusConfig: Record<AttractionStatus, { color: 'success' | 'warning' | 'info' | 'default'; label: string }> = {
  operational: { color: 'success', label: 'Operacional' },
  maintenance: { color: 'warning', label: 'En Mantenimiento' },
  inspection: { color: 'info', label: 'En Inspección' },
  inactive: { color: 'default', label: 'Inactivo' },
};

const planTypeLabels: Record<PlanType, string> = {
  power_diagram: 'Diagrama de Potencia',
  control_diagram: 'Diagrama de Control',
  single_line: 'Diagrama Unifilar',
  plc_diagram: 'Diagrama PLC',
  communication: 'Comunicaciones',
  grounding: 'Puesta a Tierra',
  lighting: 'Iluminación',
  mechanical: 'Mecánico',
  hydraulic: 'Hidráulico',
  pneumatic: 'Neumático',
};

const planStatusColors: Record<string, string> = {
  approved: '#2e7d32',
  draft: '#757575',
  review: '#0288d1',
  obsolete: '#f44336',
};

const manualCategoryLabels: Record<ManualCategory, string> = {
  operation: 'Operacion',
  maintenance: 'Mantenimiento',
};

const mntTypeLabels: Record<MaintenanceType, string> = {
  preventive: 'Preventivo',
  corrective: 'Correctivo',
  predictive: 'Predictivo',
  inspection: 'Inspección',
};

const mntStatusLabels: Record<MaintenanceStatus, { color: 'success' | 'warning' | 'info' | 'error'; label: string }> = {
  completed: { color: 'success', label: 'Completado' },
  in_progress: { color: 'warning', label: 'En Progreso' },
  scheduled: { color: 'info', label: 'Programado' },
  cancelled: { color: 'error', label: 'Cancelado' },
};

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const DocumentationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { hasPermission } = useAuth();
  const [tab, setTab] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [plans, setPlans] = useState<ElectricalPlan[]>([]);
  const [manuals, setManuals] = useState<AttractionManual[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getAttraction(id), api.getPlans(id), api.getManuals(id), api.getMaintenance(id)])
      .then(([loadedAttraction, loadedPlans, loadedManuals, loadedMaintenance]) => {
        setAttraction(loadedAttraction);
        setPlans(loadedPlans);
        setManuals(loadedManuals);
        setMaintenance(loadedMaintenance);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'No se pudo cargar la documentacion'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!attraction) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography>Atracción no encontrada.</Typography>
        <Button onClick={() => navigate('/attractions')}>Volver</Button>
      </Box>
    );
  }

  const { technical_specs: ts } = attraction;
  const sCfg = statusConfig[attraction.status];

  const InfoRow: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}{unit ? ` ${unit}` : ''}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/attractions')} sx={{ mt: 0.5 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={800}>{attraction.name}</Typography>
            <Chip label={attraction.code} size="small" sx={{ bgcolor: theme.palette.divider, fontFamily: 'monospace' }} />
            <Chip label={sCfg.label} color={sCfg.color} size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {attraction.area} · {ts.manufacturer} {ts.model} · Instalado: {ts.year_installed}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasPermission('upload_plans') && (
            <Button variant="outlined" startIcon={<Add />} size="small" onClick={() => navigate('/plans')}>
              Nuevo Plano
            </Button>
          )}
          {hasPermission('upload_plans') && (
            <Button variant="outlined" startIcon={<Add />} size="small" onClick={() => navigate('/manuals')}>
              Nuevo Manual
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Información General" />
          <Tab label={<Badge badgeContent={plans.length} color="primary">Planos Eléctricos</Badge>} />
          <Tab label={<Badge badgeContent={manuals.length} color="info">Manuales</Badge>} />
          <Tab label="Componentes Eléctricos" />
          <Tab label={<Badge badgeContent={maintenance.length} color="warning">Mantenimiento</Badge>} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab 0 - General Info */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Datos Generales</Typography>
                <InfoRow label="Fabricante" value={ts.manufacturer} />
                <InfoRow label="Modelo" value={ts.model} />
                <InfoRow label="Año de instalación" value={ts.year_installed} />
                <InfoRow label="Capacidad" value={attraction.capacity} unit="personas" />
                <InfoRow label="Altura" value={attraction.height_m} unit="m" />
                <InfoRow label="Duración ciclo" value={attraction.duration_min} unit="min" />
                <InfoRow label="Certificaciones" value={ts.certifications.join(', ')} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Parámetros Eléctricos</Typography>
                <InfoRow label="Potencia instalada" value={ts.installed_power_kw} unit="kW" />
                <InfoRow label="Voltaje de operación" value={ts.operating_voltage_v.join(' / ')} unit="V" />
                <InfoRow label="Voltaje de control" value={ts.control_voltage_v} unit="V DC" />
                <InfoRow label="Frecuencia" value={ts.frequency_hz} unit="Hz" />
                <InfoRow label="Protección IP" value={ts.protection_ip} />
                <InfoRow label="Total motores" value={ts.motors.length} />
                <InfoRow label="Total variadores" value={ts.vfds.length} />
                <InfoRow label="Total PLCs" value={ts.plcs.length} />
                <InfoRow label="Total sensores" value={ts.sensors.length} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Descripción</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {attraction.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Último mantenimiento</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {format(new Date(attraction.last_maintenance), "d 'de' MMMM, yyyy", { locale: es })}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'warning.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Próximo mantenimiento</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {format(new Date(attraction.next_maintenance), "d 'de' MMMM, yyyy", { locale: es })}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1 - Plans */}
          <TabPanel value={tab} index={1}>
            {plans.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PictureAsPdf sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No hay planos registrados para esta atracción.</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="caption" fontWeight={700}>N° Plano</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Título</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Tipo</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Versión</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Estado</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Actualizado</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Páginas</Typography></TableCell>
                    <TableCell align="center"><Typography variant="caption" fontWeight={700}>Acción</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map(plan => (
                    <TableRow key={plan.id} hover>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: theme.palette.divider, px: 0.8, py: 0.3, borderRadius: 1 }}>
                          {plan.plan_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{plan.title}</Typography>
                        {plan.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            {plan.tags.slice(0, 3).map(tag => (
                              <Chip key={tag} label={tag} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{planTypeLabels[plan.type]}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{plan.current_version}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={plan.status === 'approved' ? 'Aprobado' : plan.status === 'review' ? 'Revisión' : plan.status === 'draft' ? 'Borrador' : 'Obsoleto'}
                          size="small"
                          sx={{
                            bgcolor: `${planStatusColors[plan.status]}18`,
                            color: planStatusColors[plan.status],
                            fontWeight: 600,
                            fontSize: '0.65rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(plan.updated_date), 'dd/MM/yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{plan.pages} págs.</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PictureAsPdf />}
                          onClick={() => navigate(`/viewer/${plan.id}`)}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Abrir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabPanel>

          {/* Tab 2 - Manuals */}
          <TabPanel value={tab} index={2}>
            {manuals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MenuBook sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No hay manuales registrados para esta atraccion.</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="caption" fontWeight={700}>N Manual</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Título</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Categoria</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Version</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Estado</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Actualizado</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontWeight={700}>Paginas</Typography></TableCell>
                    <TableCell align="center"><Typography variant="caption" fontWeight={700}>Acción</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {manuals.map(manual => (
                    <TableRow key={manual.id} hover>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: theme.palette.divider, px: 0.8, py: 0.3, borderRadius: 1 }}>
                          {manual.manual_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{manual.title}</Typography>
                        {manual.description && (
                          <Typography variant="caption" color="text.secondary">{manual.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{manualCategoryLabels[manual.category]}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{manual.current_version}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={manual.status === 'active' ? 'Activo' : manual.status === 'review' ? 'Revision' : manual.status === 'draft' ? 'Borrador' : 'Obsoleto'}
                          size="small"
                          color={manual.status === 'active' ? 'success' : manual.status === 'obsolete' ? 'error' : 'default'}
                          sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(manual.updated_date), 'dd/MM/yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{manual.pages} pags.</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PictureAsPdf />}
                          onClick={() => navigate(`/manual-viewer/${manual.id}`)}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Abrir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabPanel>

          {/* Tab 3 - Electrical Components */}
          <TabPanel value={tab} index={3}>
            <Grid container spacing={3}>
              {/* Motors */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ElectricBolt sx={{ color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight={700}>Motores ({ts.motors.length})</Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['TAG', 'Descripción', 'Potencia (kW)', 'Voltaje (V)', 'Corriente (A)', 'RPM', 'Fases'].map(h => (
                        <TableCell key={h}><Typography variant="caption" fontWeight={700}>{h}</Typography></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ts.motors.map(m => (
                      <TableRow key={m.id} hover>
                        <TableCell><Chip label={m.tag} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: '#f5c51822', color: '#b8920e' }} /></TableCell>
                        <TableCell><Typography variant="caption">{m.description}</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight={700}>{m.power_kw}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{m.voltage_v}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{m.current_a}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{m.rpm}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{m.phase}φ</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>

              {/* VFDs */}
              {ts.vfds.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Speed sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={700}>Variadores de Velocidad ({ts.vfds.length})</Typography>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['TAG', 'Marca', 'Modelo', 'Potencia (kW)', 'Motor asociado'].map(h => (
                          <TableCell key={h}><Typography variant="caption" fontWeight={700}>{h}</Typography></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ts.vfds.map(v => (
                        <TableRow key={v.id} hover>
                          <TableCell><Chip label={v.tag} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: '#3d7a3522', color: '#3d7a35' }} /></TableCell>
                          <TableCell><Typography variant="caption" fontWeight={600}>{v.brand}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{v.model}</Typography></TableCell>
                          <TableCell><Typography variant="caption" fontWeight={700}>{v.power_kw}</Typography></TableCell>
                          <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{v.associated_motor}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}

              {/* PLCs */}
              {ts.plcs.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Memory sx={{ color: 'info.main' }} />
                    <Typography variant="h6" fontWeight={700}>PLCs ({ts.plcs.length})</Typography>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['TAG', 'Marca', 'Modelo', 'DI', 'DO', 'AI', 'AO', 'Versión Prog.'].map(h => (
                          <TableCell key={h}><Typography variant="caption" fontWeight={700}>{h}</Typography></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ts.plcs.map(p => (
                        <TableRow key={p.id} hover>
                          <TableCell><Chip label={p.tag} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: '#0288d122', color: '#0288d1' }} /></TableCell>
                          <TableCell><Typography variant="caption" fontWeight={600}>{p.brand}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{p.model}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{p.io_digital_in}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{p.io_digital_out}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{p.io_analog_in}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{p.io_analog_out}</Typography></TableCell>
                          <TableCell><Chip label={p.program_version} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}

              {/* Sensors */}
              {ts.sensors.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Sensors sx={{ color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight={700}>Sensores ({ts.sensors.length})</Typography>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['TAG', 'Tipo', 'Marca', 'Modelo', 'Ubicación'].map(h => (
                          <TableCell key={h}><Typography variant="caption" fontWeight={700}>{h}</Typography></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ts.sensors.map(s => (
                        <TableRow key={s.id} hover>
                          <TableCell><Chip label={s.tag} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', bgcolor: '#ed6c0222', color: '#ed6c02' }} /></TableCell>
                          <TableCell><Typography variant="caption">{s.type}</Typography></TableCell>
                          <TableCell><Typography variant="caption" fontWeight={600}>{s.brand}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{s.model}</Typography></TableCell>
                          <TableCell><Typography variant="caption">{s.location}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              )}
            </Grid>
          </TabPanel>

           <TabPanel value={tab} index={4}>
            {maintenance.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Build sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No hay registros de mantenimiento.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {maintenance.map(mnt => {
                  const mntSt = mntStatusLabels[mnt.status];
                  return (
                    <Paper key={mnt.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={mntTypeLabels[mnt.type]} size="small" variant="outlined" />
                          <Chip label={mntSt.label} color={mntSt.color} size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(mnt.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>{mnt.description}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        👤 Técnico: <strong>{mnt.technician}</strong> · ⏱ {mnt.duration_hours}h
                      </Typography>
                      {mnt.parts_replaced && mnt.parts_replaced.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">Repuestos: </Typography>
                          {mnt.parts_replaced.map(p => <Chip key={p} label={p} size="small" sx={{ ml: 0.5, fontSize: '0.65rem', height: 18 }} />)}
                        </Box>
                      )}
                      {mnt.observations && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary"><Info sx={{ fontSize: 12 }} /> {mnt.observations}</Typography>
                        </Box>
                      )}
                      {mnt.next_action && (
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: '#ed6c0210', borderRadius: 1, border: '1px solid #ed6c0240' }}>
                          <Typography variant="caption" sx={{ color: 'warning.main' }}>→ {mnt.next_action}</Typography>
                        </Box>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            )}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default DocumentationPage;

