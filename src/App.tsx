import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all your page components and the ProtectedRoute component.
// Adjust the paths below based on your actual file structure.
// For example, if your pages are directly in 'src/', use './Index' instead of './pages/Index'.
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import ApplicationTracker from './pages/ApplicationTracker';
import InterviewPrep from './pages/InterviewPrep';
import LearningPath from './pages/LearningPath'; // Assuming LearningPath is used for both /ats-score and /learning
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Jobs from './pages/Jobs';
import NotFound from './pages/NotFound'; // For the catch-all route

// This is a placeholder for your ProtectedRoute component.
// You'll need to create or verify this file.
import ProtectedRoute from './components/ProtectedRoute'; // Assuming ProtectedRoute is in 'src/components'

// Define a simple placeholder component for ProtectedRoute if you don't have it yet,
// so the app can at least render without crashing.
// For a real app, ProtectedRoute would have logic to check authentication.
// For now, let's make it render its children directly.
/*
// If ProtectedRoute.tsx doesn't exist yet, you can temporarily use this:
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, you'd check auth here, e.g., if (userIsAuthenticated) { return <>{children}</>; }
  return <>{children}</>;
};
*/

function App() {
  return (
    <div className="App"> {/* Optional: A wrapper div for styling, e.g., with global flexbox or padding */}
      <Routes>
        <Route path="/home" element={<Index />} />
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/ATS-score" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/learning" element={<LearningPath />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="*" element={<NotFound />} /> {/* Catch-all for unknown routes */}
      </Routes>
    </div>
  );
}

export default App;