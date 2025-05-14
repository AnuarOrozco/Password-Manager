import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';  // Ruta actualizada
import PasswordList from './components/PasswordList';
import AddPassword from './components/AddPassword';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/passwords" element={
          <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
              <AddPassword />
              <PasswordList />
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}