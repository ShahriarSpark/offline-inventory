import React, { useState, useEffect } from 'react';
import { CompletedReturn } from '../types';
import { getCompletedReturns } from '../utils/storage';
import { 
  CheckCircle, 
  Package, 
  User, 
  DollarSign,
  Calendar,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CompletedReturnsViewer: React.FC = () => {
  const [completedReturns, setCompletedReturns] = useState<CompletedReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination values
  const totalPages = Math.ceil(completedReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReturns = completedReturns.slice(startIndex, endIndex);

  useEffect(() => {
    loadCompletedReturns();
  }, []);

  const loadCompletedReturns = async () => {
    try {
      setLoading(true);
      const returns = await getCompletedReturns();
      setCompletedReturns(returns);
      // Reset to first page when data is reloaded
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to load completed returns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        pages.push(1);
        if (totalPages > 5) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page with context
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateReceipt = (completedReturn: CompletedReturn) => {
    const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completed Return Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .receipt-title { font-size: 18px; color: #666; margin: 10px 0; }
        .info-section { margin: 20px 0; }
        .info-title { font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .info-item { margin: 5px 0; }
        .financial-summary { background: #f3f4f6; padding: 20px; border-radius: 8px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .summary-total { border-top: 2px solid #ccc; padding-top: 8px; font-weight: bold; color: #059669; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Offline Shop Inventory</div>
        <div class="receipt-title">✅ COMPLETED RETURN RECEIPT</div>
        <div>Receipt #: ${completedReturn.id}</div>
    </div>
    
    <div class="info-section">
        <div class="info-title">Product Information</div>
        <div class="info-item"><strong>Product:</strong> ${completedReturn.productName}</div>
        <div class="info-item"><strong>Product ID:</strong> ${completedReturn.productID}</div>
        <div class="info-item"><strong>Quantity:</strong> ${completedReturn.quantityReturned} ${completedReturn.unit}</div>
        <div class="info-item"><strong>Unit Price:</strong> ${formatCurrency(completedReturn.sellpricePerUnit)}</div>
    </div>
    
    <div class="info-section">
        <div class="info-title">Customer Information</div>
        <div class="info-item"><strong>Name:</strong> ${completedReturn.customerName || 'N/A'}</div>
        <div class="info-item"><strong>Email:</strong> ${completedReturn.customerEmail || 'N/A'}</div>
        <div class="info-item"><strong>Mobile:</strong> ${completedReturn.customerMobile || 'N/A'}</div>
        <div class="info-item"><strong>Address:</strong> ${completedReturn.customerAddress || 'N/A'}</div>
    </div>
    
    <div class="info-section">
        <div class="info-title">Return Details</div>
        <div class="info-item"><strong>Return Date:</strong> ${formatDate(completedReturn.returnTimestamp)}</div>
        <div class="info-item"><strong>Approval Date:</strong> ${formatDate(completedReturn.approvalTimestamp)}</div>
        <div class="info-item"><strong>Approved By:</strong> ${completedReturn.approvedBy}</div>
        <div class="info-item"><strong>Reason:</strong> ${completedReturn.reason || 'N/A'}</div>
    </div>
    
    <div class="financial-summary">
        <div class="summary-row">
            <span>Original Refund Amount:</span>
            <span>${formatCurrency(completedReturn.originalRefund)}</span>
        </div>
        <div class="summary-row">
            <span>${completedReturn.compensationType === 'none' ? 'No Deduction' :
                   completedReturn.compensationType === 'percentage' ? `Restocking Fee (${completedReturn.compensationValue}%)` :
                   'Fixed Compensation'}:</span>
            <span style="color: #dc2626;">${completedReturn.restockingFee > 0 ? `-${formatCurrency(completedReturn.restockingFee)}` : '$0.00'}</span>
        </div>
        <div class="summary-row summary-total">
            <span>Final Refund Amount:</span>
            <span>${formatCurrency(completedReturn.finalRefund)}</span>
        </div>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>This return has been completed and logged in the system.</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completed-return-receipt-${completedReturn.productID}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading completed returns...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Completed Returns History</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>{completedReturns.length} total completed returns</span>
          </div>
          {completedReturns.length > 0 && (
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} • Showing {currentReturns.length} of {completedReturns.length}
            </div>
          )}
        </div>
      </div>

      {completedReturns.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Completed Returns</h3>
          <p className="text-gray-500">No returns have been approved and completed yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {currentReturns.map((completedReturn) => (
              <div key={completedReturn.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{completedReturn.productName}</h3>
                        <p className="text-sm text-gray-600">ID: {completedReturn.productID}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(completedReturn.finalRefund)}
                      </div>
                      <div className="text-sm text-gray-500">Final Refund</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">{completedReturn.customerName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">{completedReturn.quantityReturned} {completedReturn.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">{formatDate(completedReturn.approvalTimestamp)}</span>
                    </div>
                  </div>

                  {completedReturn.reason && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Return Reason</p>
                          <p className="text-sm text-yellow-700">{completedReturn.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Financial Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Original Refund:</span>
                        <span className="ml-2 font-medium">{formatCurrency(completedReturn.originalRefund)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {completedReturn.compensationType === 'none' ? 'No Deduction' :
                           completedReturn.compensationType === 'percentage' ? `Restocking Fee (${completedReturn.compensationValue}%)` :
                           'Fixed Compensation'}:
                        </span>
                        <span className="ml-2 font-medium text-red-600">
                          {completedReturn.restockingFee > 0 ? `-${formatCurrency(completedReturn.restockingFee)}` : '$0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Approved by: {completedReturn.approvedBy} • {formatDate(completedReturn.approvalTimestamp)}
                    </div>
                    <button
                      onClick={() => generateReceipt(completedReturn)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => goToPage(page as number)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, completedReturns.length)} of {completedReturns.length} results
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompletedReturnsViewer;
