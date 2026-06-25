import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  useTheme,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Attractions,
  PictureAsPdf,
  PendingActions,
  CheckCircle,
  Build,
  TrendingUp,
  Upload,
  Comment,
  Engineering,
  MoreTime,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { Attraction, AttractionStatus, DashboardStats, ElectricalPlan } from '../types';
import { api } from '../services/api';

const statusConfig: Record<AttractionStatus, { color: string; label: string; bg: string }> = {
  operational: { color: '#2e7d32', label: 'Operacional', bg: '#e8f5e9' },
  maintenance: { color: '#ed6c02', label: 'Mantenimiento', bg: '#fff3e0' },
  inspection: { color: '#0288d1', label: 'Inspección', bg: '#e3f2fd' },
  inactive: { color: '#757575', label: 'Inactivo', bg: '#f5f5f5' },
};

const CHART_COLORS = ['#3d7a35', '#f5c518', '#8b6914', '#4a9640', '#b8920e', '#2d5a27'];

const updateIcons: Record<string, React.ReactNode> = {
  plan_upload: <Upload sx={{ fontSize: 18 }} />,
  plan_update: <PictureAsPdf sx={{ fontSize: 18 }} />,
  maintenance: <Build sx={{ fontSize: 18 }} />,
  comment: <Comment sx={{ fontSize: 18 }} />,
};

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
}> = ({ title, value, icon, color, subtitle, trend }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${color}22`,
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.06 }}>
        <Box sx={{ fontSize: 80, color }}>{icon}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}18`,
            color,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
          <TrendingUp sx={{ fontSize: 14, color: trend >= 0 ? 'success.main' : 'error.main' }} />
          <Typography variant="caption" color={trend >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
            {trend >= 0 ? '+' : ''}{trend}% este mes
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const isDark = theme.palette.mode === 'dark';
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [plans, setPlans] = useState<ElectricalPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getAttractions(), api.getPlans()])
      .then(([loadedAttractions, loadedPlans]) => {
        setAttractions(loadedAttractions);
        setPlans(loadedPlans);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    const pendingDocs = attractions.reduce((sum, attraction) => sum + attraction.pending_docs, 0);
    const operational = attractions.filter(attraction => attraction.status === 'operational').length;
    const inMaintenance = attractions.filter(attraction => attraction.status === 'maintenance').length;
    const planTypeCounts = plans.reduce<Record<string, number>>((acc, plan) => {
      acc[plan.type] = (acc[plan.type] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total_attractions: attractions.length,
      total_plans: plans.length,
      pending_docs: pendingDocs,
      operational,
      in_maintenance: inMaintenance,
      recent_updates: plans.slice(0, 5).map(plan => ({
        id: plan.id,
        type: 'plan_update',
        attraction_name: attractions.find(attraction => attraction.id === plan.attraction_id)?.name ?? 'Atraccion',
        description: `${plan.plan_number} actualizado`,
        user: plan.author,
        date: plan.updated_date,
      })),
      plans_by_type: Object.entries(planTypeCounts).map(([type, count]) => ({ type, count })),
      status_distribution: [
        { status: 'Operacional', count: operational },
        { status: 'Mantenimiento', count: inMaintenance },
        { status: 'Inspeccion', count: attractions.filter(attraction => attraction.status === 'inspection').length },
        { status: 'Inactivo', count: attractions.filter(attraction => attraction.status === 'inactive').length },
      ],
    };
  }, [attractions, plans]);

  const recentAttractions = attractions.slice(0, 4);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Panel de Control
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido, <strong>{user?.name}</strong> · {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Atracciones"
            value={stats.total_attractions}
            icon={<Attractions />}
            color="#3d7a35"
            subtitle="Registradas en el sistema"
            trend={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Planos Disponibles"
            value={stats.total_plans}
            icon={<PictureAsPdf />}
            color="#f5c518"
            subtitle="Documentos técnicos"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Documentación Pendiente"
            value={stats.pending_docs}
            icon={<PendingActions />}
            color="#ed6c02"
            subtitle="Planos por cargar"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Operacionales"
            value={stats.operational}
            icon={<CheckCircle />}
            color="#2e7d32"
            subtitle={`${stats.in_maintenance} en mantenimiento`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Status overview */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Estado de Atracciones
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Resumen operativo de todas las atracciones del parque
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentAttractions.map(attr => {
                const statusCfg = statusConfig[attr.status];
                const totalExpected = attr.total_plans + (attr.total_manuals || 0);
                const uploadedDocs = totalExpected - attr.pending_docs;
                const docPercent = totalExpected > 0
                  ? Math.max(0, Math.min(100, Math.round((uploadedDocs / totalExpected) * 100)))
                  : 0;
                return (
                  <Box
                    key={attr.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{attr.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{attr.area} · {attr.code}</Typography>
                      </Box>
                      <Chip
                        label={statusCfg.label}
                        size="small"
                        sx={{
                          bgcolor: isDark ? `${statusCfg.color}22` : statusCfg.bg,
                          color: statusCfg.color,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={docPercent}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: theme.palette.divider,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: docPercent === 100 ? '#2e7d32' : '#f5c518',
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                        {docPercent}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {uploadedDocs}/{totalExpected} documentos
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Planos por Tipo
            </Typography>
            <Box sx={{ height: 180, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.plans_by_type.filter(p => p.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {stats.plans_by_type.filter(p => p.count > 0).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Planos']}
                    contentStyle={{
                      borderRadius: 8,
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 1 }}>
              {stats.plans_by_type.filter(p => p.count > 0).map((item, i) => (
                <Box key={item.type} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <Typography variant="caption">{item.type}</Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>{item.count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Actividad Reciente
            </Typography>
            <List disablePadding>
              {stats.recent_updates.map((update, i) => (
                <React.Fragment key={update.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${CHART_COLORS[i % CHART_COLORS.length]}22`,
                          color: CHART_COLORS[i % CHART_COLORS.length],
                          width: 36,
                          height: 36,
                        }}
                      >
                        {updateIcons[update.type]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {update.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(update.date), { addSuffix: true, locale: es })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          <strong>{update.attraction_name}</strong> · por {update.user}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {i < stats.recent_updates.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
