import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Lock, Mail, User } from 'lucide-react';
import api from '../services/api';
import LightRays from '../components/LightRays';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.success) {
        setSuccessMsg(response.data.message);
        // Clear form after success
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
      <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>
      <div className="max-w-md w-full animate-in zoom-in-95 duration-300">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Staff Onboarding</h1>
          <p className="text-slate-400">Create an account to access the Terminal</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden p-8 relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Register</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-4 py-3 rounded-lg text-sm mb-6 text-center">
              {successMsg}
              <div className="mt-2 text-slate-300">Wait for Admin approval, then <Link to="/" className="text-cyan-400 hover:text-cyan-300 underline font-medium">Log In here</Link>.</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="John Doe"
                  disabled={loading || successMsg}
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="employee@smartstock.ai"
                  disabled={loading || successMsg}
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  disabled={loading || successMsg}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || successMsg}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 mt-4 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col space-y-2 text-sm text-center">
            <p className="text-slate-400">Already have an approved account?</p>
            <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Return to Login &rarr;</Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Register;
