import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Package,
  User,
  DollarSign,
  Download,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { ReturnRecord, Product } from "../types";
import {
  getProducts,
  deleteReturn,
  logCompletedReturn,
  deleteSaleByReturn,
} from "../utils/storage";

interface ReturnApprovalModalProps {
  returnItem: ReturnRecord;
  isOpen: boolean;
  onClose: () => void;
  onApproved: (returnId: string) => void;
}

const ReturnApprovalModal: React.FC<ReturnApprovalModalProps> = ({
  returnItem,
  isOpen,
  onClose,
  onApproved,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [compensationPercentage, setCompensationPercentage] = useState(5);
  const [fixedAmount, setFixedAmount] = useState(0);
  const [isCompensationEditable, setIsCompensationEditable] = useState(false);
  const [compensationType, setCompensationType] = useState<
    "none" | "percentage" | "fixed"
  >("percentage");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Load product details
  useEffect(() => {
    if (isOpen && returnItem) {
      loadProductDetails();
    }
  }, [isOpen, returnItem]);

  const loadProductDetails = async () => {
    try {
      const products = await getProducts();
      const foundProduct = products.find((p) => p.id === returnItem.productID);
      setProduct(foundProduct || null);
    } catch (error) {
      console.error("Failed to load product details:", error);
    }
  };

  // Calculate deduction amount (restocking fee/handling charge)
  const calculateDeduction = () => {
    if (compensationType === "none") return 0;
    if (compensationType === "percentage") {
      const totalRefund = returnItem.totalRefund;
      return (totalRefund * compensationPercentage) / 100;
    }
    if (compensationType === "fixed") {
      return fixedAmount;
    }
    return 0;
  };

  // Calculate final refund amount (original refund minus deduction)
  const calculateFinalRefund = () => {
    return returnItem.totalRefund - calculateDeduction();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `৳${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle approve confirmation
  const handleApproveConfirm = async () => {
    try {
      setLoading(true);

      // Prepare completed return data
      const completedReturnData = {
        originalReturnId: returnItem.id || returnItem.productID,
        productID: returnItem.productID,
        productName: returnItem.productName,
        quantityReturned: returnItem.quantityReturned,
        sellpricePerUnit: returnItem.sellpricePerUnit,
        originalRefund: returnItem.totalRefund,
        finalRefund: calculateFinalRefund(),
        restockingFee: calculateDeduction(),
        compensationType,
        compensationValue:
          compensationType === "percentage"
            ? compensationPercentage
            : compensationType === "fixed"
            ? fixedAmount
            : 0,
        unit: returnItem.unit,
        returnTimestamp: returnItem.timestamp,
        adminId: returnItem.adminId,
        approvedBy: returnItem.adminId, // You might want to get this from current session
        reason: returnItem.reason,
        originalSaleDate: returnItem.originalSaleDate,
        customerName: returnItem.customerName,
        customerEmail: returnItem.customerEmail,
        customerMobile: returnItem.customerMobile,
        customerAddress: returnItem.customerAddress,
        receiptGenerated: false, // Will be set to true if receipt is downloaded
        notes: `Approved with ${compensationType} compensation. ${
          compensationType === "none"
            ? "No deduction applied."
            : compensationType === "percentage"
            ? `${compensationPercentage}% restocking fee applied.`
            : `Fixed compensation of $${fixedAmount} applied.`
        }`,
      };

      // STEP 1: CRITICAL - Remove the corresponding sale record from sales.json FIRST
      console.log(
        "🔥 CRITICAL: Attempting to delete sale record from sales.json:",
        {
          productId: returnItem.productID,
          customerMobile: returnItem.customerMobile || "",
          customerEmail: returnItem.customerEmail || "",
          quantity: returnItem.quantityReturned,
        }
      );

      let saleDeleteSuccess = false;
      try {
        saleDeleteSuccess = await deleteSaleByReturn({
          productId: returnItem.productID,
          customerMobile: returnItem.customerMobile || "",
          customerEmail: returnItem.customerEmail || "",
          quantity: returnItem.quantityReturned,
        });

        if (saleDeleteSuccess) {
          console.log(
            "✅ Sale record deleted successfully via deleteSaleByReturn function"
          );
        }
      } catch (saleDeleteError) {
        console.error(
          "❌ Primary sale deletion method failed:",
          saleDeleteError
        );
      }

      // If primary method failed, try direct API call
      if (!saleDeleteSuccess) {
        console.log("🔄 Attempting direct API call for sale deletion...");
        try {
          const response = await fetch(
            "https://offline-inventory-api-with-fs.onrender.com/api/sales/by-return",
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: returnItem.productID,
                customerMobile: returnItem.customerMobile || "",
                customerEmail: returnItem.customerEmail || "",
                quantity: returnItem.quantityReturned,
              }),
            }
          );

          const result = await response.json();
          if (result.success) {
            console.log(
              "✅ Sale record deleted successfully via direct API call"
            );
            saleDeleteSuccess = true;
          } else {
            throw new Error(`Sale deletion failed: ${result.message}`);
          }
        } catch (retryError) {
          console.error("❌ Direct API sale deletion also failed:", retryError);

          // Show specific error for sale deletion failure
          setNotification({
            message: `❌ CRITICAL ERROR: Failed to remove sale record from database. Return cannot be approved without removing the sale data. Please contact administrator.`,
            type: "error",
          });
          return; // Stop the process here
        }
      }

      // STEP 2: Log the completed return
      const logSuccess = await logCompletedReturn(completedReturnData);

      if (!logSuccess) {
        throw new Error("Failed to log completed return");
      }

      // STEP 3: Delete the return from pending returns
      const deleteSuccess = await deleteReturn(
        returnItem.id || returnItem.productID
      );

      if (deleteSuccess) {
        setNotification({
          message: `✅ Return approved successfully! Final refund: ${formatCurrency(
            calculateFinalRefund()
          )}. IMPORTANT: Sale record has been PERMANENTLY REMOVED from sales.json database. Completed return has been logged.`,
          type: "success",
        });

        // Call parent callback
        onApproved(returnItem.id || returnItem.productID);

        // Close modal after short delay
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 3000);
      } else {
        throw new Error(
          "Failed to delete pending return after logging completion"
        );
      }
    } catch (error) {
      console.error("Failed to approve return:", error);
      setNotification({
        message: "Failed to approve return. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate and download receipt as PDF-style HTML
  const downloadReceipt = () => {
    const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Return Approval Receipt</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .receipt-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .receipt-title {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .receipt-id {
            font-size: 14px;
            color: #9ca3af;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .info-item {
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
            display: inline-block;
            width: 120px;
        }
        .info-value {
            color: #1f2937;
        }
        .financial-summary {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .summary-total {
            border-top: 2px solid #d1d5db;
            padding-top: 8px;
            margin-top: 8px;
            font-weight: bold;
            font-size: 18px;
            color: #059669;
        }
        .reason-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .approval-info {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
        }
        @media print {
            body { margin: 0; background: white; }
            .receipt-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="company-name">Offline Shop Inventory</div>
            <div class="receipt-title">Return Approval Receipt</div>
            <div class="receipt-id">Receipt #: RET-${
              returnItem.productID
            }-${new Date().getTime()}</div>
        </div>

        <div class="approval-info">
            <strong>✅ RETURN APPROVED</strong><br>
            <span style="font-size: 14px; color: #059669;">
                This return has been processed and approved on ${new Date().toLocaleDateString()}
            </span>
        </div>

        <div class="info-grid">
            <div class="section">
                <div class="section-title">Product Information</div>
                <div class="info-item">
                    <span class="info-label">Product Name:</span>
                    <span class="info-value">${returnItem.productName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Product ID:</span>
                    <span class="info-value">${returnItem.productID}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Quantity:</span>
                    <span class="info-value">${returnItem.quantityReturned} ${
      returnItem.unit
    }</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Unit Price:</span>
                    <span class="info-value">${formatCurrency(
                      returnItem.sellpricePerUnit
                    )}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Customer Information</div>
                <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${
                      returnItem.customerName || "N/A"
                    }</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${
                      returnItem.customerEmail || "N/A"
                    }</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Mobile:</span>
                    <span class="info-value">${
                      returnItem.customerMobile || "N/A"
                    }</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${
                      returnItem.customerAddress || "N/A"
                    }</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Return Details</div>
            <div class="info-item">
                <span class="info-label">Return Date:</span>
                <span class="info-value">${formatDate(
                  returnItem.timestamp
                )}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Processed By:</span>
                <span class="info-value">${returnItem.adminId}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Approval Date:</span>
                <span class="info-value">${new Date().toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Status:</span>
                <span class="info-value" style="color: #059669; font-weight: bold;">APPROVED & COMPLETED</span>
            </div>
        </div>

        ${
          returnItem.reason
            ? `
        <div class="reason-box">
            <strong>Return Reason:</strong><br>
            ${returnItem.reason}
        </div>
        `
            : ""
        }

        <div class="financial-summary">
            <div class="summary-row">
                <span>Original Refund Amount:</span>
                <span>৳${formatCurrency(returnItem.totalRefund)}</span>
            </div>
            <div class="summary-row">
                <span>${
                  compensationType === "none"
                    ? "No Deduction"
                    : compensationType === "percentage"
                    ? `Restocking Fee (${compensationPercentage}%)`
                    : "Fixed Compensation"
                }:</span>
                <span style="color: #dc2626;">৳${
                  compensationType === "none"
                    ? "0.00"
                    : `-${formatCurrency(calculateDeduction())}`
                }</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total Refund Amount:</span>
                <span>৳${formatCurrency(calculateFinalRefund())}</span>
            </div>
        </div>

        <div class="footer">
            <p><strong>Thank you for choosing our store!</strong></p>
            <p>This receipt serves as confirmation of your approved return request.</p>
            <p>Return ID: ${
              returnItem.id || returnItem.productID
            } | Generated on: ${new Date().toLocaleString()}</p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                This return has been logged in our system for record keeping and audit purposes.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `return-receipt-approved-${returnItem.productID}-${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Show success notification
    setNotification({
      message:
        "Receipt downloaded successfully! This return has been completed and logged in the system.",
      type: "success",
    });
    setTimeout(() => setNotification(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Approve Return Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product and Customer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Details
                </h3>
              </div>

              {/* Product Image Placeholder */}
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                {product?.image ? (
                  <img
                    src={product.image}
                    alt={returnItem.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">
                      No image available
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {returnItem.productName}
                </p>
                <p className="text-sm text-gray-600">
                  Product ID: {returnItem.productID}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {returnItem.quantityReturned} {returnItem.unit}
                </p>
                <p className="text-sm text-gray-600">
                  Unit Price: {formatCurrency(returnItem.sellpricePerUnit)}
                </p>
                <p className="text-sm font-semibold text-green-600">
                  Original Refund: {formatCurrency(returnItem.totalRefund)}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Details
                </h3>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {returnItem.customerName || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  {returnItem.customerEmail || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Mobile:</span>{" "}
                  {returnItem.customerMobile || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span>{" "}
                  {returnItem.customerAddress || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Return Date:</span>{" "}
                  {formatDate(returnItem.timestamp)}
                </p>
              </div>
            </div>
          </div>

          {/* Return Reason */}
          {returnItem.reason && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Return Reason:
              </h4>
              <p className="text-gray-700">{returnItem.reason}</p>
            </div>
          )}

          {/* Restocking Fee Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Restocking Fee & Deductions
              </h3>
            </div>

            <div className="space-y-4">
              {/* No Deduction Option */}
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="noCompensation"
                  name="compensationType"
                  checked={compensationType === "none"}
                  onChange={() => {
                    setCompensationType("none");
                    setIsCompensationEditable(false);
                  }}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
                />
                <label
                  htmlFor="noCompensation"
                  className="text-sm font-medium text-gray-900"
                >
                  No restocking fee/deduction required
                </label>
              </div>

              {/* Percentage Deduction Option */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="percentageCompensation"
                    name="compensationType"
                    checked={compensationType === "percentage"}
                    onChange={() => {
                      setCompensationType("percentage");
                      setIsCompensationEditable(false);
                    }}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
                  />
                  <label
                    htmlFor="percentageCompensation"
                    className="text-sm font-medium text-gray-900"
                  >
                    Percentage-based restocking fee
                  </label>
                </div>

                {compensationType === "percentage" && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="editPercentage"
                        checked={isCompensationEditable}
                        onChange={(e) =>
                          setIsCompensationEditable(e.target.checked)
                        }
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor="editPercentage"
                        className="text-sm font-medium text-gray-900"
                      >
                        Edit percentage
                      </label>
                      <button
                        onClick={() =>
                          setIsCompensationEditable(!isCompensationEditable)
                        }
                        className="p-1 hover:bg-orange-100 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-orange-600" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700">
                        Restocking Fee:
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={compensationPercentage}
                          onChange={(e) =>
                            setCompensationPercentage(
                              Math.max(0, Math.min(100, Number(e.target.value)))
                            )
                          }
                          disabled={!isCompensationEditable}
                          min="0"
                          max="100"
                          className={`w-20 px-3 py-1 border border-gray-300 rounded-lg text-center ${
                            isCompensationEditable
                              ? "bg-white focus:ring-2 focus:ring-orange-500"
                              : "bg-gray-100 cursor-not-allowed"
                          }`}
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        = {formatCurrency(calculateDeduction())}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Amount Compensation Option */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="fixedCompensation"
                    name="compensationType"
                    checked={compensationType === "fixed"}
                    onChange={() => {
                      setCompensationType("fixed");
                      setIsCompensationEditable(false);
                    }}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500"
                  />
                  <label
                    htmlFor="fixedCompensation"
                    className="text-sm font-medium text-gray-900"
                  >
                    Fixed amount compensation
                  </label>
                </div>

                {compensationType === "fixed" && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700">
                        Compensation Amount:
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">৳</span>
                        <input
                          type="number"
                          value={fixedAmount}
                          onChange={(e) =>
                            setFixedAmount(Math.max(0, Number(e.target.value)))
                          }
                          min="0"
                          step="0.01"
                          className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-center bg-white focus:ring-2 focus:ring-orange-500"
                          placeholder="0.00"
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        Total: {formatCurrency(calculateDeduction())}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Final Calculation */}
              <div className="border-t border-orange-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Refund:</span>
                    <span className="font-medium">
                      {formatCurrency(returnItem.totalRefund)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {compensationType === "none"
                        ? "No Deduction"
                        : compensationType === "percentage"
                        ? `Restocking Fee (${compensationPercentage}%)`
                        : "Fixed Compensation"}
                      :
                    </span>
                    <span className="font-medium text-red-600">
                      {compensationType === "none"
                        ? "$0.00"
                        : `-${formatCurrency(calculateDeduction())}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-orange-200 pt-2">
                    <span className="text-gray-900">Final Refund Amount:</span>
                    <span className="text-green-600">
                      {formatCurrency(calculateFinalRefund())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={downloadReceipt}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </button>

            <button
              onClick={handleApproveConfirm}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="This will permanently remove the sale record from sales.json database and approve the return"
            >
              <CheckCircle className="w-5 h-5" />
              <span>
                {loading
                  ? "Removing Sale & Processing..."
                  : "Approve & Remove Sale Data"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnApprovalModal;
