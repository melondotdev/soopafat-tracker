import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { Dumbbell } from 'lucide-react';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const { currentUser } = useAuth();
  const location = useLocation();

  if (currentUser) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Dumbbell className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Welcome to SOOPAFAT
          </h2>
          <p className="mt-2 text-gray-600">
            {mode === 'login'
              ? 'Sign in to your account'
              : mode === 'signup'
              ? 'Create your account'
              : 'Reset your password'}
          </p>
        </div>

        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}