import React from 'react';
import { Download, Printer } from 'lucide-react';
import { SaleItem, CustomerDetails } from '../types';
import { ReceiptData, downloadPDFReceipt, printPDFReceipt } from '../utils/pdfGenerator';

interface ReceiptButtonProps {
  salesItems: SaleItem[];
  receiptNumber: string;
  cashierName?: string;
  customerDetails?: CustomerDetails;
  type: 'download' | 'print';
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const ReceiptButton: React.FC<ReceiptButtonProps> = ({
  salesItems,
  receiptNumber,
  cashierName = 'System',
  customerDetails,
  type,
  children,
  className = '',
  disabled = false
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

  const handleClick = async () => {
    if (disabled) return;
    
    try {
      if (type === 'download') {
        await downloadPDFReceipt(receiptData);
      } else {
        await printPDFReceipt(receiptData);
      }
    } catch (error) {
      console.error(`Error ${type}ing receipt:`, error);
    }
  };

  const defaultContent = (
    <>
      {type === 'download' ? <Download className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
      <span>{type === 'download' ? 'Download Receipt' : 'Print Receipt'}</span>
    </>
  );

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={type === 'download' ? 'Download Receipt as PDF' : 'Print Receipt'}
    >
      {children || defaultContent}
    </button>
  );
};

export default ReceiptButton;
