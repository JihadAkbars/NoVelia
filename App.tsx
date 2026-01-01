
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { StoryDetail } from './pages/StoryDetail';
import { Reader } from './pages/Reader';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStoryEdit } from './pages/AdminStoryEdit';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('noVeliaAdmin') === 'true';
  });

  const handleLogin = (passkey: string) => {
    if (passkey === '040507') {
      setIsAdmin(true);
      localStorage.setItem('noVeliaAdmin', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('noVeliaAdmin');
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/story/:id" element={<StoryDetail />} />
            <Route path="/read/:chapterId" element={<Reader />} />
            <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} isAdmin={isAdmin} />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
            />
            <Route 
              path="/admin/story/new" 
              element={isAdmin ? <AdminStoryEdit /> : <Navigate to="/admin/login" />} 
            />
            <Route 
              path="/admin/story/edit/:id" 
              element={isAdmin ? <AdminStoryEdit /> : <Navigate to="/admin/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
