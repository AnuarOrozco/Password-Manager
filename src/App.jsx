import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PasswordLayout from './layouts/PasswordLayout';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Home />} />
        
        {/* Rutas protegidas de contraseñas */}
        <Route path="/passwords" element={<PasswordLayout />}>
          <Route index element={
            <>
              <AddPassword />
              <PasswordList />
            </>
          } />
        </Route>
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}