import { useState } from 'react';
import AddPassword from './components/AddPassword';
import PasswordList from './components/PasswordList';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handlePasswordAdded = () => {
    setRefresh(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🔐 Password Manager
          </h1>
        </header>
        
        <main>
          <AddPassword onSuccess={handlePasswordAdded} />
          <PasswordList refresh={refresh} />
        </main>
      </div>
    </div>
  );
}

export default App;