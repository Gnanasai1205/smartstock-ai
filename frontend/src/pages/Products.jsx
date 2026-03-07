import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Clock, MapPin, Phone, User, Tag, DollarSign, Activity, Box, Trash2 } from 'lucide-react';
import api from '../services/api';

const ExpandedProductCard = ({ product, onDelete, onUpdateQuantity }) => {
  // Determine stock status and formatting
  const isCritical = product.quantity < (product.lowStockThreshold || 5);
  const isLow = product.quantity < (product.lowStockThreshold || 10);
  
  const statusColors = isCritical 
    ? 'text-red-400 bg-red-500/10 border-red-500/20' 
    : isLow 
      ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' 
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  const statusText = isCritical ? 'Critical Stock' : isLow ? 'Low Stock' : 'Healthy';
  
  // Calculate Profit Margin if cost Price exists
  const profitMargin = product.costPrice 
    ? (((product.price - product.costPrice) / product.price) * 100).toFixed(0) + '%'
    : 'N/A';
    
  // AI Mock Recommendations logic based on thresholds
  const aiRecommendation = isCritical 
    ? 'Immediate restock required (+50 units)' 
    : isLow 
      ? 'Schedule restock soon (+25 units)'
      : 'No action needed';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl mb-6 hover:border-slate-600 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Side - Identity & Core Info */}
        <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-slate-700 bg-slate-800/50">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
              <Package className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">{product.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${statusColors}`}>
                    {statusText}
                  </span>
                </div>
                <button 
                  onClick={() => onDelete(product._id, product.name)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Remove Product from Catalog"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3 text-sm text-slate-400 mb-3">
                <span className="flex items-center"><Tag className="w-3 h-3 mr-1" /> {product.category || 'General'}</span>
                <span className="flex items-center font-mono bg-slate-900 px-1.5 rounded text-slate-500 text-xs">
                  {product.sku || 'N/A'}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Metrics & Status */}
        <div className="lg:col-span-7 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Price</p>
            <p className="text-lg font-semibold text-white">₹{product.price.toFixed(2)}</p>
            {product.costPrice && (
              <p className="text-xs text-slate-400">Cost: ₹{product.costPrice.toFixed(2)}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</p>
            <div className="flex items-center space-x-3 bg-slate-900/80 rounded-lg p-1 border border-slate-700 w-max mt-1">
               <button 
                 onClick={() => onUpdateQuantity(product._id, product.quantity, -1)}
                 className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
               >-</button>
               <span className={`font-bold object-tabular-nums text-lg min-w-[2.5ch] text-center ${isCritical ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-white'}`}>
                 {product.quantity}
               </span>
               <button 
                 onClick={() => onUpdateQuantity(product._id, product.quantity, 1)}
                 className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
               >+</button>
            </div>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
            <p className="text-xs font-medium flex items-center text-purple-400 uppercase tracking-wider mb-1">
              <Activity className="w-3 h-3 mr-1" /> AI Recommendation
            </p>
            <p className="text-sm text-slate-300">{aiRecommendation}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Deep Dive Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-700 divide-y md:divide-y-0 md:divide-x divide-slate-700 bg-slate-900/30">
        
        {/* Inventory History */}
        <div className="p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-1.5" /> Inventory Details
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">Restock Threshold</span>
              <span className="text-white font-medium">{product.lowStockThreshold || 10} units</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Last Restocked</span>
              <span className="text-white">{new Date(product.lastRestocked || product.createdAt || Date.now()).toLocaleDateString()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Last Updated</span>
              <span className="text-white">System Admin</span>
            </li>
          </ul>
        </div>

        {/* Supplier Info */}
        <div className="p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
            <User className="w-4 h-4 mr-1.5" /> Supplier Details
          </h4>
          {product.supplier && product.supplier.name ? (
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-white">
                <User className="w-3.5 h-3.5 mr-2 text-slate-500" /> {product.supplier.name}
              </li>
              <li className="flex items-center text-slate-300">
                <Phone className="w-3.5 h-3.5 mr-2 text-slate-500" /> {product.supplier.contact || 'N/A'}
              </li>
              <li className="flex items-center text-slate-300">
                <MapPin className="w-3.5 h-3.5 mr-2 text-slate-500" /> {product.supplier.location || 'N/A'}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic">No supplier associated.</p>
          )}
        </div>

        {/* AI Insights & Finance */}
        <div className="p-4">
          <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1.5" /> Smart Insights
          </h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">Profit Margin</span>
              <span className="text-emerald-400 font-medium">{profitMargin}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Demand Trend</span>
              <span className="text-white">
                {product.quantity < 15 ? 'High (Moving Fast)' : 'Stable'}
              </span>
            </li>
             <li className="flex justify-between pt-1">
              <span className="text-slate-500 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-0.5" /> Total Asset Value</span>
              <span className="text-cyan-400 font-bold">₹{(product.price * product.quantity).toFixed(2)}</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to securely remove ${name} from the database? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/products/${id}`);
        if (res.data.success) {
          setProducts(products.filter(p => p._id !== id));
          showNotification(`${name} has been successfully deleted.`);
        }
      } catch (error) {
        console.error('Failed to delete product', error);
        showNotification(`Failed to delete ${name}`, 'error');
      }
    }
  };

  const handleUpdateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return; // Prevent negative stock

    try {
      const res = await api.put(`/products/${productId}`, { quantity: newQuantity });
      if (res.data.success) {
        setProducts(products.map(p => p._id === productId ? { ...p, quantity: newQuantity } : p));
        showNotification('Inventory amount updated');
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to update quantity', 'error');
    }
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await api.get('/products');
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching expanded catalog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <div className="container mx-auto pb-12 animate-in pt-4 relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <header className="mb-8 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center">
            <Box className="w-8 h-8 mr-3 text-cyan-500" />
            Expanded Product Catalog
          </h1>
          <p className="text-slate-400">Deep dive analytics and supplier metrics for all inventory assets</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 text-sm">
           <span className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium">
             {products.length} Total Items
           </span>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center shadow-xl">
          <Box className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">Inventory Empty</h2>
          <p className="text-slate-400">Add products from your dashboard to view expanded metrics here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <ExpandedProductCard 
              key={product._id} 
              product={product} 
              onDelete={handleDelete} 
              onUpdateQuantity={handleUpdateQuantity} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
