import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'reset';
  onModeChange: (mode: 'login' | 'signup' | 'reset') => void;
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login, resetPassword } = useAuth();

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    const errorCode = error?.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'An error occurred. Please try again';
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(email, password);
      } else if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'reset') {
        await resetPassword(email);
        alert('Check your email for password reset instructions');
        onModeChange('login');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your password"
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset link...'}
            </span>
          ) : (
            mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'
          )}
        </button>

        <div className="text-center space-y-2">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => onModeChange('reset')}
                className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
                disabled={loading}
              >
                Forgot password?
              </button>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onModeChange('signup')}
                  className="text-emerald-600 hover:underline disabled:opacity-50"
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            </>
          ) : mode === 'signup' ? (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="text-emerald-600 hover:underline disabled:opacity-50"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
              disabled={loading}
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  );
}