# Receipt Components Documentation

This project now includes three powerful receipt components that allow you to generate and download professional PDF receipts matching the FRIENDS IT ZONE design.

## Components Overview

### 1. ReceiptDownloader
A complete component with both download and print buttons.

### 2. ReceiptButton  
A flexible single-purpose button for download or print.

### 3. Updated PDF Generator
Enhanced PDF generation that matches your professional receipt design.

## Usage Examples

### Basic ReceiptDownloader Usage

```tsx
import ReceiptDownloader from './components/ReceiptDownloader';

<ReceiptDownloader
  salesItems={salesItems}
  receiptNumber="s-1752696374728"
  cashierName="admin@friendsit.com"
  customerDetails={{
    name: "Md.Pranto Islam",
    mobile: "01979728818", 
    email: "pranto@gmail.com",
    address: "Uttara, Dhaka-1230"
  }}
/>
```

### ReceiptDownloader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `salesItems` | `SaleItem[]` | Required | Array of sale items |
| `receiptNumber` | `string` | Required | Unique receipt number |
| `cashierName` | `string` | `'System'` | Name of cashier/seller |
| `customerDetails` | `CustomerDetails` | `undefined` | Customer information |
| `showPrintButton` | `boolean` | `true` | Show print button |
| `showDownloadButton` | `boolean` | `true` | Show download button |
| `buttonSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `variant` | `'default' \| 'outline' \| 'minimal'` | `'default'` | Button style variant |
| `className` | `string` | `''` | Additional CSS classes |

### ReceiptButton Usage

```tsx
import ReceiptButton from './components/ReceiptButton';

// Download button
<ReceiptButton
  salesItems={salesItems}
  receiptNumber="s-1752696374728"
  customerDetails={customerDetails}
  type="download"
  className="bg-blue-500 text-white px-4 py-2 rounded"
/>

// Print button  
<ReceiptButton
  salesItems={salesItems}
  receiptNumber="s-1752696374728"
  customerDetails={customerDetails}
  type="print"
  className="bg-green-500 text-white px-4 py-2 rounded"
/>
```

### ReceiptButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `salesItems` | `SaleItem[]` | Required | Array of sale items |
| `receiptNumber` | `string` | Required | Unique receipt number |
| `cashierName` | `string` | `'System'` | Name of cashier/seller |
| `customerDetails` | `CustomerDetails` | `undefined` | Customer information |
| `type` | `'download' \| 'print'` | Required | Button function type |
| `children` | `React.ReactNode` | Default icon + text | Custom button content |
| `className` | `string` | `''` | CSS classes for styling |
| `disabled` | `boolean` | `false` | Disable the button |

## Styling Variants

### Default Variant
Professional gradient buttons with shadows and hover effects.

```tsx
<ReceiptDownloader variant="default" />
```

### Outline Variant
Clean outlined buttons that fill on hover.

```tsx
<ReceiptDownloader variant="outline" />
```

### Minimal Variant
Simple text buttons with subtle hover effects.

```tsx
<ReceiptDownloader variant="minimal" />
```

## Button Sizes

### Small (`sm`)
Compact buttons for tight spaces.

### Medium (`md`) - Default
Standard button size for most use cases.

### Large (`lg`)
Prominent buttons for important actions.

## PDF Receipt Features

The generated PDF receipt includes:

- **Professional Header**: Blue gradient with company name and proprietors
- **Receipt Information**: Number, date, and time in organized layout
- **Customer Details Table**: Formatted customer information (if provided)
- **Product Details Table**: Comprehensive product listing with alternating row colors
- **Grand Total Section**: Highlighted total amount in blue gradient box
- **Professional Footer**: Company information and thank you message

## Integration Examples

### In Sale Detail Modal
```tsx
// Add to your sale detail modal
<ReceiptDownloader
  salesItems={[saleItem]}
  receiptNumber={saleData.saleId}
  customerDetails={customerData}
  className="mt-4"
/>
```

### In Admin Dashboard
```tsx
// Quick download button in admin dashboard
<ReceiptButton
  salesItems={saleItems}
  receiptNumber={receiptNumber}
  type="download"
  className="btn btn-primary"
>
  📄 Download Receipt
</ReceiptButton>
```

### In Customer Dashboard
```tsx
// Customer can download their own receipts
<ReceiptDownloader
  salesItems={purchaseItems}
  receiptNumber={purchaseId}
  customerDetails={user}
  showPrintButton={false}
  variant="outline"
  buttonSize="sm"
/>
```

## Data Structure

### SaleItem Interface
```typescript
interface SaleItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}
```

### CustomerDetails Interface
```typescript
interface CustomerDetails {
  name: string;
  mobile: string;
  email: string;
  address: string;
}
```

## Notes

- The PDF generator automatically handles page breaks for long receipts
- Customer details are optional - receipts work without them
- All monetary values are formatted with Bangladeshi Taka (৳) symbol
- Product IDs are highlighted in blue in the PDF
- The receipt design matches your provided HTML template exactly
- Components are fully responsive and work on all screen sizes

## File Locations

- `src/components/ReceiptDownloader.tsx` - Main receipt component
- `src/components/ReceiptButton.tsx` - Individual button component  
- `src/utils/pdfGenerator.ts` - Updated PDF generation logic
- `src/components/ExampleReceiptUsage.tsx` - Usage examples
