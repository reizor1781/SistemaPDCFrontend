import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Alert, Box, Button, CssBaseline, ThemeProvider as MuiThemeProvider, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';

// Pages
import LoginPage from './pages/LoginPage';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AttractionsPage from './pages/AttractionsPage';
import DocumentationPage from './pages/DocumentationPage';
import PlanViewerPage, { PlanViewerIndexPage } from './pages/PlanViewerPage';
import PlansManagementPage from './pages/PlansManagementPage';
import ManualsManagementPage from './pages/ManualsManagementPage';
import ManualViewerPage from './pages/ManualViewerPage';
import SearchPage from './pages/SearchPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PermissionRoute: React.FC<{ permission: string; children: React.ReactNode }> = ({ permission, children }) => {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) return <>{children}</>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" href="/dashboard">
            Ir al dashboard
          </Button>
        }
      >
        <Typography variant="subtitle2" fontWeight={700}>Acceso restringido</Typography>
        <Typography variant="body2">
          Tu rol actual no tiene permisos para abrir este módulo.
        </Typography>
      </Alert>
    </Box>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useThemeContext();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="attractions" element={<AttractionsPage />} />
              <Route path="documentation" element={<Navigate to="/attractions" replace />} />
              <Route path="documentation/:id" element={<DocumentationPage />} />
              <Route path="viewer" element={<PlanViewerIndexPage />} />
              <Route path="viewer/:planId" element={<PlanViewerPage />} />
              <Route path="manual-viewer/:manualId" element={<ManualViewerPage />} />
              <Route
                path="plans"
                element={
                  <PermissionRoute permission="upload_plans">
                    <PlansManagementPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="manuals"
                element={
                  <PermissionRoute permission="manage_manuals">
                    <ManualsManagementPage />
                  </PermissionRoute>
                }
              />
              <Route path="search" element={<SearchPage />} />
              <Route
                path="users"
                element={
                  <PermissionRoute permission="manage_users">
                    <UsersPage />
                  </PermissionRoute>
                }
              />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </MuiThemeProvider>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
