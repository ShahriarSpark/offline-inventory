import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  Users,
  RefreshCw,
  AlertCircle,
  Filter,
  Search,
  History
} from 'lucide-react';
import { ReturnRecord } from '../types';
import { getReturnLogs, deleteReturn } from '../utils/storage';
import ReturnApprovalModal from './ReturnApprovalModal';
import CompletedReturnsViewer from './CompletedReturnsViewer';

const Return_approved: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<ReturnRecord | null>(null);
  const [currentView, setCurrentView] = useState<'pending' | 'completed'>('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load returns data
  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const returnData = await getReturnLogs();
      setReturns(returnData);
      setError('');
    } catch (err) {
      console.error('Failed to load returns:', err);
      setError('Failed to load return requests');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Enhanced refresh function
  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    await loadReturns();
  };

  // Handle approve return - opens modal
  const handleApprove = async (returnId: string) => {
    try {
      // Find the return item by ID
      const returnItem = returns.find(item => 
        (item.id || item.productID) === returnId
      );
      
      if (returnItem) {
        setSelectedReturnItem(returnItem);
        setShowApprovalModal(true);
      } else {
        setNotification({
          message: 'Return item not found',
          type: 'error'
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Failed to open approval modal:', err);
      setNotification({
        message: 'Failed to open approval modal',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle when return is approved from modal
  const handleReturnApproved = (returnId: string) => {
    // Remove the return from the local state to update UI immediately
    setReturns(prevReturns => 
      prevReturns.filter(returnItem => 
        (returnItem.id || returnItem.productID) !== returnId
      )
    );
    
    setNotification({
      message: `Return request has been approved and processed successfully`,
      type: 'success'
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle reject return
  const handleReject = async (returnId: string) => {
    try {
      // Show confirmation dialog
      const confirmReject = window.confirm(
        'Are you sure you want to reject this return request? This will permanently remove it from the database.'
      );
      
      if (!confirmReject) {
        return; // User cancelled the action
      }

      // Delete the return from the database
      const success = await deleteReturn(returnId);
      
      if (success) {
        // Remove the return from the local state to update UI immediately
        setReturns(prevReturns => 
          prevReturns.filter(returnItem => 
            (returnItem.id || returnItem.productID) !== returnId
          )
        );
        
        setNotification({
          message: `Return request has been rejected and removed from the database`,
          type: 'success'
        });
      } else {
        throw new Error('Failed to delete return from database');
      }
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (err) {
      console.error('Failed to reject return:', err);
      setNotification({
        message: 'Failed to reject return request. Please try again.',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Filter returns based on search term and status
  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = 
      returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.productID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.adminId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customerMobile?.toLowerCase().includes(searchTerm.toLowerCase());

    // For now, we'll treat all returns as 'pending' since there's no status field
    // You might need to add a status field to your ReturnRecord interface
    const matchesStatus = statusFilter === 'all' || statusFilter === 'pending';

    return matchesSearch && matchesStatus;
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-lg sm:text-xl text-gray-600">Loading return requests...</span>
          </div>
          <p className="text-sm text-gray-500">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          {/* Mobile-first header with stacked layout */}
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Title Section */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {currentView === 'pending' ? 'Return Management' : 'Completed Returns History'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {currentView === 'pending' 
                  ? 'Review and manage product return requests' 
                  : 'View history of approved and completed returns'
                }
              </p>
            </div>
            
            {/* View Toggle Buttons - Mobile optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <button
                onClick={() => setCurrentView('pending')}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-4 sm:py-2 rounded-lg font-medium transition-colors min-h-[48px] sm:min-h-[40px] ${
                  currentView === 'pending'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="text-sm sm:text-base">Pending Returns</span>
                {currentView === 'pending' && filteredReturns.length > 0 && (
                  <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full font-semibold">
                    {filteredReturns.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setCurrentView('completed')}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-4 sm:py-2 rounded-lg font-medium transition-colors min-h-[48px] sm:min-h-[40px] ${
                  currentView === 'completed'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <History className="w-5 h-5" />
                <span className="text-sm sm:text-base">Completed Returns</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification - Mobile optimized */}
        {notification && (
          <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Conditional View Rendering */}
        {currentView === 'pending' ? (
          <>
            {/* Filters and Search - Mobile optimized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[48px] sm:min-h-[40px]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Filter Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Status Filter */}
                  <div className="relative flex-1 sm:flex-none sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full pl-10 pr-8 py-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base appearance-none min-h-[48px] sm:min-h-[40px]"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[40px]"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm sm:text-base">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                </div>

                {/* Search Results Counter */}
                {searchTerm && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {filteredReturns.length === 0 ? 'No returns found' : 
                       `${filteredReturns.length} return${filteredReturns.length === 1 ? '' : 's'} found`}
                    </span>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm px-2 py-1 rounded"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message - Mobile optimized */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Error Loading Returns</h4>
                    <p className="text-sm text-red-700 break-words">{error}</p>
                    <button
                      onClick={loadReturns}
                      className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Returns List */}
            {filteredReturns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                <Package className="w-16 h-16 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-lg font-medium text-gray-900 mb-2">No Return Requests</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No return requests match your current filters. Try adjusting your search criteria.'
                    : 'No return requests have been submitted yet. When customers submit returns, they will appear here.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReturns.map((returnItem) => (
                  <div key={returnItem.id || returnItem.productID} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    {/* Mobile-first Card Layout */}
                    <div className="space-y-4">
                      {/* Product Header - Always visible */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Product</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-1 break-words">
                            {returnItem.productName}
                          </h3>
                          <p className="text-sm text-gray-600">ID: {returnItem.productID}</p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex-shrink-0 ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>

                      {/* Financial Info - Prominent on mobile */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">Refund Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Quantity</p>
                            <p className="font-medium">{returnItem.quantityReturned} {returnItem.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Unit Price</p>
                            <p className="font-medium">{formatCurrency(returnItem.sellpricePerUnit)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-600">Total Refund</p>
                            <p className="font-semibold text-green-600 text-lg">
                              {formatCurrency(returnItem.totalRefund)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Customer Info - Collapsible on mobile */}
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">Customer Information</span>
                          </div>
                          <div className="transform group-open:rotate-180 transition-transform">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </summary>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-gray-600">Name</p>
                              <p className="font-medium">{returnItem.customerName || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Email</p>
                              <p className="font-medium break-all">{returnItem.customerEmail || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Mobile</p>
                              <p className="font-medium">{returnItem.customerMobile || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Address</p>
                              <p className="font-medium">{returnItem.customerAddress || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </details>

                      {/* Admin & Date Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(returnItem.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Admin: {returnItem.adminId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {returnItem.reason && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium text-amber-800">Return Reason:</span>
                              <p className="text-sm text-amber-700 mt-1">{returnItem.reason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Mobile optimized with better touch targets */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleApprove(returnItem.id || returnItem.productID)}
                          className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-medium shadow-sm min-h-[48px] sm:min-h-[44px] text-base sm:text-sm"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Approve Return</span>
                        </button>
                        
                        <button
                          onClick={() => handleReject(returnItem.id || returnItem.productID)}
                          className="flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors font-medium border-2 border-red-600 hover:border-red-700 shadow-sm min-h-[48px] sm:min-h-[44px] text-base sm:text-sm"
                          title="Reject and permanently remove this return request"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Reject Return</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Stats - Mobile optimized */}
            {filteredReturns.length > 0 && (
              <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Total Returns</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{filteredReturns.length}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Package className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Items Returned</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      {filteredReturns.reduce((sum, item) => sum + item.quantityReturned, 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100 sm:col-span-1 col-span-1">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Total Refund</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-red-600 break-words">
                      {formatCurrency(filteredReturns.reduce((sum, item) => sum + item.totalRefund, 0))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Completed Returns View */
          <CompletedReturnsViewer />
        )}
      </div>

      {/* Return Approval Modal */}
      {selectedReturnItem && (
        <ReturnApprovalModal
          returnItem={selectedReturnItem}
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedReturnItem(null);
          }}
          onApproved={handleReturnApproved}
        />
      )}
    </div>
  );
};

export default Return_approved;
