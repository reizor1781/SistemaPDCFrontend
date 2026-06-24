import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Search,
  Attractions,
  PictureAsPdf,
  ElectricBolt,
  Memory,
  Speed,
  Sensors,
  Build,
  FactoryRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Attraction, ElectricalPlan } from '../types';
import { api } from '../services/api';

type SearchCategory = 'all' | 'attractions' | 'plans' | 'components';

interface SearchResult {
  id: string;
  type: 'attraction' | 'plan' | 'motor' | 'vfd' | 'plc' | 'sensor';
  title: string;
  subtitle: string;
  highlight: string;
  navigationPath: string;
  icon: React.ReactNode;
  category: string;
}

const SearchPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<SearchCategory>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [plans, setPlans] = useState<ElectricalPlan[]>([]);

  useEffect(() => {
    setIsSearching(true);
    Promise.all([api.getAttractions(), api.getPlans()])
      .then(([loadedAttractions, loadedPlans]) => {
        setAttractions(loadedAttractions);
        setPlans(loadedPlans);
      })
      .finally(() => setIsSearching(false));
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    // Search attractions
    attractions.forEach(a => {
      if (
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.area.toLowerCase().includes(q) ||
        a.technical_specs.manufacturer.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      ) {
        found.push({
          id: a.id,
          type: 'attraction',
          title: a.name,
          subtitle: `${a.area} · ${a.code} · ${a.technical_specs.manufacturer}`,
          highlight: `${a.technical_specs.installed_power_kw} kW · ${a.technical_specs.motors.length} motores · ${a.total_plans} planos`,
          navigationPath: `/documentation/${a.id}`,
          icon: <Attractions />,
          category: 'Atracciones',
        });
      }

      // Search motors
      a.technical_specs.motors.forEach(m => {
        if (m.tag.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
          found.push({
            id: m.id,
            type: 'motor',
            title: m.tag,
            subtitle: m.description,
            highlight: `${a.name} · ${m.power_kw}kW / ${m.voltage_v}V / ${m.rpm}rpm`,
            navigationPath: `/documentation/${a.id}`,
            icon: <ElectricBolt />,
            category: 'Motores',
          });
        }
      });

      // Search VFDs
      a.technical_specs.vfds.forEach(v => {
        if (v.tag.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)) {
          found.push({
            id: v.id,
            type: 'vfd',
            title: v.tag,
            subtitle: `${v.brand} ${v.model}`,
            highlight: `${a.name} · ${v.power_kw}kW · Motor: ${v.associated_motor}`,
            navigationPath: `/documentation/${a.id}`,
            icon: <Speed />,
            category: 'Variadores',
          });
        }
      });

      // Search PLCs
      a.technical_specs.plcs.forEach(p => {
        if (p.tag.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q)) {
          found.push({
            id: p.id,
            type: 'plc',
            title: p.tag,
            subtitle: `${p.brand} ${p.model}`,
            highlight: `${a.name} · DI:${p.io_digital_in} DO:${p.io_digital_out} · ${p.program_version}`,
            navigationPath: `/documentation/${a.id}`,
            icon: <Memory />,
            category: 'PLCs',
          });
        }
      });

      // Search sensors
      a.technical_specs.sensors.forEach(s => {
        if (s.tag.toLowerCase().includes(q) || s.type.toLowerCase().includes(q) || s.brand.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)) {
          found.push({
            id: s.id,
            type: 'sensor',
            title: s.tag,
            subtitle: s.type,
            highlight: `${a.name} · ${s.brand} ${s.model} · ${s.location}`,
            navigationPath: `/documentation/${a.id}`,
            icon: <Sensors />,
            category: 'Sensores',
          });
        }
      });
    });

    // Search plans
    plans.forEach(p => {
      const attr = attractions.find(a => a.id === p.attraction_id);
      if (
        p.plan_number.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        (p.author && p.author.toLowerCase().includes(q))
      ) {
        found.push({
          id: p.id,
          type: 'plan',
          title: p.plan_number,
          subtitle: p.title,
          highlight: `${attr?.name || ''} · ${p.current_version} · ${p.pages} páginas`,
          navigationPath: `/viewer/${p.id}`,
          icon: <PictureAsPdf />,
          category: 'Planos',
        });
      }
    });

    return found;
  }, [attractions, plans, query]);

  const filteredResults = useMemo(() => {
    if (tab === 'all') return results;
    if (tab === 'attractions') return results.filter(r => r.type === 'attraction');
    if (tab === 'plans') return results.filter(r => r.type === 'plan');
    if (tab === 'components') return results.filter(r => ['motor', 'vfd', 'plc', 'sensor'].includes(r.type));
    return results;
  }, [results, tab]);

  const categoryCounts = {
    all: results.length,
    attractions: results.filter(r => r.type === 'attraction').length,
    plans: results.filter(r => r.type === 'plan').length,
    components: results.filter(r => ['motor', 'vfd', 'plc', 'sensor'].includes(r.type)).length,
  };

  const typeColors: Record<string, string> = {
    attraction: '#3d7a35',
    plan: '#f44336',
    motor: '#f5c518',
    vfd: '#3d7a35',
    plc: '#0288d1',
    sensor: '#ed6c02',
  };

  const highlightText = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <Box key={i} component="mark" sx={{ bgcolor: '#f5c51833', color: '#b8920e', px: 0.3, borderRadius: 0.5, fontWeight: 700 }}>
          {part}
        </Box>
      ) : part
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Búsqueda Inteligente</Typography>
        <Typography variant="body2" color="text.secondary">
          Busca atracciones, planos, motores, variadores, PLCs, sensores y más
        </Typography>
      </Box>

      {/* Search input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Ej: Montaña Rusa, MTR-MR-01, ABB, VFD-TF-01, diagrama unifilar..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            fontSize: '1.1rem',
            borderRadius: 3,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 28, color: 'primary.main' }} />
            </InputAdornment>
          ),
          endAdornment: isSearching ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : query && (
            <InputAdornment position="end">
              <Chip label={`${results.length} resultados`} size="small" color="primary" />
            </InputAdornment>
          ),
        }}
      />

      {/* Quick search suggestions */}
      {!query && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Búsquedas frecuentes:</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['Montaña Rusa', 'ABB', 'Siemens', 'PLC-MR-01', 'unifilar', 'variador', 'bomba', 'S7-1500', 'MTR-TF-01'].map(s => (
              <Chip
                key={s}
                label={s}
                onClick={() => setQuery(s)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Results */}
      {query.length >= 2 && (
        <>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label={`Todo (${categoryCounts.all})`} value="all" />
            <Tab label={`Atracciones (${categoryCounts.attractions})`} value="attractions" />
            <Tab label={`Planos (${categoryCounts.plans})`} value="plans" />
            <Tab label={`Componentes (${categoryCounts.components})`} value="components" />
          </Tabs>

          {filteredResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Search sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No se encontraron resultados para "{query}"</Typography>
              <Typography variant="body2" color="text.disabled">Intenta con otros términos de búsqueda</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filteredResults.map((result, i) => (
                <React.Fragment key={result.id + '-' + i}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      borderRadius: 2,
                      cursor: 'pointer',
                      mb: 0.5,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        transform: 'translateX(4px)',
                      },
                    }}
                    onClick={() => navigate(result.navigationPath)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${typeColors[result.type]}18`,
                          color: typeColors[result.type],
                        }}
                      >
                        {result.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {highlightText(result.title)}
                          </Typography>
                          <Chip
                            label={result.category}
                            size="small"
                            sx={{
                              bgcolor: `${typeColors[result.type]}18`,
                              color: typeColors[result.type],
                              fontSize: '0.6rem',
                              height: 18,
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {highlightText(result.subtitle)}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {result.highlight}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {i < filteredResults.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </>
      )}

      {/* Empty state */}
      {!query && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 4,
          }}
        >
          <Search sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Escribe para comenzar la búsqueda
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Busca por nombre de atracción, número de plano, TAG de componente,
            fabricante, o cualquier término técnico
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;
