import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AchievementProvider } from './context/AchievementContext';

// Components
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
import CelestialBackground from './components/CelestialBackground';
import FirebaseStatus from './components/FirebaseStatus';

import TerminalOverlay from './components/Terminal';
import AchievementToast from './components/AchievementToast';

// Pages
import Home from './pages/Home';
import Memories from './pages/Memories';
import SecretVault from './pages/SecretVault';
import TimeCapsule from './pages/TimeCapsule';
import Dashboard from './pages/Dashboard';
import ConnectionHub from './pages/ConnectionHub';
import LoveNotes from './pages/LoveNotes';
import OurSky from './pages/OurSky';
import Login from './pages/Login';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <CelestialBackground />
        <div className="text-center z-10 transition-stellar">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="login-star-symbol"
          >
            ✦
          </motion.div>
          <p className="hero-astral-label shimmer-text mt-4">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  // Actual authentication:
  return currentUser ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Terminal keyboard shortcut (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Konami code Easter egg
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const handleKonami = (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          // Trigger special animation
          document.body.classList.add('konami-activated');
          alert('💕 Konami Code Activated! You found a secret! 💕\n\nKavya loves Ishaan forever! ∞');
          setTimeout(() => {
            document.body.classList.remove('konami-activated');
          }, 5000);
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, []);

  return (
    <div className="app">
      <CelestialBackground />
      <CustomCursor />
      <Navigation />
      <AchievementToast />
      <FirebaseStatus />

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/memories" element={
            <ProtectedRoute>
              <Memories />
            </ProtectedRoute>
          } />
          <Route path="/vault" element={
            <ProtectedRoute>
              <SecretVault />
            </ProtectedRoute>
          } />
          <Route path="/timecapsule" element={
            <ProtectedRoute>
              <TimeCapsule />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/connection" element={
            <ProtectedRoute>
              <ConnectionHub />
            </ProtectedRoute>
          } />
          <Route path="/lovenotes" element={
            <ProtectedRoute>
              <LoveNotes />
            </ProtectedRoute>
          } />
          <Route path="/oursky" element={
            <ProtectedRoute>
              <OurSky />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Terminal Easter Egg */}
      <TerminalOverlay
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      {/* Hidden Terminal Trigger */}
      <button
        className="terminal-trigger"
        onClick={() => setIsTerminalOpen(true)}
        title="Open Terminal (Ctrl+Shift+T)"
      >
        {'</>'}
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AchievementProvider>
          <AppContent />
        </AchievementProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
