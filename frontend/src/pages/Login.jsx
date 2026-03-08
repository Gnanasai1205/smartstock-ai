import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Lock, Mail } from 'lucide-react';
import api from '../services/api';
import LightRays from '../components/LightRays';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoAdmin = () => {
    setEmail('admin@smartsocket.ai');
    setPassword('password123');
  };

  const handleDemoStaff = () => {
    setEmail('employee@smartstock.ai');
    setPassword('password123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        // Save token and user details to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard'); // Or currently '/'
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen live-bg flex items-center justify-center p-4 relative overflow-hidden">
      <LightRays
        raysOrigin="top-center"
        raysColor="#22d3ee"
        raysSpeed={1.2}
        lightSpread={0.6}
        rayLength={3.5}
        followMouse={true}
        mouseInfluence={0.15}
        noiseAmount={0}
        distortion={0.1}
        pulsating={true}
        fadeDistance={1}
        saturation={1}
      />
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="max-w-md w-full animate-in zoom-in-95 duration-300">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">SmartStock AI</h1>
          <p className="text-slate-400">Enterprise Inventory Management</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden p-8 relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="admin@smartstock.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Demo Credentials Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/80 text-slate-400">Demo Credentials</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDemoAdmin}
                className="flex flex-col items-center justify-center py-2 px-3 border border-slate-700 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors group"
              >
                <span className="text-cyan-400 font-medium text-sm group-hover:text-cyan-300">Admin</span>
                <span className="text-xs text-slate-500">Full Access</span>
              </button>
              
              <button
                type="button"
                onClick={handleDemoStaff}
                className="flex flex-col items-center justify-center py-2 px-3 border border-slate-700 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors group"
              >
                <span className="text-emerald-400 font-medium text-sm group-hover:text-emerald-300">Employee</span>
                <span className="text-xs text-slate-500">Floor View</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col space-y-2 text-sm text-center">
            <p className="text-slate-400">New Staff Member?</p>
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Request Account &rarr;</Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
