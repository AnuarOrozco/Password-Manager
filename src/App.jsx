import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import PasswordLayout from './layouts/PasswordLayout';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';

export default function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="passwords" element={<PasswordLayout />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          // Estilos base para todos los toasts
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '12px 16px',
            fontSize: '0.875rem',
          },
          // Estilos específicos para tipos de toast
          success: {
            iconTheme: {
              primary: 'hsl(var(--success))',
              secondary: 'hsl(var(--success-foreground))',
            },
            style: {
              background: 'hsl(var(--success))',
              color: 'hsl(var(--success-foreground))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--destructive-foreground))',
            },
            style: {
              background: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
            },
          },
          loading: {
            style: {
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
            },
          },
        }}
      />
    </>
  );
}