import React, { useState, useEffect } from 'react';
import { X, User, Shield, Eye, EyeOff, Edit3, Save, Users, Crown, Briefcase, User as UserIcon, Lock, Calendar, Key } from 'lucide-react';
import { getAllUsers, updateUser } from '../utils/auth';
import { User as UserType } from '../types';
import { apiService } from '../utils/apiService';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onUserUpdate?: (updatedUser: UserType) => void;
}

const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'users'>('profile');
  const [users, setUsers] = useState<UserType[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [isOpen, currentUser]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const handleProfileUpdate = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      const updatedUser = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      const success = await updateUser(currentUser.id, updatedUser);
      if (success) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
        // Update current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      // First verify the current password
      const verifyResult = await apiService.verifyAdminPassword(currentUser.email, formData.currentPassword);
      if (!verifyResult.success) {
        setError('Current password is incorrect');
        return;
      }

      // Update the password using the new API endpoint
      const updateResult = await apiService.updateAdminPassword(currentUser.id, formData.newPassword);
      if (updateResult.success) {
        setSuccess('Password changed successfully');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Update current user in localStorage and sessionStorage
        const updatedUser = {
          ...currentUser,
          password: formData.newPassword
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        sessionStorage.setItem('friends_it_zone_auth', JSON.stringify(updatedUser));
        
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      } else {
        setError('Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setError('Failed to change password');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'seller': return Briefcase;
      default: return UserIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'seller': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getRoleBadge = (role: string) => {
    const Icon = getRoleIcon(role);
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{role}</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Administrator Panel</h2>
                <p className="text-slate-400">Manage profile and view all users</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Users ({users.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <User className="w-5 h-5 text-cyan-400" />
                    <span>Profile Information</span>
                  </h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
                      />
                    ) : (
                      <p className="text-white font-medium">{currentUser.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
                      />
                    ) : (
                      <p className="text-white font-medium">{currentUser.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Role</label>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(currentUser.role)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">User ID</label>
                    <p className="text-white font-mono text-sm">{currentUser.id}</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={handleProfileUpdate}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 transition-all duration-300"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Password Change */}
              <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2 mb-4">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <span>Change Password</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handlePasswordChange}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>All Users</span>
                </h3>
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-all duration-300"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
                </button>
              </div>

              {/* Users List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/10 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{user.name}</h4>
                          <p className="text-slate-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">ID:</span>
                        <span className="text-white font-mono">{user.id}</span>
                      </div>
                      
                      {showPasswords && (
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Password:</span>
                          <span className="text-white font-mono bg-slate-800/50 px-2 py-1 rounded">
                            {user.password}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Points:</span>
                        <span className="text-white">{user.points || 0}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Purchases:</span>
                        <span className="text-white">{user.purchaseHistory?.length || 0}</span>
                      </div>
                    </div>

                    {user.id !== currentUser.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700/30">
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
                  <p className="text-slate-400">No users have been created yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div className="p-6 border-t border-slate-700/30">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfileModal; 