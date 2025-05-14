import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PasswordLayout from './layouts/PasswordLayout';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/passwords" element={<PasswordLayout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}