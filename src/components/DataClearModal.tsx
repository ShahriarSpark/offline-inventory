import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Shield } from 'lucide-react';
import { apiService } from '../utils/apiService';

interface DataClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
}

const DataClearModal: React.FC<DataClearModalProps> = ({
  isOpen,
  onClose,
  adminEmail
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Verify admin password using the new API endpoint
      const result = await apiService.verifyAdminPassword(adminEmail, password);
      if (result.success) {
        // If password is correct, proceed with data clearing
        const clearResult = await apiService.clearAllData();
        if (clearResult.success) {
          setSuccess('✅ All data has been successfully cleared.');
        } else {
          setError('Failed to clear all data.');
        }
        setPassword('');
        setLoading(false);
        // Optionally close modal after a delay
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      } else {
        setError('Incorrect password. Access denied.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Password verification or data clear failed:', error);
      setError('Incorrect password or failed to clear data.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl max-w-md w-full shadow-2xl shadow-red-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">⚠️ DANGER ZONE</h2>
                <p className="text-red-400">Admin Authentication Required</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-red-400 font-bold mb-2">⚠️ CRITICAL WARNING</h3>
                <p className="text-white text-sm mb-2">
                  This action will <strong>PERMANENTLY DELETE</strong> all system data:
                </p>
                <ul className="text-slate-300 text-sm space-y-1 ml-4">
                  <li>• All product inventory</li>
                  <li>• All sales records</li>
                  <li>• All purchase logs</li>
                  <li>• All return records</li>
                  <li>• All categories</li>
                  <li>• All user purchase histories</li>
                </ul>
                <p className="text-red-400 text-sm mt-3 font-bold">
                  🚨 THIS CANNOT BE UNDONE! 🚨
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Enter Admin Password to Confirm
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Admin password required"
                className="w-full px-4 py-3 bg-white/10 border border-red-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50 transition-all"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm mt-2">
                {success}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-red-500/30 p-6">
          <div className="flex space-x-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={loading || !password.trim()}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Trash2 className="w-5 h-5" />
              <span>{loading ? 'Clearing...' : 'CLEAR ALL DATA'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataClearModal;