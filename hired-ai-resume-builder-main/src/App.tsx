
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import ApplicationTracker from './pages/ApplicationTracker';
import InterviewPrep from './pages/InterviewPrep';
import ATSScore from './pages/ATSScore';
import Templates from './pages/Templates';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import LearningPath from './pages/LearningPath';
import Jobs from './pages/Jobs';
import './App.css';
import './styles/templates.css';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/home" element={<Index />} />
            <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
            <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
            <Route path="/ats-score" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/learning" element={<LearningPath />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
        <SonnerToaster position="bottom-center" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
