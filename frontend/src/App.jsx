import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import History from './pages/History';
import About from './pages/About';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/results"    element={<Results />} />
          <Route path="/history"    element={<History />} />
          <Route path="/about"      element={<About />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
