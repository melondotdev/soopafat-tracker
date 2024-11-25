import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <AuthProvider>
          <Routes>
            {/* Public auth route */}
            <Route path="/login" element={<AuthPage />} />
            
            {/* Protected dashboard route */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            {/* Root and catch-all routes redirect to appropriate page */}
            <Route 
              path="*" 
              element={
                <PrivateRoute>
                  <Navigate to="/dashboard" replace />
                </PrivateRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;