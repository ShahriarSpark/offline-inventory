import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Edit3, Trash2, Crown, Briefcase, User } from 'lucide-react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../utils/auth';
import { User as UserType } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'admin' | 'seller'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer'
    });
    setError('');
    setSuccess('');
    setShowCreateForm(false);
    setEditingUser(null);
  };

  const handleCreateUser = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      const success = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        points: 0,
        purchaseHistory: []
      });
      
      if (success) {
        setSuccess(`${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} account created successfully`);
        await loadUsers();
        resetForm();
      } else {
        setError('User with this email already exists');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setError('Failed to create user');
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show existing password
      role: user.role
    });
    setShowCreateForm(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        // Only update password if provided
        ...(formData.password.trim() && { password: formData.password })
      };

      const success = await updateUser(editingUser.id, userData);
      if (success) {
        setSuccess(`User ${formData.name} updated successfully`);
        await loadUsers();
        resetForm();
      } else {
        setError('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (user: UserType) => {
    if (user.id === currentUser.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        const success = await deleteUser(user.id);
        if (success) {
          setSuccess(`User ${user.name} deleted successfully`);
          await loadUsers();
        } else {
          setError('Failed to delete user');
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        setError('Failed to delete user');
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'seller': return Briefcase;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'seller': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
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
                <Users className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-slate-400">Manage user accounts and roles</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 transition-all duration-300"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Success/Error Messages */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {showCreateForm && (
            <div>
              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 mb-4">
                <p className="font-medium mb-2">🛡️ Role Permissions Summary:</p>
                <div className="space-y-1 text-xs">
                  <p><span className="text-red-400 font-semibold">Admin:</span> Full system access + User Management + Data Clear</p>
                  <p><span className="text-blue-400 font-semibold">Seller:</span> Dashboard access (Products, Sales, Purchases) - NO User Management</p>
                  <p><span className="text-green-400 font-semibold">Customer:</span> Shopping, Cart, Profile only - NO Dashboard access</p>
                </div>
                <p className="text-xs mt-2 text-slate-500">
                  ⚠️ Only Admins can access this User Management section
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  >
                    <option value="customer" className="bg-slate-800">Customer</option>
                    <option value="seller" className="bg-slate-800">Seller</option>
                    <option value="admin" className="bg-slate-800">Admin</option>
                  </select>
                </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg border border-slate-600/50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={editingUser ? handleUpdateUser : handleCreateUser}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">All Users ({users.length})</h3>
            
            {users.map(user => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div
                  key={user.id}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                      <RoleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{user.name}</h4>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded border ${getRoleColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {user.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg border border-blue-500/30 transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border-t border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              <p>Role Permissions:</p>
              <p className="text-xs mt-1">
                <span className="text-red-400">Admin:</span> Full access including Data Clear • 
                <span className="text-blue-400 ml-2">Seller:</span> Dashboard access (no Data Clear) • 
                <span className="text-green-400 ml-2">Customer:</span> Shopping only
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-lg border border-slate-600/50 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;