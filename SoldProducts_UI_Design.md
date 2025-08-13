# Sold Products Page - UI Design & Text

## Page Header
```
📦 Sold Products
View all successfully completed sales transactions
```

## Filter/Search Section
```
🔍 Search & Filter
┌─────────────────────────────────────────────────────────────┐
│ Search by Customer Name or Product: [________________] 🔍    │
│                                                             │
│ Filter by Date Range: [From: MM/DD/YYYY] [To: MM/DD/YYYY]  │
│ Filter by Seller: [All Sellers ▼]                         │
│                                           [Apply Filter]    │
└─────────────────────────────────────────────────────────────┘
```

## Summary Statistics
```
📊 Sales Summary
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Total Sales   │  Total Revenue  │ Total Products  │ Unique Customers│
│      47         │   ৳156,750      │      52         │       23        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Main Table Section

### Table Headers
```
Sold Products List - Detailed View
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ # │ Customer Name     │ Customer Mobile │ Customer Email              │ Product Name                           │ Qty │ Unit Price │ Total   │ Sale Date  │ Seller Email        │
├───┼───────────────────┼─────────────────┼─────────────────────────────┼────────────────────────────────────────┼─────┼────────────┼─────────┼────────────┼─────────────────────┤
│ 1 │ PRANTO ISLAM      │ 01737080126     │ pranto@example.com          │ TP-Link Archer AX55 Wi-Fi 6 Router    │  1  │ ৳9,500     │ ৳9,500  │ 07/16/2025 │ admin@friendsit.com │
│ 2 │ PRANTO ISLAM      │ 01737080126     │ pranto@example.com          │ TP-Link Archer C24 AC750 Router       │  1  │ ৳1,800     │ ৳1,800  │ 07/16/2025 │ admin@friendsit.com │
│ 3 │ PRANTO ISLAM      │ 01737080126     │ pranto@example.com          │ D-Link DGS-1008A 8-Port Switch        │  2  │ ৳2,100     │ ৳4,200  │ 07/16/2025 │ admin@friendsit.com │
│ 4 │ Ahmed Hassan      │ 01888123456     │ ahmed@gmail.com             │ ASUS TUF Gaming Router                 │  1  │ ৳16,500    │ ৳16,500 │ 07/15/2025 │ seller@friendsit.com│
│ 5 │ Fatima Khan       │ 01777987654     │ fatima.khan@outlook.com     │ Netgear GS308 8-Port Switch           │  3  │ ৳2,300     │ ৳6,900  │ 07/14/2025 │ admin@friendsit.com │
└───┴───────────────────┴─────────────────┴─────────────────────────────┴────────────────────────────────────────┴─────┴────────────┴─────────┴────────────┴─────────────────────┘
```

## Column Descriptions

### Column Headers & Specifications:
1. **#** - Sequential row number
2. **Customer Name** - Full name of the customer who purchased
3. **Customer Mobile** - Customer's phone number (format: 01XXXXXXXXX)
4. **Customer Email** - Customer's email address
5. **Product Name** - Complete product name/description
6. **Qty** - Quantity purchased (number)
7. **Unit Price** - Price per single unit (৳X,XXX format)
8. **Total** - Total price for this line item (Qty × Unit Price)
9. **Sale Date** - Date of sale (MM/DD/YYYY format)
10. **Seller Email** - Email of the person who processed the sale

## UI Text Examples

### Page Title & Description
```
Sold Products Management
Track and review all completed sales transactions with detailed customer and product information.
```

### Empty State
```
📦 No Sales Found
No products have been sold yet or no results match your current filters.
[Add New Sale] or [Clear Filters]
```

### Loading State
```
⏳ Loading Sales Data...
Fetching sold products information...
```

### Error State
```
⚠️ Unable to Load Sales Data
There was an error loading the sold products. Please try refreshing the page.
[Refresh Page]
```

## Action Buttons & Controls

### Table Actions
```
[📊 Export to Excel] [📋 Print Report] [🔄 Refresh Data]
```

### Row Actions (per row)
```
[👁️ View Details] [📧 Email Receipt] [🔍 View Warranty]
```

## Responsive Design Notes

### Mobile View (Stack Layout)
```
┌─────────────────────────────────────┐
│ Sale #1                             │
│ Customer: PRANTO ISLAM              │
│ Mobile: 01737080126                 │
│ Email: pranto@example.com           │
│ ────────────────────────────────────│
│ Product: TP-Link Archer AX55        │
│ Quantity: 1 × ৳9,500 = ৳9,500      │
│ Date: 07/16/2025                    │
│ Seller: admin@friendsit.com         │
│ [View Details] [Email Receipt]      │
└─────────────────────────────────────┘
```

### Tablet View (Condensed Columns)
- Combine Customer Name + Mobile in one column
- Combine Quantity + Price in one column
- Hide Seller Email (show in details view)

## Color Coding & Visual Indicators

### Status Indicators
- 🟢 **Recent Sale** (within 24 hours) - Green highlight
- 🟡 **This Week** (within 7 days) - Yellow highlight  
- 🔵 **This Month** (within 30 days) - Blue highlight
- ⚪ **Older** - Default/white background

### Customer Grouping
- Same customer rows can have subtle background grouping
- Alternate row colors for better readability

## Pagination & Performance

### Bottom Controls
```
Showing 1-25 of 156 sales
[⬅️ Previous] [1] [2] [3] [4] [5] [Next ➡️]

Items per page: [25 ▼] [50] [100] [All]
```

This design ensures clear visibility of all sales data while maintaining excellent user experience across all device types.
