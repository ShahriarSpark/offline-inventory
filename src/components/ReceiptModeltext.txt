import React from 'react';
import { X, Download, Printer, FileText, Check, User } from 'lucide-react';
import { SaleItem, CustomerDetails } from '../types';
import { ReceiptData, downloadPDFReceipt, printPDFReceipt } from '../utils/pdfGenerator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesItems?: SaleItem[];
  receiptNumber: string;
  cashierName: string;
  completedSalesItems?: SaleItem[];
  customerDetails?: CustomerDetails;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  salesItems = [],
  receiptNumber,
  cashierName,
  completedSalesItems = [],
  customerDetails
}) => {
  if (!isOpen) return null;

  // Use completed sales items if available, otherwise use current sales items
  const itemsToDisplay = completedSalesItems.length > 0 ? completedSalesItems : salesItems;

  const totalAmount = itemsToDisplay.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = itemsToDisplay.reduce((sum, item) => sum + item.quantity, 0);
  const currentDate = new Date();
  
  const receiptData: ReceiptData = {
    receiptNumber,
    date: currentDate.toLocaleDateString(),
    time: currentDate.toLocaleTimeString(),
    items: itemsToDisplay.length > 0 ? itemsToDisplay.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unit: item.product.unit,
      sellpricePerUnit: item.product.sellpricePerUnit,
      totalPrice: item.totalPrice
    })) : [],
    totalAmount,
    totalItems,
    cashierName,
    storeName: 'FRIENDS IT ZONE',
    customer: customerDetails ? {
      name: customerDetails.name || 'Customer',
      mobile: customerDetails.mobile,
      email: customerDetails.email,
      address: customerDetails.address
    } : undefined
  };

  const handleDownload = async () => {
    await downloadPDFReceipt(receiptData);
  };

  const handlePrint = async () => {
    await printPDFReceipt(receiptData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-slate-700/50 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sale Completed!</h2>
                <p className="text-slate-400">Receipt generated successfully</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 mb-6">
              {/* Receipt Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">FRIENDS IT ZONE</h3>
                <p className="text-slate-400 text-sm">Grocery & Electronics Store</p>
                <p className="text-slate-400 text-xs mt-1">HARINAKUNDA UPAZILA MORE, MASTER MARKET 2</p>
                <p className="text-slate-400 text-xs">Phone: 01718000117, 01947533013</p>
                <div className="w-16 h-0.5 bg-emerald-400 mx-auto mt-2"></div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-slate-400">Receipt #:</p>
                  <p className="text-white font-medium">{receiptNumber}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date:</p>
                  <p className="text-white font-medium">{receiptData.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Time:</p>
                  <p className="text-white font-medium">{receiptData.time}</p>
                </div>
                <div>
                  <p className="text-slate-400">Cashier:</p>
                  <p className="text-white font-medium">{cashierName}</p>
                </div>
              </div>

              {/* Customer Details */}
              {customerDetails && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium text-sm">Customer Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Name:</p>
                      <p className="text-white font-medium">{customerDetails.name || 'Customer'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Mobile:</p>
                      <p className="text-white font-medium">{customerDetails.mobile}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Email:</p>
                      <p className="text-white font-medium">{customerDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Address:</p>
                      <p className="text-white font-medium">{customerDetails.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="border-t border-slate-700/50 pt-4 mb-4">
                <div className="grid grid-cols-4 gap-2 text-xs font-bold text-slate-400 mb-3">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Rate</span>
                  <span className="text-right">Amount</span>
                </div>
                
                <div className="space-y-2">
                  {itemsToDisplay.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 text-sm text-white">
                      <span className="truncate">{item.product.name}</span>
                      <span>{item.quantity} {item.product.unit}</span>
                      <span>{item.product.sellpricePerUnit}</span>
                      <span className="text-right">{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-slate-700/50 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total ({totalItems} items):</span>
                  <span className="text-emerald-400">{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-xs">Thank you for shopping at FRIENDS IT ZONE!</p>
                <p className="text-slate-400 text-xs">Visit us again for quality products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="bg-slate-800/20 border-t border-slate-700/50 p-6 flex-shrink-0">
          <div className="flex space-x-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-400 rounded-xl border border-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 rounded-xl border border-green-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <Printer className="w-5 h-5" />
              <span>Print Receipt</span>
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl border border-slate-600/50 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;