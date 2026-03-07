import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  User, Users, Bell, BrainCircuit, Box, Webhook, Database, 
  Save, CheckCircle, UploadCloud, ShieldAlert, Key, DownloadCloud
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [notification, setNotification] = useState(null);
  
  // Fake state to simulate form updates
  const [isSaving, setIsSaving] = useState(false);

  // Real Database state for Users
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Data management state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef(null);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const resp = await api.get('/admin/export-inventory', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory-export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showNotification('Inventory exported successfully!');
    } catch (err) {
      console.error(err);
      showNotification('Failed to export inventory', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    try {
      const resp = await api.post('/admin/import-inventory', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showNotification(resp.data.message || 'File imported successfully!');
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Failed to import file', 'error');
    } finally {
      setIsImporting(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const resp = await api.post('/admin/trigger-backup');
      showNotification(resp.data.message || 'Backup completed successfully!');
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || 'Failed to trigger backup', 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team') {
       fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (error) {
       console.error("Failed to load users", error);
       showNotification('Failed to load user list', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showNotification('User role updated successfully!');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to update user role", error);
      showNotification(error.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to completely remove this user's access?")) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      showNotification('User removed successfully!');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to remove user", error);
      showNotification(error.response?.data?.message || 'Failed to remove user', 'error');
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFakeSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showNotification('Settings updated successfully!');
    }, 800);
  };

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Configuration', icon: BrainCircuit },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="relative animate-in">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transition-all transform ${
          notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          System Settings
        </h1>
        <p className="text-slate-400">Configure your application preferences, organization data, and API links.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 shadow-xl space-y-1 sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <tab.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Region */}
        <div className="flex-1 min-w-0">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Personal Information</h2>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8 items-center md:items-start">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-slate-800 shadow-xl flex items-center justify-center text-3xl font-bold text-slate-300 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8B93&color=fff&size=150" alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <UploadCloud className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                    <input type="text" defaultValue="Admin User" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                    <input type="email" defaultValue="admin@smartstock.ai" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Security</h2>
              <form onSubmit={handleFakeSave} className="space-y-4 max-w-md">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                    <input type="password" placeholder="New Password" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  
                  <div className="pt-6">
                    <button type="submit" disabled={isSaving} className="flex items-center bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg border border-cyan-500/50 transition-all font-medium disabled:opacity-50">
                      {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span> : <Save className="w-4 h-4 mr-2" />}
                      {isSaving ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
              </form>
            </div>
          )}

          {/* Team Management Tab */}
          {activeTab === 'team' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
               <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white mb-1">Team Roles & Access</h2>
                   <p className="text-sm text-slate-400">Manage who can view and edit inventory.</p>
                 </div>
                 <button className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors border border-indigo-500/50">
                   <User className="w-4 h-4 mr-1.5" /> Invite Member
                 </button>
               </div>

               <div className="overflow-x-auto rounded-lg border border-slate-700">
                 <table className="w-full text-left bg-slate-900/50">
                    <thead className="bg-slate-900 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-sm">
                      {isLoadingUsers ? (
                         <tr>
                           <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                              <div className="flex justify-center items-center">
                                <span className="w-5 h-5 border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin mr-3"></span>
                                Loading active staff members...
                              </div>
                           </td>
                         </tr>
                      ) : users.map(user => (
                        <tr key={user._id} className="hover:bg-slate-800/80 transition-colors">
                          <td className="px-4 py-3 flex flex-col">
                             <span className="text-white font-medium">{user.name}</span>
                             <span className="text-slate-500 text-xs">{user.email}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select 
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="bg-slate-800 border border-slate-600 rounded text-slate-300 text-xs px-2 py-1 outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                            >
                              <option value="admin">Admin</option>
                              <option value="employee">Staff</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                             {user.isApproved ? (
                               <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">Active</span>
                             ) : (
                               <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider">Pending</span>
                             )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-300 text-xs transition-colors p-1"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!isLoadingUsers && users.length === 0 && (
                         <tr>
                           <td colSpan="4" className="px-4 py-6 text-center text-slate-500">No external users found.</td>
                         </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Alert Preferences</h2>
               
               <div className="space-y-6 max-w-2xl">
                 <div className="flex items-start justify-between">
                   <div className="pr-4">
                     <h3 className="text-white font-medium flex items-center mb-1">
                       <ShieldAlert className="w-4 h-4 text-orange-400 mr-2" /> 
                       Low Stock UI Alerts
                     </h3>
                     <p className="text-sm text-slate-400">Show flashing red and orange badges inside the main application dashboards when stock crosses threshold lines.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                     <input type="checkbox" className="sr-only peer" defaultChecked />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                   </label>
                 </div>

                 <div className="flex items-start justify-between pt-4 border-t border-slate-700/50">
                   <div className="pr-4">
                     <h3 className="text-white font-medium flex items-center mb-1">
                       <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" /> 
                       AI Restock Request Approvals
                     </h3>
                     <p className="text-sm text-slate-400">Notify floor staff automatically when their restock requests are approved by an Admin.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                     <input type="checkbox" className="sr-only peer" defaultChecked />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                   </label>
                 </div>

                 <div className="flex items-start justify-between pt-4 border-t border-slate-700/50">
                   <div className="pr-4">
                     <h3 className="text-white font-medium flex items-center mb-1">
                       Email Notifications
                     </h3>
                     <p className="text-sm text-slate-400">Receive an End-Of-Day digest containing critical stock warnings via email.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                     <input type="checkbox" className="sr-only peer" />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                   </label>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-700">
                  <button onClick={handleFakeSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Save Preferences
                  </button>
               </div>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === 'ai' && (
             <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Artificial Intelligence Configuration</h2>
               
               <div className="space-y-8 max-w-2xl">
                 
                 <div className="flex items-start justify-between">
                   <div className="pr-4">
                     <h3 className="text-white font-medium flex items-center mb-1">
                       <BrainCircuit className="w-4 h-4 text-purple-400 mr-2" /> 
                       AI Predictions Engine
                     </h3>
                     <p className="text-sm text-slate-400">Enable Llama-3.3-70b background scans to evaluate stock velocity and predict demand shortages.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                     <input type="checkbox" className="sr-only peer" defaultChecked />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                   </label>
                 </div>

                 <div className="flex items-start justify-between">
                   <div className="pr-4">
                     <h3 className="text-white font-medium mb-1">Auto-Restock Suggestions</h3>
                     <p className="text-sm text-slate-400">Allow AI to calculate optimal reorder quantities based on low-stock thresholds.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                     <input type="checkbox" className="sr-only peer" defaultChecked />
                     <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                   </label>
                 </div>

                 <div className="pt-6 border-t border-slate-700/50">
                   <label className="block text-sm font-medium text-white mb-2">Global Low Stock Alert Threshold</label>
                   <p className="text-xs text-slate-400 mb-3">If a product does not have a custom threshold, the AI engine will use this floor to mark it as Low Stock.</p>
                   <div className="flex items-center max-w-xs">
                     <input type="number" defaultValue={10} min={1} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500" />
                     <span className="ml-3 text-slate-400 font-medium">units</span>
                   </div>
                 </div>

                  <div className="pt-6">
                    <button onClick={handleFakeSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Update AI Parameters
                    </button>
                  </div>
               </div>
             </div>
          )}



          {/* Data Management Tab */}
          {activeTab === 'data' && (
             <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Data Exports & Backups</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                 <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col items-start border-l-4 border-l-emerald-500">
                   <DownloadCloud className="w-8 h-8 text-emerald-400 mb-3" />
                   <h3 className="text-white font-bold mb-1">Export Inventory (CSV)</h3>
                   <p className="text-sm text-slate-400 mb-4 flex-1">Download your entire product ledger including quantities, SKUs, suppliers, and assigned values.</p>
                   <button onClick={handleExportCSV} disabled={isExporting} className="w-full flex items-center justify-center bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-medium py-2 rounded-lg transition-colors text-sm disabled:opacity-50">
                     {isExporting ? <span className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mr-2"></span> : null}
                     {isExporting ? 'Exporting...' : 'Download .CSV'}
                   </button>
                 </div>

                 <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col items-start border-l-4 border-l-blue-500 relative">
                   <UploadCloud className="w-8 h-8 text-blue-400 mb-3" />
                   <h3 className="text-white font-bold mb-1">Bulk Import Products</h3>
                   <p className="text-sm text-slate-400 mb-4 flex-1">Upload a standardized CSV file to rapidly onboard new pallets or overwrite existing stock.</p>
                   <input 
                     type="file" 
                     accept=".csv" 
                     className="hidden" 
                     ref={fileInputRef}
                     onChange={handleImportCSV}
                   />
                   <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="w-full flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-medium py-2 rounded-lg transition-colors text-sm disabled:opacity-50">
                     {isImporting ? <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mr-2"></span> : null}
                     {isImporting ? 'Uploading...' : 'Upload File'}
                   </button>
                 </div>

                 <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col items-start md:col-span-2 border-l-4 border-l-orange-500">
                   <Database className="w-8 h-8 text-orange-400 mb-3" />
                   <h3 className="text-white font-bold mb-1">Trigger Cloud Backup</h3>
                   <p className="text-sm text-slate-400 mb-4">Manually trigger a full snapshot backup of all databases (Users, Inventory, Logs) to cold storage.</p>
                   <button onClick={handleTriggerBackup} disabled={isBackingUp} className="flex items-center justify-center bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 font-medium px-6 py-2 rounded-lg transition-colors text-sm disabled:opacity-50">
                     {isBackingUp ? <span className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mr-2"></span> : null}
                     {isBackingUp ? 'Snapshotting Database...' : 'Snapshot Database'}
                   </button>
                 </div>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
