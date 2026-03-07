import React, { useState, useEffect } from 'react';
import { LogOut, Package, Search, AlertTriangle, BrainCircuit, Box, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AIAssistantWidget from '../components/AIAssistantWidget';
import ProposeProductForm from '../components/ProposeProductForm';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [restockModal, setRestockModal] = useState({ isOpen: false, product: null });
  const [notification, setNotification] = useState(null);

  const employeeString = localStorage.getItem('user');
  const user = employeeString ? JSON.parse(employeeString) : null;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, insightsRes, requestsRes, activitiesRes] = await Promise.all([
          api.get('/products'),
          api.get('/ai/insights'),
          user ? api.get(`/employee/my-restocks/${user.id || user._id}`) : Promise.resolve({ data: { success: false } }),
          api.get('/activity')
        ]);
        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
        }
        if (insightsRes.data) {
          setInsights(insightsRes.data);
        }
        if (requestsRes.data && requestsRes.data.success) {
          setPendingRequests(requestsRes.data.data);
        }
        if (activitiesRes.data && activitiesRes.data.success) {
          setActivities(activitiesRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenRestockModal = (product) => {
    setRestockModal({ isOpen: true, product });
  };

  const handleQuickUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return; // Prevent negative stock

    try {
      const res = await api.put(`/products/${productId}`, { quantity: newQuantity });
      if (res.data.success) {
        // Fast UI refresh
        setProducts(products.map(p => p._id === productId ? { ...p, quantity: newQuantity } : p));
        showNotification('Inventory instantly updated');
        // Fetch background data to refresh activity logs
        api.get('/activity').then(res => {
          if (res.data.success) setActivities(res.data.data);
        });
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to update quantity', 'error');
    }
  };

  const submitRestockRequest = async () => {
    const { product } = restockModal;
    if (!product || !user) return;

    try {
      const payload = {
        productId: product._id,
        requestedBy: user.id || user._id,
        currentQuantity: product.quantity
      };
      
      const res = await api.post('/employee/restock', payload);
      if (res.data.success) {
        showNotification(`Restock requested for ${product.name}`);
        setRestockModal({ isOpen: false, product: null });
        // Refresh requests feed
        api.get(`/employee/my-restocks/${user.id || user._id}`).then(res => {
          if (res.data.success) setPendingRequests(res.data.data);
        });
        api.get('/activity').then(res => {
          if (res.data.success) setActivities(res.data.data);
        });
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to submit request', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) || 
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-200 selection:bg-cyan-500/30">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all animate-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Restock Modal */}
      {restockModal.isOpen && restockModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setRestockModal({ isOpen: false, product: null })}></div>
          <div className="relative bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">Request Restock</h3>
              <button onClick={() => setRestockModal({ isOpen: false, product: null })} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-sm font-medium text-slate-400 mb-1">Product</p>
                <p className="text-lg text-white font-semibold">{restockModal.product.name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-slate-400">Current: <span className="text-white font-medium object-tabular-nums">{restockModal.product.quantity}</span></span>
                </div>
              </div>

              <div className="bg-purple-500/10 p-4 border border-purple-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20"><BrainCircuit className="w-16 h-16 text-purple-400" /></div>
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center z-10 relative">
                  <Activity className="w-3.5 h-3.5 mr-1.5" /> Smart Restock Prompt
                </p>
                <p className="text-slate-200 text-sm z-10 relative">
                  Gemini AI will automatically calculate the exact restock requirement based on recent inventory history and current thresholds.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setRestockModal({ isOpen: false, product: null })}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitRestockRequest}
                className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center justify-center py-2.5 rounded-lg border border-cyan-500/50 shadow-lg shadow-cyan-500/20 transition-all font-semibold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Topbar */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl text-white font-bold tracking-tight">Staff Portal</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-400 hidden md:block mr-2">
            Logged in as <span className="text-emerald-400 font-medium">{user?.name || 'Employee'}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Employee Content */}
      <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 pt-6">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-full h-96 bg-emerald-900/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Inventory Floor View
            </h1>
            <p className="text-slate-400">View real-time stock levels and request smart AI restocks.</p>
          </div>
        </div>

        {/* Top Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden flex items-center">
             <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 mr-5">
               <Box className="w-8 h-8 text-blue-400" />
             </div>
             <div>
               <p className="text-sm font-medium text-slate-400 mb-1">Total Products</p>
               <h3 className="text-3xl font-bold text-white">{insights ? insights.totalProducts : '-'}</h3>
             </div>
           </div>

           <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden flex items-center">
             <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 mr-5">
               <AlertTriangle className="w-8 h-8 text-red-400" />
             </div>
             <div>
               <p className="text-sm font-medium text-slate-400 mb-1">Low Stock Alerts</p>
               <h3 className="text-3xl font-bold flex items-baseline gap-2 text-white">
                 {insights ? insights.lowStockCount : '-'} 
                 {insights && insights.lowStockCount > 0 && (
                   <span className="text-sm font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">Needs Attention</span>
                 )}
               </h3>
             </div>
           </div>
        </div>

        {/* Pending Requests Feed */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            My Pending Restocks
          </h2>
          
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-h-[100px]">
            {loading ? (
               <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div></div>
            ) : pendingRequests.length === 0 ? (
               <div className="p-6 text-center text-slate-400 text-sm">You have no pending restock requests.</div>
            ) : (
               <div className="divide-y divide-slate-700/50 max-h-[350px] overflow-y-auto">
                 {pendingRequests.map((req) => (
                   <div key={req._id} className="p-4 flex justify-between items-center hover:bg-slate-800 transition-colors">
                     <div>
                       <p className="text-white font-medium flex items-center">
                         {req.product?.name} 
                         <span className="ml-3 text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">Suggested: +{req.suggestedQuantity}</span>
                       </p>
                       <p className="text-xs text-purple-400 font-medium mt-1">{req.aiPredictionContext}</p>
                     </div>
                     <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                       req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                       req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                       'bg-orange-500/10 text-orange-400 border-orange-500/20'
                     }`}>
                       {req.status?.toUpperCase() || 'PENDING'}
                     </span>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Propose New Product Form */}
        <div className="mb-8">
          <ProposeProductForm onProductProposed={() => showNotification("Product proposal sent to Admin for review!")} />
        </div>

        {/* Activity Log Feed */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            System Activity Log
          </h2>
          
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-h-[100px]">
            {loading ? (
               <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div></div>
            ) : activities.length === 0 ? (
               <div className="p-6 text-center text-slate-400 text-sm">No recent activity.</div>
            ) : (
               <div className="divide-y divide-slate-700/50 max-h-[350px] overflow-y-auto">
                 {activities.map((log) => (
                   <div key={log._id} className="p-4 flex items-start hover:bg-slate-800 transition-colors">
                     <div className="mt-0.5 mr-3">
                        {log.action === 'RESTOCK_REQUESTED' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                        {log.action === 'RESTOCK_APPROVED' && <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div></div>}
                        {log.action === 'QUANTITY_UPDATED' && <Activity className="w-4 h-4 text-blue-400" />}
                        {log.action === 'PRODUCT_ADDED' && <Package className="w-4 h-4 text-purple-400" />}
                     </div>
                     <div>
                       <p className="text-slate-300 text-sm">{log.details}</p>
                       <p className="text-xs text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString()} {log.user ? `· By ${log.user.name}` : ''}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-500 shadow-lg"
          />
        </div>
        
        {/* Inventory View Table */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          {loading ? (
             <div className="flex justify-center p-16">
               <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold rounded-tl-xl whitespace-nowrap">Product</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Price</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Quantity</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                    <th className="p-4 font-semibold text-right rounded-tr-xl whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredProducts.map((product) => {
                    const isCritical = product.quantity < 5;
                    const isLow = product.quantity < 10 && product.quantity >= 5;
                    const isHealthy = product.quantity >= 10;

                    return (
                      <tr key={product._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.category || 'General'}</p>
                        </td>
                        <td className="p-4 text-slate-300">₹{product.price.toFixed(2)}</td>
                        <td className="p-4 text-white">
                          <div className="flex items-center space-x-3 bg-slate-900/50 rounded-lg p-1 border border-slate-700/50 w-max">
                             <button 
                               onClick={() => handleQuickUpdateQuantity(product._id, product.quantity, -1)}
                               className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                             >-</button>
                             <span className="font-medium object-tabular-nums lg:text-lg min-w-[2ch] text-center">
                               {product.quantity}
                             </span>
                             <button 
                               onClick={() => handleQuickUpdateQuantity(product._id, product.quantity, 1)}
                               className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                             >+</button>
                          </div>
                        </td>
                        <td className="p-4">
                          {isCritical && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5"></span> Critical</span>}
                          {isLow && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1.5"></span> Low Stock</span>}
                          {isHealthy && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span> Healthy</span>}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleOpenRestockModal(product)}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 hover:border-slate-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                          >
                            Request Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400">
                        <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      <AIAssistantWidget />
      </main>

    </div>
  );
};

export default EmployeeDashboard;
