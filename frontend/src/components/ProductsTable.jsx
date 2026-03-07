import React, { useState } from 'react';
import api from '../services/api';

const ProductsTable = ({ products, onProductUpdated }) => {
  const [updatingId, setUpdatingId] = useState(null);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (id, val) => {
    setQuantities(prev => ({ ...prev, [id]: val }));
  };

  const handleUpdate = async (id) => {
    const newQuantity = quantities[id];
    if (newQuantity === undefined) return;
    
    setUpdatingId(id);
    try {
      await api.put(`/products/${id}`, { quantity: Number(newQuantity) });
      if (onProductUpdated) onProductUpdated('Quantity successfully updated!');
    } catch (err) {
      alert("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center text-slate-400">
        No products found in inventory. Add some to get started!
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700 text-slate-300">
              <th className="py-4 px-6 font-semibold">Product Name</th>
              <th className="py-4 px-6 font-semibold">Price</th>
              <th className="py-4 px-6 font-semibold">Stock Level</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const isLowStock = product.quantity < 10;
              return (
                <tr 
                  key={product._id} 
                  className={`border-b border-slate-700/50 transition-colors ${
                    isLowStock 
                      ? 'bg-red-500/5 hover:bg-red-500/10' 
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-white flex items-center">
                    {isLowStock && (
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    )}
                    {product.name}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    ₹{product.price ? product.price.toFixed(2) : "0.00"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold mr-3 ${
                        isLowStock 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {product.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 flex justify-end items-center space-x-2">
                    <input 
                      type="number"
                      min="0"
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="Qty"
                      value={quantities[product._id] !== undefined ? quantities[product._id] : product.quantity}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleUpdate(product._id)}
                      disabled={updatingId === product._id || quantities[product._id] === undefined || String(quantities[product._id]) === String(product.quantity)}
                      className="bg-slate-700 hover:bg-cyan-600 text-white p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-slate-700"
                      title="Update Quantity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
