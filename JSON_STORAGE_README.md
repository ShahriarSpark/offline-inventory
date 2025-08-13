# Friends IT Zone - JSON File Storage System

## Overview

This application now uses a JSON file-based storage system instead of localStorage. All data is stored in separate JSON files on the server, making the data persistent and easily accessible.

## Data Storage Structure

The application stores data in the following JSON files located in the `/data` directory:

### 1. `products.json`
Stores all product information including:
- Product details (name, brand, supplier, price, stock, etc.)
- Product specifications
- Categories and ratings
- Images and descriptions

### 2. `administrators.json`
Stores administrator and seller account information:
- Admin user credentials
- Seller account details
- Roles and permissions

### 3. `users.json`
Stores regular user/customer accounts:
- Customer account information
- Purchase history
- User points and rewards

### 4. `categories.json`
Stores product category definitions:
- Category names and descriptions
- Creation dates
- Category hierarchies

### 5. `sales.json`
Stores all sales transaction records:
- Sale details and timestamps
- Product quantities sold
- Customer information
- Transaction amounts

### 6. `purchases.json`
Stores purchase/inventory records:
- Stock replenishment records
- Supplier information
- Purchase costs and quantities

### 7. `returns.json`
Stores product return records:
- Return details and reasons
- Refund amounts
- Return dates and processing

## Backend API

The application includes a backend server (`server.cjs`) that provides REST API endpoints for:

### Products
- `GET /api/products` - Retrieve all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update existing product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Retrieve all categories
- `POST /api/categories` - Add new category
- `DELETE /api/categories/:id` - Delete category

### Users & Administrators
- `GET /api/users` - Retrieve all users
- `POST /api/users` - Add new user
- `DELETE /api/users/:id` - Delete user
- `GET /api/administrators` - Retrieve all administrators
- `POST /api/administrators` - Add new administrator

### Sales, Purchases & Returns
- `GET /api/sales` - Retrieve sales records
- `POST /api/sales` - Log new sale
- `GET /api/purchases` - Retrieve purchase records
- `POST /api/purchases` - Log new purchase
- `GET /api/returns` - Retrieve return records
- `POST /api/returns` - Log new return

### Authentication
- `POST /api/auth/login` - User login authentication

## How to Run

1. **Start the Backend Server:**
   ```bash
   node server.cjs
   ```
   The server will run on `http://localhost:3001`

2. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Data Persistence

- All data is automatically saved to JSON files when changes are made
- Data persists between application restarts
- JSON files are human-readable and can be manually edited if needed
- The system automatically creates default data on first run

## Features

### Add Product
- Click "Add Product" button in the Products tab
- Fill out the product form with all required information
- Product will be saved to `products.json`

### Add Category
- Navigate to the Categories tab
- Enter category name and optional description
- Click "Add Category" to save to `categories.json`

### User Management
- All user registrations are saved to `users.json` or `administrators.json`
- User sessions are maintained during app usage
- Login credentials are verified against stored user data

### Sales & Inventory Tracking
- All sales are recorded in `sales.json`
- Inventory purchases logged in `purchases.json`
- Product returns tracked in `returns.json`

## Benefits of JSON File Storage

1. **Data Persistence**: Data survives application restarts
2. **Easy Backup**: Simple file-based backup system
3. **Human Readable**: JSON files can be viewed and edited manually
4. **Version Control**: Files can be tracked in git if needed
5. **Portability**: Easy to move data between environments
6. **API Integration**: Full REST API for external integrations

## File Locations

```
project-folder/
├── data/
│   ├── products.json
│   ├── administrators.json
│   ├── users.json
│   ├── categories.json
│   ├── sales.json
│   ├── purchases.json
│   └── returns.json
├── server.cjs (Backend API server)
└── src/ (Frontend React application)
```

The data directory is automatically created when the server starts for the first time, and all JSON files are initialized with default data.
