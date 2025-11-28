# API Endpoints - Required Fields Documentation

## 🔐 Authentication

### POST /auth/login
**Required Fields:**
- `email` (string, email format) - Admin email
- `password` (string, min 6 chars) - Admin password

**Example:**
```json
{
  "email": "admin@epasaley.com",
  "password": "ePasaley@SecureAdmin2025!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "507f...",
      "adminId": "ADMIN001",
      "email": "admin@epasaley.com",
      "role": "super_admin"
    }
  }
}
```

---

## 📦 Products

### GET /products
**Query Parameters (Optional):**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `search` (string) - Search term
- `category_id` (string) - Filter by category
- `sort` (string) - Sort field

**Example URL:**
```
/api/v1/products?page=1&limit=10&search=laptop
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "name": "Laptop",
      "price": 50000,
      "imageUrl": "/uploads/1234567890.jpg",
      "category_id": "cat_123"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

### POST /products (Create)
**Required Fields:**
- `name` (string, min 3 chars) - Product name ✓
- `price` (number, min 0) - Product price ✓
- `beforePrice` (number, min 0) - Original price ✓
- `afterPrice` (number, min 0) - Price after discount ✓
- `category_id` (string) - Category ID ✓
- `image` (file) - Product image upload ✓

**Optional Fields:**
- `description` (string) - Product description
- `stock` (number) - Stock quantity
- `discountPrice` (number) - Discount amount
- `hasOffer` (boolean) - Has offer flag

**Example Form Data:**
```
name: "Laptop Pro"
price: 150000
beforePrice: 150000
afterPrice: 120000
category_id: "507f1f77bcf86cd799439011"
description: "High performance laptop"
stock: 50
image: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "507f...",
    "name": "Laptop Pro",
    "imageUrl": "/uploads/1234567890.jpg",
    "price": 150000
  }
}
```

---

### GET /products/{id}
**URL Parameters:**
- `id` (string) - Product ID ✓

**Example:** `/api/v1/products/507f1f77bcf86cd799439011`

**Response:**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "_id": "507f...",
    "name": "Laptop Pro",
    "price": 150000,
    "imageUrl": "/uploads/1234567890.jpg",
    "category_id": "cat_123"
  }
}
```

---

### PUT /products/{id} (Update)
**URL Parameters:**
- `id` (string) - Product ID ✓

**Optional Fields in Body:**
- `name` (string) - Update product name
- `price` (number) - Update price
- `description` (string) - Update description
- `category_id` (string) - Update category
- `stock` (number) - Update stock
- `image` (file) - Update product image

**Example Form Data:**
```
name: "Laptop Pro Max"
price: 180000
stock: 45
image: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "507f...",
    "name": "Laptop Pro Max",
    "price": 180000
  }
}
```

---

### DELETE /products/{id}
**URL Parameters:**
- `id` (string) - Product ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🏷️ Categories

### GET /categories
**Query Parameters (Optional):**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search term

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "name": "Electronics",
      "slug": "electronics",
      "imageUrl": "/uploads/cat_123.jpg"
    }
  ]
}
```

---

### POST /categories (Create)
**Required Fields:**
- `name` (string, min 2 chars) - Category name ✓
- `image` (file) - Category image ✓

**Optional Fields:**
- `description` (string) - Category description

**Example Form Data:**
```
name: "Electronics"
description: "Electronic devices and gadgets"
image: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "507f...",
    "name": "Electronics",
    "slug": "electronics",
    "imageUrl": "/uploads/cat_123.jpg"
  }
}
```

---

### GET /categories/{id}
**URL Parameters:**
- `id` (string) - Category ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "_id": "507f...",
    "name": "Electronics",
    "slug": "electronics",
    "imageUrl": "/uploads/cat_123.jpg"
  }
}
```

---

### PUT /categories/{id} (Update)
**URL Parameters:**
- `id` (string) - Category ID ✓

**Optional Fields in Body:**
- `name` (string) - Update name
- `description` (string) - Update description
- `image` (file) - Update image

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "507f...",
    "name": "Electronics Updated",
    "slug": "electronics"
  }
}
```

---

### DELETE /categories/{id}
**URL Parameters:**
- `id` (string) - Category ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 🎨 Banners

### GET /banners
**Query Parameters (Optional):**
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "message": "Banners retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "title": "Summer Sale",
      "imageUrl": "/uploads/banner_123.jpg",
      "isActive": true
    }
  ]
}
```

