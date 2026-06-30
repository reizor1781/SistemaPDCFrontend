import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Slider,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Download,
  FitScreen,
  FirstPage,
  Fullscreen,
  FullscreenExit,
  LastPage,
  MenuBook,
  MenuOpen,
  NavigateBefore,
  NavigateNext,
  PictureAsPdf,
  Print,
  RotateLeft,
  RotateRight,
  ViewSidebar,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { Attraction, AttractionManual } from '../types';
import { api, resolveFileUrl } from '../services/api';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ManualViewerPage: React.FC = () => {
  const { manualId } = useParams<{ manualId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [manual, setManual] = useState<AttractionManual | null>(null);
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!manualId) return;
    setLoading(true);
    setError(false);
    api.getManual(manualId)
      .then(async loadedManual => {
        setManual(loadedManual);
        const loadedAttraction = await api.getAttraction(loadedManual.attraction_id);
        setAttraction(loadedAttraction);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [manualId]);

  const pdfUrl = resolveFileUrl(manual?.file_url || '/sample-plans/sample.pdf');

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = () => {
    setLoading(false);
    setError(true);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) setCurrentPage(page);
  };

  return (
    <Box ref={containerRef} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>
      {manual && (
        <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <MenuBook sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2" fontWeight={700} noWrap>{manual.title}</Typography>
          <Chip label={manual.manual_number} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Chip label={manual.current_version} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }} />
          {attraction && <Typography variant="caption" sx={{ opacity: 0.8 }}>{attraction.name}</Typography>}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}`, flexWrap: 'wrap' }}>
        <Tooltip title="Volver"><IconButton size="small" onClick={() => navigate(-1)}><ArrowBack /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Toggle panel lateral */}
        <Tooltip title={sidebarOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'}>
          <IconButton size="small" onClick={() => setSidebarOpen(prev => !prev)} color={sidebarOpen ? 'primary' : 'default'}>
            {sidebarOpen ? <MenuOpen /> : <ViewSidebar />}
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <Tooltip title="Pagina anterior"><IconButton size="small" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}><NavigateBefore /></IconButton></Tooltip>
        <TextField
          size="small"
          value={currentPage}
          onChange={e => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 1 && value <= numPages) setCurrentPage(value);
          }}
          sx={{ width: 52, '& input': { textAlign: 'center', py: 0.5, px: 0.5, fontSize: '0.8rem' } }}
        />
        <Typography variant="caption" color="text.secondary">/ {numPages}</Typography>
        <Tooltip title="Pagina siguiente"><IconButton size="small" disabled={currentPage === numPages} onClick={() => goToPage(currentPage + 1)}><NavigateNext /></IconButton></Tooltip>
        <Tooltip title="Ultima pagina"><IconButton size="small" disabled={currentPage === numPages} onClick={() => goToPage(numPages)}><LastPage /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Reducir"><IconButton size="small" onClick={() => setZoom(z => Math.max(z - 25, 25))}><ZoomOut /></IconButton></Tooltip>
        <Slider value={zoom} onChange={(_, value) => setZoom(value as number)} min={25} max={300} step={25} sx={{ width: 90 }} size="small" />
        <Typography variant="caption" sx={{ minWidth: 35 }}>{zoom}%</Typography>
        <Tooltip title="Ampliar"><IconButton size="small" onClick={() => setZoom(z => Math.min(z + 25, 300))}><ZoomIn /></IconButton></Tooltip>
        <Tooltip title="Ajustar al ancho"><IconButton size="small" onClick={() => setZoom(100)}><FitScreen /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Rotar izquierda"><IconButton size="small" onClick={() => setRotation(r => (r - 90 + 360) % 360)}><RotateLeft /></IconButton></Tooltip>
        <Tooltip title="Rotar derecha"><IconButton size="small" onClick={() => setRotation(r => (r + 90) % 360)}><RotateRight /></IconButton></Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Tooltip title="Descargar PDF"><IconButton size="small" component="a" href={pdfUrl} download><Download /></IconButton></Tooltip>
        <Tooltip title="Imprimir"><IconButton size="small" onClick={() => window.print()}><Print /></IconButton></Tooltip>
        <Tooltip title={isFullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}>
          <IconButton size="small" onClick={handleFullscreen}>{isFullscreen ? <FullscreenExit /> : <Fullscreen />}</IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Panel lateral colapsable */}
        <Box
          sx={{
            width: sidebarOpen ? 280 : 0,
            minWidth: sidebarOpen ? 280 : 0,
            flexShrink: 0,
            borderRight: sidebarOpen ? `1px solid ${theme.palette.divider}` : 'none',
            bgcolor: 'background.paper',
            p: sidebarOpen ? 2 : 0,
            overflow: sidebarOpen ? 'auto' : 'hidden',
            transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {sidebarOpen && (
            <>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Informacion del Manual</Typography>
              {manual && [
                { label: 'N Manual', value: manual.manual_number },
                { label: 'Autor', value: manual.author },
                { label: 'Version', value: manual.current_version },
                { label: 'Estado', value: manual.status },
                { label: 'Actualizado', value: format(new Date(manual.updated_date), 'dd/MM/yyyy') },
                { label: 'Tamano', value: `${(manual.file_size_kb / 1024).toFixed(1)} MB` },
              ].map(row => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.7, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                  <Typography variant="caption" fontWeight={600}>{row.value}</Typography>
                </Box>
              ))}
            </>
          )}
        </Box>

        {/* Área principal del PDF */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Visor del PDF */}
          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#525659', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, gap: 2 }}>
            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 8 }}>
                <CircularProgress sx={{ color: '#f5c518' }} />
                <Typography color="white" variant="body2">Cargando manual PDF...</Typography>
              </Box>
            )}

            {error && (
              <Box sx={{ mt: 4, maxWidth: 480 }}>
                <Alert severity="info" action={<Button size="small" variant="outlined" component="a" href={pdfUrl} target="_blank">Abrir PDF</Button>}>
                  <Typography variant="subtitle2" fontWeight={700}>Visor PDF operativo</Typography>
                  <Typography variant="body2">No fue posible renderizar el PDF dentro del visor. Puedes abrir el archivo directamente.</Typography>
                </Alert>
                <Paper sx={{ mt: 2, p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdf sx={{ color: 'error.main', fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="text.primary">{manual?.title || 'Visor de Manuales'}</Typography>
                      <Typography variant="caption" color="text.secondary">{manual?.manual_number}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={null}>
              {Array.from({ length: numPages }, (_, index) => index + 1)
                .filter(page => page === currentPage)
                .map(page => (
                  <Box key={page} sx={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)', borderRadius: 1, overflow: 'hidden', transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}>
                    <Page pageNumber={page} scale={zoom / 100} renderAnnotationLayer renderTextLayer />
                  </Box>
                ))}
            </Document>
          </Box>

          {/* Barra de navegación de páginas inferior */}
          {numPages > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                px: 2,
                py: 1,
                bgcolor: 'background.paper',
                borderTop: `1px solid ${theme.palette.divider}`,
                flexShrink: 0,
              }}
            >
              <Tooltip title="Primera página">
                <span>
                  <IconButton
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(1)}
                    sx={{
                      bgcolor: currentPage === 1 ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <FirstPage />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Página anterior">
                <span>
                  <IconButton
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                    sx={{
                      bgcolor: currentPage === 1 ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                </span>
              </Tooltip>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 1 }}>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Página
                </Typography>
                <TextField
                  size="small"
                  value={currentPage}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= numPages) setCurrentPage(value);
                  }}
                  sx={{
                    width: 52,
                    '& input': { textAlign: 'center', py: 0.4, px: 0.5, fontSize: '0.85rem', fontWeight: 700 },
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  de <strong>{numPages}</strong>
                </Typography>
              </Box>

              <Tooltip title="Página siguiente">
                <span>
                  <IconButton
                    size="small"
                    disabled={currentPage === numPages}
                    onClick={() => goToPage(currentPage + 1)}
                    sx={{
                      bgcolor: currentPage === numPages ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Última página">
                <span>
                  <IconButton
                    size="small"
                    disabled={currentPage === numPages}
                    onClick={() => goToPage(numPages)}
                    sx={{
                      bgcolor: currentPage === numPages ? 'transparent' : 'action.hover',
                      '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <LastPage />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ManualViewerPage;
