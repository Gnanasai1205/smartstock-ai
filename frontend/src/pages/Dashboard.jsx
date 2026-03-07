import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, CheckCircle, Clock, BrainCircuit, Activity } from 'lucide-react';
import api from '../services/api';
import AddProductForm from '../components/AddProductForm';
import ProductsTable from '../components/ProductsTable';
import AIAssistantWidget from '../components/AIAssistantWidget';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [restocks, setRestocks] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products, insights, pending restocks, and pending staff concurrently
      const [productsRes, insightsRes, restocksRes, staffRes, pendingProdRes, predictionsRes] = await Promise.all([
        api.get('/products?lowStock=true'),
        api.get('/ai/insights'),
        api.get('/employee/restocks'),
        api.get('/admin/pending-staff'),
        api.get('/admin/pending-products'),
        api.get('/ai/predictions')
      ]);
      
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      }
      if (insightsRes.data) {
        setInsights(insightsRes.data);
      }
      if (restocksRes.data && restocksRes.data.success) {
        setRestocks(restocksRes.data.data.filter(r => r.status === 'pending'));
      }
      if (staffRes.data && staffRes.data.success) {
        setPendingStaff(staffRes.data.data);
      }
      if (pendingProdRes.data && pendingProdRes.data.success) {
        setPendingProducts(pendingProdRes.data.data);
      }
      if (Array.isArray(predictionsRes.data)) {
        setPredictions(predictionsRes.data);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRestock = async (request) => {
    try {
      await api.put(`/admin/approve-restock/${request._id}`, { 
        quantity: (request.product?.quantity || request.currentQuantity) + request.suggestedQuantity 
      });
      showNotification(`Restock for ${request.product.name} approved!`);
      fetchDashboardData();
    } catch (err) {
       console.error(err);
       showNotification('Failed to approve restock', 'error');
    }
  };

  const handleApproveStaff = async (staffId, staffName) => {
    try {
      const res = await api.put(`/admin/approve-staff/${staffId}`);
      if (res.data.success) {
        showNotification(`${staffName} has been approved to login!`);
        fetchDashboardData();
      }
    } catch (error) {
       console.error(error);
       showNotification('Failed to approve staff account', 'error');
    }
  };

  const handleProductDecision = async (productId, productName, isApprove) => {
    try {
      if (isApprove) {
        await api.put(`/admin/approve-product/${productId}`);
        showNotification(`${productName} formally added to catalog!`);
      } else {
        await api.delete(`/admin/reject-product/${productId}`);
        showNotification(`Proposal for ${productName} dismissed`, 'error');
      }
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      showNotification('Failed to process product proposal', 'error');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="relative animate-in">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header Context Actions */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Admin Overview
          </h1>
          <p className="text-slate-400">Manage and analyze your SmartStock resources</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="mt-4 md:mt-0 flex items-center bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg border border-cyan-500/50 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      {/* Top AI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-slate-400 font-medium mb-1">Total Products</h3>
          <div className="text-4xl font-bold tracking-tight text-white mb-2">
            {insights ? insights.totalProducts : '-'}
          </div>
          <p className="text-sm text-blue-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Active in database
          </p>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-gradient-to-br from-slate-800 flex flex-col to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-slate-400 font-medium mb-1 z-10">Low Stock Alerts</h3>
          <div className="text-4xl font-bold tracking-tight text-white mb-2 z-10">
            {insights ? insights.lowStockCount : '-'}
            <span className="text-lg text-slate-500 ml-2 font-normal">items</span>
          </div>
          <div className="mt-auto">
            {insights && insights.lowStockCount > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                Action Required
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                Stock Healthy
              </span>
            )}
          </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-gradient-to-br flex flex-col from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 border-b-4 border-b-cyan-500 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-slate-400 font-medium mb-1 z-10">Total Inventory Value</h3>
          <div className="text-4xl font-bold tracking-tight text-white mb-2 z-10 font-mono">
            ₹{insights ? insights.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-sm mt-auto text-cyan-400 flex items-center">
             Computed automatically by AI
          </p>
        </div>

        {/* Most Expensive Product Card */}
        <div className="bg-gradient-to-br flex flex-col from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-20 w-20 text-purple-500" />
          </div>
          <h3 className="text-slate-400 font-medium mb-1 z-10">Most Expensive Asset</h3>
          <div className="text-2xl font-bold tracking-tight text-white mb-2 z-10 truncate mt-2">
            {insights && insights.mostExpensiveProduct ? insights.mostExpensiveProduct : '-'}
          </div>
          <p className="text-sm mt-auto text-purple-400 flex items-center pt-2">
             Highest single-unit value
          </p>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms & Feeds */}
        <div className="lg:col-span-1 space-y-8">
          
          <AddProductForm onProductAdded={() => {
            fetchDashboardData();
            showNotification('Product added successfully!');
          }} />

          {/* Pending Staff Approvals Feed */}
          <div>
            <div className="flex justify-between items-center mb-4 mt-8">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                Pending Staff
              </h2>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-h-[150px]">
              {loading ? (
                 <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div></div>
              ) : pendingStaff.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No pending account approvals.</div>
              ) : (
                 <div className="divide-y divide-slate-700/50">
                   {pendingStaff.map((staff) => (
                     <div key={staff._id} className="p-4 flex flex-col hover:bg-slate-800 transition-colors">
                       <div className="flex justify-between items-start mb-3">
                         <div>
                           <p className="text-white font-medium text-sm">{staff.name}</p>
                           <p className="text-xs text-slate-400">{staff.email}</p>
                         </div>
                         <span className="text-[10px] font-medium bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">AWAITING APPROVAL</span>
                       </div>
                       <button onClick={() => handleApproveStaff(staff._id, staff.name)} className="w-full flex items-center justify-center text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-2 rounded-lg transition-colors">
                         <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve Access
                       </button>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>

          {/* Pending Product Proposals */}
          <div>
            <div className="flex justify-between items-center mb-4 mt-8">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-400" />
                Staff Product Proposals
              </h2>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-h-[150px]">
              {loading ? (
                 <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div></div>
              ) : pendingProducts.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No pending product proposals.</div>
              ) : (
                 <div className="divide-y divide-slate-700/50">
                   {pendingProducts.map((prod) => (
                     <div key={prod._id} className="p-4 flex flex-col hover:bg-slate-800 transition-colors">
                       <div className="flex justify-between items-start mb-3">
                         <div>
                           <p className="text-white font-medium text-sm">{prod.name}</p>
                           <p className="text-xs text-slate-400 font-mono">Qty: {prod.quantity} | ₹{prod.price}</p>
                         </div>
                         <span className="text-[10px] font-medium bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">PROPOSAL</span>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => handleProductDecision(prod._id, prod.name, false)} className="flex-[1] flex items-center justify-center text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 rounded-lg transition-colors">
                           Reject
                         </button>
                         <button onClick={() => handleProductDecision(prod._id, prod.name, true)} className="flex-[2] flex items-center justify-center text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-2 rounded-lg transition-colors">
                           <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Tables */}
        <div className="lg:col-span-2 space-y-8">
          


          {/* Employee Request Feed */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                Employee Restock Requests
              </h2>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-h-[150px]">
              {loading ? (
                 <div className="flex justify-center p-10"><div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>
              ) : restocks.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No pending requests from floor staff.</div>
              ) : (
                 <div className="divide-y divide-slate-700/50">
                   {restocks.map((req) => (
                     <div key={req._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-800 transition-colors">
                       <div className="mb-3 sm:mb-0">
                         <p className="text-white font-medium flex items-center mb-1">
                           {req.product?.name} 
                           <span className="ml-3 text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">Current: {req.currentQuantity}</span>
                         </p>
                         <p className="text-xs text-purple-400 font-medium">{req.aiPredictionContext}</p>
                         <p className="text-xs text-slate-500 mt-1">Requested by: {req.requestedBy?.name || 'Employee'}</p>
                       </div>
                       
                       <button onClick={() => handleApproveRestock(req)} className="flex items-center justify-center text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
                         <CheckCircle className="w-4 h-4 mr-1.5" /> Approve (+{req.suggestedQuantity})
                       </button>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Low Stock Alerts
              </h2>
            </div>
            
            {loading && !products.length ? (
              <div className="flex justify-center py-20 bg-slate-800 rounded-2xl border border-slate-700">
                <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <ProductsTable 
                products={products} 
                onProductUpdated={(message) => {
                  fetchDashboardData();
                  showNotification(message || 'Quantity updated successfully!');
                }} 
              />
            )}
          </div>
        </div>
      </div>
      
      <AIAssistantWidget />
    </div>
  );
};

export default Dashboard;
