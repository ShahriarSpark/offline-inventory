# Return_approved Component

## Overview
The `Return_approved.tsx` component displays all return product requests from the `returns.json` database and provides functionality to approve or reject return requests.

## Features

### 🔍 **Data Display**
- Shows all return requests with detailed information:
  - Product name and ID
  - Quantity returned and unit
  - Sell price per unit and total refund amount
  - Return date and timestamp
  - Admin ID who processed the return
  - Return reason
  - Customer information (name, email, mobile, address)

### 🎛️ **Interactive Controls**
- **Search functionality**: Search by product name, product ID, reason, admin ID, customer name, email, or mobile
- **Status filter**: Filter by all, pending, approved, or rejected returns
- **Refresh button**: Reload return data from database

### ✅ **Action Buttons**
- **Approve button**: Green button to approve return requests
- **Reject button**: Red button to reject return requests
- Both buttons show notifications after action

### 📊 **Summary Statistics**
- Total number of returns
- Total items returned
- Total refund amount

### 🎨 **UI Features**
- Responsive design for mobile and desktop
- Modern card-based layout
- Loading states with spinner
- Error handling with user-friendly messages
- Notification system for actions
- Empty state when no returns found

## Usage

### In AdminDashboard
The component is integrated into the AdminDashboard as a tab:
```tsx
{activeTab === 'returns' && (
  <Return_approved />
)}
```

### Standalone Usage
```tsx
import Return_approved from './components/Return_approved';

function App() {
  return (
    <div>
      <Return_approved />
    </div>
  );
}
```

## Data Structure
The component expects data from `returns.json` with the following structure:
```json
[
  {
    "id": "return-1754386115977",
    "productID": "IT2025-1753906837499",
    "productName": "Product Name",
    "quantityReturned": 1,
    "sellpricePerUnit": 500.02,
    "totalRefund": 500.02,
    "unit": "Pieces",
    "timestamp": "2025-08-05T09:28:35.974Z",
    "adminId": "admin-1752640309387",
    "reason": "Defective product",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerMobile": "+1234567890",
    "customerAddress": "123 Main St, City, Country"
  }
]
```

## Functions

### Core Functions
- `loadReturns()`: Fetches return data from API
- `handleApprove(returnId)`: Processes return approval
- `handleReject(returnId)`: Processes return rejection

### Utility Functions
- `formatCurrency(amount)`: Formats numbers as currency
- `formatDate(dateString)`: Formats timestamps as readable dates

## States
- `returns`: Array of return records
- `loading`: Loading state indicator
- `error`: Error message state
- `searchTerm`: Search filter value
- `statusFilter`: Status filter value
- `notification`: Success/error notification

## Styling
- Uses Tailwind CSS for styling
- Responsive grid layout
- Gradient backgrounds and hover effects
- Lucide React icons for visual elements

## Future Enhancements
- Add status field to ReturnRecord interface for better status tracking
- Implement actual API calls for approve/reject actions
- Add pagination for large datasets
- Export functionality for return reports
- Enhanced filtering options (date range, amount range)

## Dependencies
- React 18+
- Lucide React (icons)
- Tailwind CSS (styling)
- Return utility functions from `../utils/storage`
- ReturnRecord type from `../types`
