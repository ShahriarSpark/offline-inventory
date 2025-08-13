import React from 'react';
import { Download, Printer } from 'lucide-react';
import { SaleItem, CustomerDetails } from '../types';
import { ReceiptData, downloadPDFReceipt, printPDFReceipt } from '../utils/pdfGenerator';

interface ReceiptDownloaderProps {
  salesItems: SaleItem[];
  receiptNumber: string;
  cashierName?: string;
  customerDetails?: CustomerDetails;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  className?: string;
}

const ReceiptDownloader: React.FC<ReceiptDownloaderProps> = ({
  salesItems,
  receiptNumber,
  cashierName = 'System',
  customerDetails,
  showPrintButton = true,
  showDownloadButton = true,
  buttonSize = 'md',
  variant = 'default',
  className = ''
}) => {
  const totalAmount = salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = salesItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentDate = new Date();
  
  const receiptData: ReceiptData = {
    receiptNumber,
    date: currentDate.toLocaleDateString(),
    time: currentDate.toLocaleTimeString(),
    items: salesItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unit: item.product.unit,
      sellpricePerUnit: item.product.sellpricePerUnit,
      totalPrice: item.totalPrice
    })),
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
    try {
      await downloadPDFReceipt(receiptData);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const handlePrint = async () => {
    try {
      await printPDFReceipt(receiptData);
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Icon size classes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Variant classes
  const getVariantClasses = (type: 'download' | 'print') => {
    const baseClasses = `${sizeClasses[buttonSize]} rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2`;
    
    if (variant === 'outline') {
      return type === 'download' 
        ? `${baseClasses} border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white`
        : `${baseClasses} border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white`;
    }
    
    if (variant === 'minimal') {
      return type === 'download'
        ? `${baseClasses} text-blue-600 hover:text-blue-800 hover:bg-blue-50`
        : `${baseClasses} text-green-600 hover:text-green-800 hover:bg-green-50`;
    }
    
    // Default variant
    return type === 'download'
      ? `${baseClasses} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:scale-[1.02]`
      : `${baseClasses} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:scale-[1.02]`;
  };

  if (!showDownloadButton && !showPrintButton) {
    return null;
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {showDownloadButton && (
        <button
          onClick={handleDownload}
          className={getVariantClasses('download')}
          title="Download Receipt as PDF"
        >
          <Download className={iconSizes[buttonSize]} />
          <span>Download</span>
        </button>
      )}
      
      {showPrintButton && (
        <button
          onClick={handlePrint}
          className={getVariantClasses('print')}
          title="Print Receipt"
        >
          <Printer className={iconSizes[buttonSize]} />
          <span>Print</span>
        </button>
      )}
    </div>
  );
};

export default ReceiptDownloader;
