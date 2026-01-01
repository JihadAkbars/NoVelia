import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { StoryDetail } from './pages/StoryDetail';
import { Reader } from './pages/Reader';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { StoryEditor } from './pages/StoryEditor';
import { ChapterManager } from './pages/ChapterManager';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/read/:chapterId" element={<Reader />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/story/new" element={<StoryEditor />} />
          <Route path="/admin/story/edit/:id" element={<StoryEditor />} />
          <Route path="/admin/story/:storyId/chapters" element={<ChapterManager />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;