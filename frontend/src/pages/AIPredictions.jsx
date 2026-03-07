import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AIPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await api.get('/ai/predictions');
        setPredictions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching AI predictions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPredictions();
  }, []);

  const getBadgeStyle = (prediction) => {
    switch (prediction) {
      case 'Critical Stock':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'Low Stock Soon':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Stock Healthy':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center md:justify-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            AI Predictions
          </span>
        </h1>
        <p className="text-slate-400 text-lg">Predictive inventory forecasting and required actions</p>
      </header>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : !Array.isArray(predictions) || predictions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No products found in inventory to analyze.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700 text-slate-300">
                  <th className="py-4 px-6 font-semibold">Product Name</th>
                  <th className="py-4 px-6 font-semibold text-center">Current Quantity</th>
                  <th className="py-4 px-6 font-semibold">AI Prediction / Action</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((item, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-white">
                      {item.product}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBadgeStyle(item.prediction)}`}>
                        {item.prediction === 'Critical Stock' && (
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        )}
                        {item.prediction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPredictions;
