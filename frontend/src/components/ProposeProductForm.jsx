import React, { useState } from 'react';
import api from '../services/api';

const ProposeProductForm = ({ onProductProposed }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const employeeString = localStorage.getItem('user');
  const user = employeeString ? JSON.parse(employeeString) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/employee/product', {
        name: formData.name,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        requestedBy: user?.id || user?._id
      });
      
      if (response.data.success) {
        setFormData({ name: '', price: '', quantity: '' });
        if (onProductProposed) onProductProposed();
      }
    } catch (err) {
      if (err.response?.data?.messages) {
        setError(err.response.data.messages.join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to submit proposal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500 transform rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-white flex items-center relative z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Propose New Product
      </h2>
      <p className="text-sm text-slate-400 mb-5 relative z-10">Submit a catalog addition for Admin approval.</p>
      
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm relative z-10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Product Name</label>
          <input 
            type="text"
            required
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600 shadow-inner"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Ergonomic Keyboard"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Retail Price (₹)</label>
            <input 
              type="number"
              required
              min="0.01"
              step="0.01"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600 shadow-inner"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Initial Stock</label>
            <input 
              type="number"
              required
              min="0"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600 shadow-inner"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="0"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg border border-cyan-500/50 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:shadow-none mt-2 flex items-center justify-center"
        >
          {loading ? (
             <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Submitting...
             </span>
          ) : 'Submit Proposal'}
        </button>
      </form>
    </div>
  );
};

export default ProposeProductForm;