---

### POST /banners (Create)
**Required Fields:**
- `title` (string, min 3 chars) - Banner title ✓
- `image` (file) - Banner image ✓

**Optional Fields:**
- `description` (string) - Banner description
- `link` (string) - Banner link
- `isActive` (boolean) - Active status

**Example Form Data:**
```
title: "Summer Sale 2025"
description: "Get up to 50% off"
link: "/products?category=electronics"
image: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "507f...",
    "title": "Summer Sale 2025",
    "imageUrl": "/uploads/banner_123.jpg"
  }
}
```

---

### GET /banners/{id}
**URL Parameters:**
- `id` (string) - Banner ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Banner retrieved successfully",
  "data": {
    "_id": "507f...",
    "title": "Summer Sale 2025",
    "imageUrl": "/uploads/banner_123.jpg",
    "isActive": true
  }
}
```

---

### PUT /banners/{id} (Update)
**URL Parameters:**
- `id` (string) - Banner ID ✓

**Optional Fields in Body:**
- `title` (string) - Update title
- `description` (string) - Update description
- `link` (string) - Update link
- `isActive` (boolean) - Update active status
- `image` (file) - Update image

**Response:**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "_id": "507f...",
    "title": "Summer Sale 2025 Updated"
  }
}
```

---

### DELETE /banners/{id}
**URL Parameters:**
- `id` (string) - Banner ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

---

## 🎟️ Coupons

### GET /coupons
**Query Parameters (Optional):**
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "message": "Coupons retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "code": "SAVE50",
      "discountType": "percentage",
      "discountValue": 50,
      "isActive": true
    }
  ]
}
```

---

### POST /coupons (Create)
**Required Fields:**
- `code` (string, min 3 chars, uppercase) - Coupon code ✓
- `discountType` (enum: "percentage" | "fixed") - Discount type ✓
- `discountValue` (number, min 0) - Discount value ✓
- `expiryDate` (string, ISO date) - Expiry date ✓

**Optional Fields:**
- `description` (string) - Coupon description
- `maxUses` (number) - Max usage count
- `minOrderValue` (number) - Minimum order value
- `isActive` (boolean) - Active status

**Example Request Body:**
```json
{
  "code": "SAVE50",
  "discountType": "percentage",
  "discountValue": 50,
  "expiryDate": "2025-12-31T23:59:59Z",
  "description": "50% off on all items",
  "maxUses": 100,
  "minOrderValue": 1000,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "507f...",
    "code": "SAVE50",
    "discountType": "percentage",
    "discountValue": 50
  }
}
```

---

### GET /coupons/{code}
**URL Parameters:**
- `code` (string) - Coupon code ✓

**Response:**
```json
{
  "success": true,
  "message": "Coupon retrieved successfully",
  "data": {
    "_id": "507f...",
    "code": "SAVE50",
    "discountType": "percentage",
    "discountValue": 50,
    "isActive": true
  }
}
```

---

### PUT /coupons/{code} (Update)
**URL Parameters:**
- `code` (string) - Coupon code ✓

**Optional Fields in Body:**
- `discountValue` (number) - Update discount value
- `expiryDate` (string) - Update expiry date
- `maxUses` (number) - Update max uses
- `isActive` (boolean) - Update active status

**Response:**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "_id": "507f...",
    "code": "SAVE50",
    "discountValue": 60
  }
}
```

---

### DELETE /coupons/{code}
**URL Parameters:**
- `code` (string) - Coupon code ✓

**Response:**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

---

### POST /coupons/validate (Validate Coupon)
**Required Fields:**
- `code` (string) - Coupon code to validate ✓
- `orderValue` (number) - Order total amount ✓

**Optional Fields:**
- `userId` (string) - User ID (for personalized coupons)

**Example Request Body:**
```json
{
  "code": "SAVE50",
  "orderValue": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon is valid",
  "data": {
    "code": "SAVE50",
    "discountType": "percentage",
    "discountValue": 50,
    "finalDiscount": 2500
  }
}
```

---

## ⚡ Flash Sales

