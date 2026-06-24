import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  Button,
  Chip,
  Divider,
  useTheme,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  FitScreen,
  Download,
  Print,
  Fullscreen,
  FullscreenExit,
  NavigateBefore,
  NavigateNext,
  Search,
  ViewSidebar,
  PictureAsPdf,
  FirstPage,
  LastPage,
  Comment,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Attraction, ElectricalPlan, Comment as CommentType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { api, resolveFileUrl } from '../services/api';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PlanViewerPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, hasPermission } = useAuth();

  const [plan, setPlan] = useState<ElectricalPlan | null>(null);
  const [attraction, setAttraction] = useState<Attraction | null>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    setError(false);
    api.getPlan(planId)
      .then(async loadedPlan => {
        setPlan(loadedPlan);
        setComments(loadedPlan.comments || []);
        const loadedAttraction = await api.getAttraction(loadedPlan.attraction_id);
        setAttraction(loadedAttraction);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [planId]);

  const pdfUrl = resolveFileUrl(plan?.file_url || '/sample-plans/sample.pdf');

  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = () => {
    setLoading(false);
    setError(true);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 25));
  const handleFitWidth = () => setZoom(100);
  const handleRotateLeft = () => setRotation(r => (r - 90 + 360) % 360);
  const handleRotateRight = () => setRotation(r => (r + 90) % 360);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !planId) return;
    try {
      const updatedPlan = await api.addComment(planId, newComment, currentPage);
      setComments(updatedPlan.comments || []);
      setNewComment('');
    } catch (err) {
      console.error('Error al agregar comentario:', err);
    }
  };

  const SIDEBAR_WIDTH = 280;

  // Toolbar component
  const Toolbar = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 2,
        py: 1,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
      }}
    >
      <Tooltip title="Volver"><IconButton size="small" onClick={() => navigate(-1)}><ArrowBack /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Panel lateral"><IconButton size="small" onClick={() => setSidebarOpen(!sidebarOpen)}><ViewSidebar /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Page Navigation */}
      <Tooltip title="Primera página"><IconButton size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}><FirstPage /></IconButton></Tooltip>
      <Tooltip title="Página anterior"><IconButton size="small" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><NavigateBefore /></IconButton></Tooltip>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TextField
          size="small"
          value={currentPage}
          onChange={e => {
            const v = parseInt(e.target.value);
            if (!isNaN(v) && v >= 1 && v <= numPages) setCurrentPage(v);
          }}
          sx={{ width: 52, '& input': { textAlign: 'center', py: 0.5, px: 0.5, fontSize: '0.8rem' } }}
        />
        <Typography variant="caption" color="text.secondary">/ {numPages}</Typography>
      </Box>
      <Tooltip title="Página siguiente"><IconButton size="small" disabled={currentPage === numPages} onClick={() => setCurrentPage(p => p + 1)}><NavigateNext /></IconButton></Tooltip>
      <Tooltip title="Última página"><IconButton size="small" disabled={currentPage === numPages} onClick={() => setCurrentPage(numPages)}><LastPage /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Zoom */}
      <Tooltip title="Reducir"><IconButton size="small" onClick={handleZoomOut}><ZoomOut /></IconButton></Tooltip>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 120 }}>
        <Slider
          value={zoom}
          onChange={(_, v) => setZoom(v as number)}
          min={25}
          max={300}
          step={25}
          sx={{ width: 80 }}
          size="small"
        />
        <Typography variant="caption" sx={{ minWidth: 35 }}>{zoom}%</Typography>
      </Box>
      <Tooltip title="Ampliar"><IconButton size="small" onClick={handleZoomIn}><ZoomIn /></IconButton></Tooltip>
      <Tooltip title="Ajustar al ancho"><IconButton size="small" onClick={handleFitWidth}><FitScreen /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Rotation */}
      <Tooltip title="Rotar izquierda"><IconButton size="small" onClick={handleRotateLeft}><RotateLeft /></IconButton></Tooltip>
      <Tooltip title="Rotar derecha"><IconButton size="small" onClick={handleRotateRight}><RotateRight /></IconButton></Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Actions */}
      <Tooltip title="Descargar PDF">
        <IconButton size="small" component="a" href={pdfUrl} download>
          <Download />
        </IconButton>
      </Tooltip>
      <Tooltip title="Imprimir">
        <IconButton size="small" onClick={() => window.print()}>
          <Print />
        </IconButton>
      </Tooltip>
      <Tooltip title={isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}>
        <IconButton size="small" onClick={handleFullscreen}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box
      ref={containerRef}
      sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}
    >
      {/* Plan info header */}
      {plan && (
        <Box
          sx={{
            px: 2, py: 1,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <PictureAsPdf sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {plan.title}
          </Typography>
          <Chip label={plan.plan_number} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Chip label={plan.current_version} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }} />
          {attraction && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {attraction.name}
            </Typography>
          )}
        </Box>
      )}

      <Toolbar />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Plan info */}
            {plan && (
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Información del Plano</Typography>
                {[
                  { label: 'N° Plano', value: plan.plan_number },
                  { label: 'Autor', value: plan.author },
                  { label: 'Versión', value: plan.current_version },
                  { label: 'Actualizado', value: format(new Date(plan.updated_date), 'dd/MM/yyyy') },
                  { label: 'Páginas', value: `${numPages} págs.` },
                  { label: 'Tamaño', value: `${(plan.file_size_kb / 1024).toFixed(1)} MB` },
                ].map(row => (
                  <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                    <Typography variant="caption" fontWeight={600}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Comments section */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Comment sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Comentarios ({comments.length})
                </Typography>
              </Box>
              {comments.length === 0 && (
                <Typography variant="caption" color="text.secondary">Sin comentarios aún.</Typography>
              )}
              {comments.map(c => (
                <Box
                  key={c.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: c.resolved
                      ? theme.palette.mode === 'dark' ? 'rgba(46,125,50,0.1)' : '#e8f5e9'
                      : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={700}>{c.user_name}</Typography>
                    <Chip
                      label={c.resolved ? '✓' : '○'}
                      size="small"
                      color={c.resolved ? 'success' : 'default'}
                      sx={{ height: 16, fontSize: '0.6rem' }}
                    />
                  </Box>
                  <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>{c.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(c.date), 'dd/MM/yyyy HH:mm')}
                    {c.page_ref && ` · Pág. ${c.page_ref}`}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Add comment */}
            {hasPermission('add_comments') && (
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Agregar comentario técnico..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Comentar
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* PDF Viewer area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#525659',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            gap: 2,
          }}
        >
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 8 }}>
              <CircularProgress sx={{ color: '#f5c518' }} />
              <Typography color="white" variant="body2">Cargando plano PDF...</Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ mt: 4, maxWidth: 480 }}>
              <Alert
                severity="info"
                sx={{ borderRadius: 2 }}
                action={
                  <Button size="small" variant="outlined" component="a" href={pdfUrl} target="_blank">
                    Abrir PDF
                  </Button>
                }
              >
                <Typography variant="subtitle2" fontWeight={700}>Visor PDF operativo</Typography>
                <Typography variant="body2">
                  No fue posible renderizar el PDF dentro del visor. Puedes abrir el archivo directamente desde el servidor.
                </Typography>
              </Alert>

              {/* Demo info card */}
              <Paper sx={{ mt: 2, p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PictureAsPdf sx={{ color: 'error.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {plan?.title || 'Visor de Planos Eléctricos'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{plan?.plan_number}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Este visor usa <strong>PDF.js</strong> y soporta:
                </Typography>
                {['✅ Zoom 25% - 300%', '✅ Rotación 0°/90°/180°/270°', '✅ Navegación por páginas',
                  '✅ Pantalla completa', '✅ Descarga e impresión', '✅ Comentarios técnicos',
                  '✅ Historial de revisiones', '✅ Panel lateral con info'].map(feat => (
                  <Typography key={feat} variant="caption" display="block" sx={{ py: 0.3, color: 'text.primary' }}>{feat}</Typography>
                ))}
              </Paper>
            </Box>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            {Array.from({ length: numPages }, (_, i) => i + 1)
              .filter(p => p === currentPage)
              .map(pageNum => (
                <Box
                  key={pageNum}
                  sx={{
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    borderRadius: 1,
                    overflow: 'hidden',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <Page
                    pageNumber={pageNum}
                    scale={zoom / 100}
                    renderAnnotationLayer
                    renderTextLayer
                  />
                </Box>
              ))}
          </Document>
        </Box>
      </Box>
    </Box>
  );
};

// Default viewer (when no plan selected) shows plan list
export const PlanViewerIndexPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [plans, setPlans] = useState<ElectricalPlan[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    Promise.all([api.getPlans(), api.getAttractions()])
      .then(([loadedPlans, loadedAttractions]) => {
        setPlans(loadedPlans);
        setAttractions(loadedAttractions);
      })
      .catch(() => {
        setPlans([]);
        setAttractions([]);
      });
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>Visor de Planos</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Selecciona un plano para visualizarlo
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {plans.map(plan => {
          const attr = attractions.find(a => a.id === plan.attraction_id);
          return (
            <Paper
              key={plan.id}
              variant="outlined"
              sx={{
                p: 2, borderRadius: 2, cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: theme.palette.mode === 'dark' ? 'rgba(61,122,53,0.1)' : 'rgba(61,122,53,0.04)' },
              }}
              onClick={() => navigate(`/viewer/${plan.id}`)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <PictureAsPdf sx={{ color: 'error.light', fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>{plan.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {attr?.name} · {plan.plan_number} · {plan.current_version}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={plan.pages + ' págs.'} size="small" />
                  <Button size="small" variant="contained">Abrir</Button>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default PlanViewerPage;
