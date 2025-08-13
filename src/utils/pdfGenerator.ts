import jsPDF from 'jspdf';

export interface ReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  sellpricePerUnit: number;
  totalPrice: number;
}

export interface CustomerDetails {
  name?: string;
  mobile: string;
  email: string;
  address: string;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  totalAmount: number;
  totalItems: number;
  cashierName: string;
  storeName: string;
  customer?: CustomerDetails;
}

export const generatePDFReceipt = (receiptData: ReceiptData): Promise<jsPDF> => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = 25;

    // Set Arial font (more reliable than helvetica for better rendering)
    doc.setFont('Arial', 'normal');

    // Header with gradient effect simulation
    doc.setFillColor(30, 64, 175); // Blue background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(24);
    doc.setFont('Arial', 'bold');
    doc.text('FRIENDS IT ZONE', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont('Arial', 'bold');
    doc.text('PROPRIETOR: KAJAL BISWAS', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 6;
    doc.text('& ASHRAFUL ALAM TANIM', pageWidth / 2, yPosition, { align: 'center' });

    // Reset text color to black
    doc.setTextColor(0, 0, 0);
    yPosition = 55;

    // Receipt Info section with background
    doc.setFillColor(248, 249, 250); // Light gray background
    doc.rect(0, yPosition - 5, pageWidth, 25, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(0, yPosition - 5, pageWidth, 25, 'S');

    doc.setFontSize(14);
    doc.setFont('Arial', 'bold');
    doc.text(`Receipt No: ${receiptData.receiptNumber}`, margin, yPosition + 5);
    
    // "RECEIPT" title on the right
    doc.setTextColor(30, 64, 175); // Blue color
    doc.setFontSize(18);
    doc.text('RECEIPT', pageWidth - margin - 30, yPosition + 5);
    
    doc.setTextColor(0, 0, 0); // Back to black
    doc.setFontSize(10);
    doc.setFont('Arial', 'normal');
    doc.text(`Date: ${receiptData.date}`, margin, yPosition + 12);
    doc.text(`Time: ${receiptData.time}`, margin, yPosition + 18);

    yPosition += 35;

    // Customer Details Section (if customer exists)
    if (receiptData.customer) {
      doc.setFontSize(16);
      doc.setFont('Arial', 'bold');
      doc.text('Customer Details', margin, yPosition);
      
      // Underline for section title
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(2);
      doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
      
      yPosition += 12;

      // Customer information in single row: Name on left, Mobile on right
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'S');
      
      // Light background for the row
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
      doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'S');
      
      // Customer name on the left side
      doc.setFont('Arial', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      const customerName = receiptData.customer.name || 'Customer';
      doc.text(`Name: ${customerName}`, margin + 5, yPosition + 6);
      
      // Customer mobile on the right side
      const customerMobile = receiptData.customer.mobile || 'N/A';
      doc.text(`Mobile: ${customerMobile}`, pageWidth - margin - 80, yPosition + 6);

      yPosition += 20;
    }

    // Product Details Section
    doc.setFontSize(16);
    doc.setFont('Arial', 'bold');
    doc.text('Product Details', margin, yPosition);
    
    // Underline for section title
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(2);
    doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
    
    yPosition += 15;

    // Products table header
    doc.setFillColor(30, 64, 175); // Blue header
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(9);
    doc.setFont('Arial', 'bold');
    
    // Column positions and widths (removed Product ID column)
    const tableWidth = pageWidth - 2 * margin;
    const colWidths = [0.55, 0.15, 0.15, 0.15]; // Percentages without Product ID
    const headers = ['Product Name', 'Qty', 'Unit Price', 'Total Price'];
    
    let xPos = margin + 2;
    headers.forEach((header, index) => {
      doc.text(header, xPos, yPosition + 2);
      xPos += tableWidth * colWidths[index];
    });

    yPosition += 12;
    doc.setTextColor(0, 0, 0); // Back to black

    // Products data
    receiptData.items.forEach((item, index) => {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
      }

      // Border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'S');

      doc.setFontSize(8);
      xPos = margin + 2;
      
      // Product name (left aligned, wrap if needed)
      doc.setTextColor(0, 0, 0);
      doc.setFont('Arial', 'normal');
      const productName = item.productName.length > 45 
        ? item.productName.substring(0, 45) + '...' 
        : item.productName;
      doc.text(productName, xPos, yPosition + 4);
      xPos += tableWidth * colWidths[0];
      
      // Quantity
      doc.text(`${item.quantity} ${item.unit}`, xPos, yPosition + 4);
      xPos += tableWidth * colWidths[1];
      
      // Unit price
      doc.text(`৳${item.sellpricePerUnit.toLocaleString()}`, xPos, yPosition + 4);
      xPos += tableWidth * colWidths[2];
      
      // Total price
      doc.text(`৳${item.totalPrice.toLocaleString()}`, xPos, yPosition + 4);

      yPosition += 12;
    });

    // Grand Total Section
    yPosition += 10;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    yPosition += 15;
    
    // Total box with gradient effect simulation
    doc.setFillColor(219, 234, 254); // Light blue background
    doc.setDrawColor(30, 64, 175); // Blue border
    doc.setLineWidth(2);
    doc.rect(margin, yPosition - 8, pageWidth - 2 * margin, 20, 'FD');
    
    doc.setFontSize(16);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Grand Total:', margin + 8, yPosition + 4);
    doc.text(`৳${receiptData.totalAmount.toLocaleString()}`, pageWidth - margin - 60, yPosition + 4);

    yPosition += 30;

    // Footer
    const footerStartY = Math.max(yPosition, pageHeight - 60);
    doc.setFillColor(51, 51, 51); // Dark gray background
    doc.rect(0, footerStartY, pageWidth, pageHeight - footerStartY, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(12);
    doc.setFont('Arial', 'bold');
    doc.text('FRIENDS IT ZONE', pageWidth / 2, footerStartY + 12, { align: 'center' });
    
    let footerY = footerStartY + 20;
    doc.setFontSize(9);
    doc.setFont('Arial', 'normal');
    doc.text('LOCATION: HARINAKUNDA UPAZILA MORE, MASTER MARKET 2', pageWidth / 2, footerY, { align: 'center' });
    
    footerY += 6;
    doc.text('PHONE: 01718000117, 01947533013', pageWidth / 2, footerY, { align: 'center' });
    
    footerY += 6;
    doc.text('EMAIL: friendsitzone@gmail.com | Website: www.friendsitzone.com', pageWidth / 2, footerY, { align: 'center' });
    
    footerY += 6;
    doc.text('Business Hours: 9:00 AM - 9:00 PM (Daily)', pageWidth / 2, footerY, { align: 'center' });
    
    footerY += 10;
    doc.setTextColor(200, 200, 200); // Light gray text
    doc.setFont('Arial', 'italic');
    doc.text('Thank you for choosing FRIENDS IT ZONE!', pageWidth / 2, footerY, { align: 'center' });
    
    footerY += 6;
    doc.text('Your satisfaction is our priority', pageWidth / 2, footerY, { align: 'center' });
    
    resolve(doc);
  });
};

export const downloadPDFReceipt = async (receiptData: ReceiptData) => {
  const doc = await generatePDFReceipt(receiptData);
  doc.save(`receipt_${receiptData.receiptNumber}_${receiptData.date}.pdf`);
};

export const printPDFReceipt = async (receiptData: ReceiptData) => {
  const doc = await generatePDFReceipt(receiptData);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};