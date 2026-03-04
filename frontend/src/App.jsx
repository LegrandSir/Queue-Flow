import { useState } from 'react'
import KioskPage from './pages/KioskPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Later, we will add a Router here (like react-router-dom) 
        to switch between /kiosk, /admin, and /dashboard.
        For now, we render the KioskPage directly.
      */}
      <KioskPage />
    </main>
  );
}

export default App;