import React, { useState, useEffect } from 'react';
import { Search, Shield, CheckCircle, XCircle, Calendar, Package, User, FileCheck } from 'lucide-react';
import { searchWarrantyByQuery, approveWarrantyClaim, getWarrantyApprovals, getProducts } from '../utils/storage';
import SaleDetailModal from './SaleDetailModal';

interface WarrantyItem {
  saleId: string;
  productId: string;
  productName: string;
  customerId: string;
  customerEmail: string;
  quantity: number;
  sellpricePerUnit: number;
  totalPrice: number;
  dateOfSale: string;
  warrantyEndDate: string;
  warrantyStatus: 'active' | 'expired';
  daysRemaining: number;
  timestamp: string;
}

interface WarrantyApproval {
  approvalId: string;
  saleId: string;
  productId: string;
  dateOfSale: string;
  warrantyEndDate: string;
  approvalDate: string;
  approvedBy: string;
  notes: string;
}

interface WarrantyManagementProps {
  user: any;
  onClose?: () => void;
}

const WarrantyManagement: React.FC<WarrantyManagementProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WarrantyItem[]>([]);
  const [approvals, setApprovals] = useState<WarrantyApproval[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyItem | null>(null);
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<WarrantyItem | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'approvals'>('search');

  useEffect(() => {
    loadApprovals();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadApprovals = async () => {
    try {
      const result = await getWarrantyApprovals();
      if (result.success && result.approvals) {
        setApprovals(result.approvals);
      }
    } catch (error) {
      console.error('Error loading warranty approvals:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await searchWarrantyByQuery(searchQuery.trim());
      if (result.success && result.warranties) {
        setSearchResults(result.warranties);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching warranty:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApproveWarranty = (warranty: WarrantyItem) => {
    setSelectedWarranty(warranty);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleViewSaleDetails = (warranty: WarrantyItem) => {
    setSelectedSaleForDetails(warranty);
    setShowSaleDetailModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedWarranty) return;

    try {
      const approvalData = {
        saleId: selectedWarranty.saleId,
        productId: selectedWarranty.productId,
        dateOfSale: selectedWarranty.dateOfSale,
        warrantyEndDate: selectedWarranty.warrantyEndDate,
        approvedBy: user.id,
        notes: approvalNotes
      };

      const result = await approveWarrantyClaim(approvalData);
      if (result.success) {
        setShowApprovalModal(false);
        setSelectedWarranty(null);
        setApprovalNotes('');
        await loadApprovals();
        // Show success notification
        alert('Warranty claim approved successfully!');
      } else {
        alert('Failed to approve warranty claim');
      }
    } catch (error) {
      console.error('Error approving warranty:', error);
      alert('Failed to approve warranty claim');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle className="w-3 h-3" />
          <span>In Warranty</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          <XCircle className="w-3 h-3" />
          <span>Out of Warranty</span>
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Warranty Management</h2>
            <p className="text-slate-400">Search and manage product warranties</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'search'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Search Warranty
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'approvals'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved Claims
          </button>
        </div>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <>
          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter Product ID, Customer Mobile Number, or Email Address..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
              <h3 className="text-xl font-bold text-white mb-4">
                Warranty Information ({searchResults.length} found)
              </h3>
              <div className="space-y-4">
                {searchResults.map((warranty) => (
                  <div
                    key={warranty.saleId}
                    className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewSaleDetails(warranty)}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Product Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-semibold">{warranty.productName}</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          <p>Product ID: <span className="text-white">{warranty.productId}</span></p>
                          <p>Sale ID: <span className="text-white">{warranty.saleId}</span></p>
                          <p>Quantity: <span className="text-white">{warranty.quantity}</span></p>
                          <p>Price: <span className="text-cyan-400">৳{warranty.totalPrice.toLocaleString()}</span></p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-green-400" />
                          <span className="text-white font-semibold">Customer Information</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          <p>Customer ID: <span className="text-white">{warranty.customerId}</span></p>
                          <p>Email: <span className="text-white">{warranty.customerEmail}</span></p>
                        </div>
                      </div>

                      {/* Warranty Info */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-semibold">Warranty Status</span>
                        </div>
                        <div className="space-y-2">
                          {getStatusBadge(warranty.warrantyStatus)}
                          <div className="text-sm text-slate-400">
                            <p>Sale Date: <span className="text-white">{new Date(warranty.dateOfSale).toLocaleDateString()}</span></p>
                            <p>Warranty Ends: <span className="text-white">{new Date(warranty.warrantyEndDate).toLocaleDateString()}</span></p>
                            {warranty.warrantyStatus === 'active' && (
                              <p>Days Remaining: <span className="text-green-400 font-medium">{warranty.daysRemaining}</span></p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSaleDetails(warranty);
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                          >
                            <Package className="w-4 h-4" />
                            <span>View Sale Details</span>
                          </button>
                          
                          {warranty.warrantyStatus === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveWarranty(warranty);
                              }}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve Warranty Claim</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-12 text-center shadow-lg shadow-cyan-500/10">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Warranty Found</h3>
              <p className="text-slate-400">No warranty information found for: {searchQuery}</p>
              <p className="text-slate-500 text-sm mt-2">Try searching with Product ID, Customer Mobile Number, or Email Address</p>
            </div>
          )}
        </>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-green-400" />
            <span>Approved Warranty Claims ({approvals.length})</span>
          </h3>
          
          {approvals.length > 0 ? (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.approvalId}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Product ID</p>
                      <p className="text-white font-medium">{approval.productId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Sale Date</p>
                      <p className="text-white font-medium">{new Date(approval.dateOfSale).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Approval Date</p>
                      <p className="text-green-400 font-medium">{new Date(approval.approvalDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Approved By</p>
                      <p className="text-white font-medium">{approval.approvedBy}</p>
                    </div>
                    {approval.notes && (
                      <div className="lg:col-span-4">
                        <p className="text-sm text-slate-400">Notes</p>
                        <p className="text-slate-300">{approval.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Approved Claims</h3>
              <p className="text-slate-400">No warranty claims have been approved yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedWarranty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-green-500/20 rounded-2xl max-w-md w-full shadow-2xl shadow-green-500/10">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/20 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Approve Warranty Claim</h3>
                  <p className="text-slate-400 text-sm">Confirm warranty approval</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-800/30 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="text-slate-400">Product:</span> 
                  <span className="text-white ml-2">{selectedWarranty.productName}</span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-400">Product ID:</span> 
                  <span className="text-white ml-2">{selectedWarranty.productId}</span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-400">Customer:</span> 
                  <span className="text-white ml-2">{selectedWarranty.customerEmail}</span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-400">Warranty Valid Until:</span> 
                  <span className="text-green-400 ml-2">{new Date(selectedWarranty.warrantyEndDate).toLocaleDateString()}</span>
                </p>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Approval Notes (Optional)</label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Enter any notes about this warranty approval..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 backdrop-blur-sm resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 border border-slate-500/30 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-slate-900 font-semibold rounded-lg transition-all duration-300"
                >
                  Approve Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSaleForDetails && (
        <SaleDetailModal
          isOpen={showSaleDetailModal}
          onClose={() => {
            setShowSaleDetailModal(false);
            setSelectedSaleForDetails(null);
          }}
          saleItem={{
            saleId: selectedSaleForDetails.saleId,
            productId: selectedSaleForDetails.productId,
            productName: selectedSaleForDetails.productName,
            quantity: selectedSaleForDetails.quantity,
            sellpricePerUnit: selectedSaleForDetails.sellpricePerUnit,
            totalPrice: selectedSaleForDetails.totalPrice,
            unit: 'pcs', // Default unit if not available
            dateOfSale: selectedSaleForDetails.dateOfSale,
            customerName: selectedSaleForDetails.customerId, // Using customerId as name fallback
            customerEmail: selectedSaleForDetails.customerEmail,
            customerMobile: '', // Will be populated from search query if mobile was used
            customerAddress: '', // Will be populated if available
            soldByEmail: '', // Will be populated if available
            warrantyEndDate: selectedSaleForDetails.warrantyEndDate,
            timestamp: selectedSaleForDetails.timestamp
          }}
          products={products}
        />
      )}
    </div>
  );
};

export default WarrantyManagement;
