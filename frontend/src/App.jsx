import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Box, Settings as SettingsIcon, Menu, X, Bell } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AIPredictions from './pages/AIPredictions';
import Products from './pages/Products';
import Settings from './pages/Settings';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', theme: 'cyan' },
    { path: '/admin/ai-predictions', icon: BrainCircuit, label: 'AI Predictions', theme: 'purple' },
    { path: '/admin/products', icon: Box, label: 'Products', theme: 'cyan' },
    { path: '/admin/settings', icon: SettingsIcon, label: 'Settings', theme: 'slate' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Layout */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50 bg-transparent">
          <div className="flex items-center space-x-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-white font-bold tracking-tight">SmartStock</span>
            <span className="ml-auto lg:hidden cursor-pointer p-1 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1 text-sm font-medium">
            <p className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              // Dynamic coloring logic based on route theme specification
              const colorClasses = isActive 
                ? item.theme === 'cyan' 
                  ? 'bg-cyan-500/10 text-cyan-400' 
                  : item.theme === 'purple' 
                    ? 'bg-purple-500/10 text-purple-400' 
                    : 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200';

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${colorClasses}`}
                >
                  <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm group-hover:text-white transition-colors">
              AD
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@smartstock.ai</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-3"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-slate-900"></span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30 ml-2"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LightRays from './components/LightRays';

// Admin Layout wrapper
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen live-bg font-sans flex text-slate-200 selection:bg-cyan-500/30 relative overflow-hidden">
      <LightRays
        raysOrigin="top-center"
        raysColor="#22d3ee"
        raysSpeed={1.2}
        lightSpread={0.6}
        rayLength={4}
        followMouse={true}
        mouseInfluence={0.15}
        noiseAmount={0}
        distortion={0.1}
        pulsating={true}
        fadeDistance={1}
        saturation={1}
      />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        <Topbar setIsOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden relative">
          {/* Animated Glow Orbs */}
          <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[100px] mix-blend-screen pointer-events-none"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[100px] mix-blend-screen pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500 relative z-10">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="ai-predictions" element={<AIPredictions />} />
              <Route path="products" element={<Products />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Wildcard to match nested routes inside AdminLayout */}
        <Route path="/admin/*" element={<AdminLayout />} />
        {/* Placeholder for Employee Dashboard build coming next */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
