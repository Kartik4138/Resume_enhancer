import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext.jsx';
import Login from './pages/Login';
import OTP from './pages/OTP';
import Dashboard from './pages/Dashboard';
import ResumePage from './pages/ResumePage';
import JobDescriptionPage from './pages/JobDescriptionPage';
import ResultsPage from './pages/ResultsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnalysisProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/otp" element={<OTP />} />

            {/* Protected routes wrapped by ProtectedRoute and Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/resume" element={<ResumePage />} />
                <Route path="/job-description" element={<JobDescriptionPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnalysisProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