### GET /flash-sales
**Query Parameters (Optional):**
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "message": "Flash sales retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "title": "Midnight Sale",
      "discount": 40,
      "startTime": "2025-12-24T00:00:00Z",
      "endTime": "2025-12-24T23:59:59Z",
      "isActive": true
    }
  ]
}
```

---

### POST /flash-sales (Create)
**Required Fields:**
- `title` (string, min 3 chars) - Sale title ✓
- `discount` (number, 0-100) - Discount percentage ✓
- `startTime` (string, ISO date) - Start time ✓
- `endTime` (string, ISO date) - End time ✓
- `products` (array of strings) - Product IDs ✓

**Optional Fields:**
- `description` (string) - Sale description
- `isActive` (boolean) - Active status

**Example Request Body:**
```json
{
  "title": "Midnight Sale",
  "description": "Exclusive midnight sale",
  "discount": 40,
  "startTime": "2025-12-24T00:00:00Z",
  "endTime": "2025-12-24T23:59:59Z",
  "products": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Flash sale created successfully",
  "data": {
    "_id": "507f...",
    "title": "Midnight Sale",
    "discount": 40
  }
}
```

---

### GET /flash-sales/{id}
**URL Parameters:**
- `id` (string) - Flash sale ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Flash sale retrieved successfully",
  "data": {
    "_id": "507f...",
    "title": "Midnight Sale",
    "discount": 40,
    "isActive": true
  }
}
```

---

### PUT /flash-sales/{id} (Update)
**URL Parameters:**
- `id` (string) - Flash sale ID ✓

**Optional Fields in Body:**
- `title` (string) - Update title
- `discount` (number) - Update discount
- `startTime` (string) - Update start time
- `endTime` (string) - Update end time
- `products` (array) - Update products
- `isActive` (boolean) - Update active status

**Response:**
```json
{
  "success": true,
  "message": "Flash sale updated successfully",
  "data": {
    "_id": "507f...",
    "title": "Midnight Sale Updated",
    "discount": 50
  }
}
```

---

### DELETE /flash-sales/{id}
**URL Parameters:**
- `id` (string) - Flash sale ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Flash sale deleted successfully"
}
```

---

## 📋 Orders

### GET /orders
**Query Parameters (Optional):**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `status` (string) - Filter by status

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "orderNumber": "ORD-001",
      "totalAmount": 15000,
      "status": "pending"
    }
  ]
}
```

---

### POST /orders (Create)
**Required Fields:**
- `items` (array) - Order items ✓
  - `productId` (string) - Product ID ✓
  - `quantity` (number) - Quantity ✓
  - `price` (number) - Item price ✓
- `customerEmail` (string, email) - Customer email ✓
- `totalAmount` (number) - Total amount ✓

**Optional Fields:**
- `customerName` (string) - Customer name
- `shippingAddress` (object) - Shipping address
- `couponCode` (string) - Coupon code

**Example Request Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 15000
    }
  ],
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "totalAmount": 30000,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f...",
    "orderNumber": "ORD-001",
    "totalAmount": 30000,
    "status": "pending"
  }
}
```

---

### GET /orders/{id}
**URL Parameters:**
- `id` (string) - Order ID ✓

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "507f...",
    "orderNumber": "ORD-001",
    "items": [...],
    "totalAmount": 30000,
    "status": "pending"
  }
}
```

---

### PUT /orders/{id}/status (Update Order Status)
**URL Parameters:**
- `id` (string) - Order ID ✓

**Required Fields:**
- `status` (enum: "pending" | "processing" | "shipped" | "delivered" | "cancelled") - New status ✓

**Example Request Body:**
```json
{
  "status": "processing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "_id": "507f...",
    "orderNumber": "ORD-001",
    "status": "processing"
  }
}
```

---

## ✅ Summary

### Required Fields Legend:
- ✓ = Required field
- No mark = Optional field

### Field Types:
- `string` - Text input
- `number` - Numeric input
- `boolean` - True/False
- `file` - Image/File upload
- `array` - Multiple items
- `object` - JSON object
- `enum` - Predefined values
- `email` - Email format
- `ISO date` - ISO 8601 date format

### Common Headers for All Requests:
```
Content-Type: application/json
Authorization: Bearer <token>  (for admin operations)
```

### Response Format:
All responses follow this structure:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {...},
  "pagination": {...}  (if applicable)
}
```

---

**Status: ✅ ALL FIELDS CLEARLY DOCUMENTED**

Every endpoint now shows:
- Required fields (marked with ✓)
- Optional fields
- Field types
- Example requests
- Example responses
