import React, { useState } from 'react';
import { User as UserType } from '../types';
import { login, register } from '../utils/auth';
import { Eye, EyeOff, X, User, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('');

    try {
      let user: UserType | null = null;

      if (isRegister) {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        user = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'customer' // Default role for registration
        });
        if (!user) {
          setError('User already exists with this email');
          setLoading(false);
          return;
        }
      } else {
        // Add debug info for login
        setDebugInfo(`Attempting login with email: ${formData.email}`);
        
        user = await login(formData.email, formData.password);
        
        if (!user) {
          setError('Invalid email or password');
          setDebugInfo('Login failed - user is null');
          setLoading(false);
          return;
        }
        
        setDebugInfo(`Login successful! User role: ${user.role}, ID: ${user.id}`);
      }

      // Add debug info before calling onLogin
      setDebugInfo(`About to call onLogin with user: ${JSON.stringify(user, null, 2)}`);
      
      onLogin(user);
      onClose();
    } catch (err) {
      console.error('Login/Register error:', err);
      setError('An error occurred. Please try again.');
      setDebugInfo(`Error details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setDebugInfo('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {debugInfo && (
              <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-xs font-mono">{debugInfo}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              {isRegister 
                ? 'Already have an account? Sign in'
                : 'Need an account? Create one'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;