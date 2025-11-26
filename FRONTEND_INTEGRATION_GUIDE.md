# Frontend Integration Guide - Epasaley E-Commerce API

## 🚀 Quick Start

**Base URL:** `https://backend-epasal.onrender.com/api/v1`  
**API Docs:** `https://backend-epasal.onrender.com/api-docs`

---

## 🔐 Authentication & Authorization

### Authentication Types

| Type | Required | Use Case |
|------|----------|----------|
| **No Auth (Public)** | ❌ No | Fetching products, categories, banners, coupons |
| **Optional Auth** | ⚠️ Optional | Creating orders (can track user orders if authenticated) |
| **User Auth** | ✅ Yes | User-specific operations |
| **Admin Auth** | ✅ Yes (Admin role) | Creating/updating/deleting products, categories, etc. |

### JWT Token Structure

```typescript
// Token Payload
{
  id: string;           // User/Admin ID
  email?: string;       // Optional email
  role?: 'admin' | 'user';  // Role identifier
}
```

### How JWT Works in This API

- **Two separate JWT secrets:** `JWT_SECRET` (user) and `JWT_ADMIN_SECRET` (admin)
- **Token format:** `Bearer {token_value}`
- **Expiration:** 7 days (configurable)
- **Header:** `Authorization: Bearer eyJhbGc...`

---

## 📋 Data Models & Response Formats

### 1️⃣ Product Model

```typescript
// Single Product Response
{
  id: string;
  name: string;                    // Required, 3-200 chars
  description?: string;
  price?: number;                  // Calculated field
  beforePrice: number;             // Original price
  afterPrice: number;              // Discounted price
  discountPrice: number;           // Discount amount
  hasOffer: boolean;
  imageUrl: string;                // Cloudinary URL
  stock?: number;
  category_id?: string;
  sectionId: string;               // Required
  isActive: boolean;
  created_at: string;              // ISO timestamp
}

// List Response Format
{
  success: true,
  message: "Products fetched successfully",
  data: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

**Security:** ✅ Public endpoint (no auth required)

---

### 2️⃣ Category Model

```typescript
{
  id: string;
  name: string;                    // Required
  slug: string;                    // URL-friendly name (unique)
  description: string;
  imageUrl: string;                // Cloudinary URL
  isActive: boolean;
  created_at: string;              // ISO timestamp
}

// List Response
{
  success: true,
  message: "Categories fetched successfully",
  data: Category[],
  pagination: { ... }
}
```

**Security:** ✅ Public endpoint (no auth required)

---

### 3️⃣ Banner Model

```typescript
{
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;                // Cloudinary URL
  isActive: boolean;
  created_at: string;
}

// List Response
{
  success: true,
  message: "Banners fetched successfully",
  data: Banner[],
  pagination: { ... }
}
```

**Security:** ✅ Public endpoint (no auth required)

---

### 4️⃣ Order Model

```typescript
// Order Item Structure
{
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Full Order
{
  id: string;
  user_id?: string;                // Optional
  first_name?: string;
  last_name?: string;
  name: string;                    // Required
  phone: string | number;          // Required
  district: string;                // Required
  city: string;                    // Required
  address: string;                 // Required
  description: string;             // Required
  items: OrderItem[];              // At least 1 item required
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'sent' | 'on_the_way' | 
          'out_for_delivery' | 'shipped' | 'delivered' | 'received' | 'reached' | 'cancelled';
  statusHistory?: Array<{
    status: string;
    note?: string;
    location?: string;
    timestamp: string;
  }>;
  created_at: string;
}

// List Response
{
  success: true,
  message: "Orders retrieved successfully",
  data: Order[],
  pagination: { ... }
}
```

**Security:** 
- Create: ⚠️ Optional auth (public can create)
- Read: 🔐 Admin only
- Update: 🔐 Admin only

---

### 5️⃣ Coupon Model

```typescript
{
  code: string;                    // Unique, uppercase
  discountAmount: number;          // Discount value
  validFrom: string | Date;        // Start date
  validTo: string | Date;          // Expiry date
  isActive: boolean;
  created_at: string;
}

// List Response
{
  success: true,
  message: "Coupons fetched successfully",
  data: Coupon[],
  pagination: { ... }
}
```

**Security:**
- Fetch active: ✅ Public
- Validate code: ⚠️ Optional auth
- Create/Update/Delete: 🔐 Admin only

---

### 6️⃣ Flash Sale Model

```typescript
{
  id: string;
  productId: string;
  flashPrice: number;              // Flash sale price
  currentStock: number;            // Stock used in this flash sale
  maxStock: number;                // Max stock available
  startTime: string;               // ISO timestamp
  endTime: string;                 // ISO timestamp
  isActive: boolean;
  created_at: string;
}

// List Response
{
  success: true,
  message: "Flash sales fetched successfully",
  data: FlashSale[],
  pagination: { ... }
}
```

**Security:**
- Fetch: ✅ Public
- Create/Update/Delete: 🔐 Admin only

---

## 🔌 API Endpoints by Feature

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ❌ | List all products (paginated, searchable) |
| GET | `/products/offers` | ❌ | List products with offers |
| GET | `/products/category/:categoryId` | ❌ | Get products by category |
| GET | `/products/:id` | ❌ | Get single product |
| POST | `/products` | 🔐 Admin | Create product (with image upload) |
| PUT | `/products/:id` | 🔐 Admin | Update product (with image upload) |
| DELETE | `/products/:id` | 🔐 Admin | Delete product |

**Query Parameters (GET /products):**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 10, max: 100
  search?: string;        // Search by name/description
  categoryId?: string;    // Filter by category
  sectionId?: string;     // Filter by section
  hasOffer?: boolean;     // Filter by offer flag
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: string;        // Field name to sort
  order?: 'asc' | 'desc'; // Sort direction
}
```

**Frontend Fetch Example:**
```typescript
// Fetch products with pagination
const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/products?page=1&limit=10&hasOffer=true',
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }
);
const data = await response.json();
// data.data = Product[]
// data.pagination = { page, limit, total, pages }
```

---

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ❌ | List all categories |
| GET | `/categories/active` | ❌ | List only active categories |
| GET | `/categories/slug/:slug` | ❌ | Get category by slug |
| GET | `/categories/:id` | ❌ | Get single category |
| POST | `/categories` | 🔐 Admin | Create category (with image) |
| PUT | `/categories/:id` | 🔐 Admin | Update category |
| DELETE | `/categories/:id` | 🔐 Admin | Delete category |

**Frontend Fetch Example:**
```typescript
// Fetch active categories (public)
const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/categories/active'
);
const data = await response.json();
console.log(data.data); // Category[]
```

---

### Banners

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/banners` | ❌ | List all banners |
| GET | `/banners/active` | ❌ | List only active banners |
| GET | `/banners/:id` | ❌ | Get single banner |
| POST | `/banners` | 🔐 Admin | Create banner (with image) |
| PUT | `/banners/:id` | 🔐 Admin | Update banner |
| DELETE | `/banners/:id` | 🔐 Admin | Delete banner |

**Frontend Fetch Example:**
```typescript
// Fetch active banners for homepage carousel
const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/banners/active'
);
const data = await response.json();
console.log(data.data); // Banner[]
```

---

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | ⚠️ Optional | Create new order |
| GET | `/orders` | 🔐 Admin | List all orders |
| GET | `/orders/stats` | 🔐 Admin | Get order statistics |
| GET | `/orders/status/:status` | 🔐 Admin | Get orders by status |
| GET | `/orders/user/:userId` | 🔐 Admin | Get orders by user |
| GET | `/orders/:id` | 🔐 Admin | Get single order |
| GET | `/orders/:id/status` | 🔐 Admin | Get order status |
| PUT | `/orders/:id/status` | 🔐 Admin | Update order status |

**Create Order Request Body:**
```typescript
{
  name: string;           // Required
  phone: string | number; // Required
  district: string;       // Required
  city: string;           // Required
  address: string;        // Required
  description: string;    // Required
  items: [                // At least 1 required
    {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl: string;
    }
  ],
  totalAmount: number;    // Required
  user_id?: string;       // Optional (if authenticated)
  first_name?: string;    // Optional
  last_name?: string;     // Optional
}
```

**Frontend Fetch Example:**
```typescript
// Create order (guest or authenticated user)
const orderData = {
  name: "John Doe",
  phone: "1234567890",
  district: "Kathmandu",
  city: "Kathmandu",
  address: "123 Main St",
  description: "Please deliver in the morning",
  items: [
    {
      productId: "prod_123",
      name: "Product Name",
      price: 100,
      quantity: 2,
      imageUrl: "https://..."
    }
  ],
  totalAmount: 200
};

const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/orders',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Optional: Include auth token
      // 'Authorization': 'Bearer ' + userToken
    },
    body: JSON.stringify(orderData)
  }
);

const data = await response.json();
console.log(data.data); // Created Order object
```

---

### Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/coupons/active` | ❌ | List active coupons |
| POST | `/coupons/validate` | ⚠️ Optional | Validate coupon code |
| GET | `/coupons` | 🔐 Admin | List all coupons |
| GET | `/coupons/:code` | 🔐 Admin | Get coupon by code |
| POST | `/coupons` | 🔐 Admin | Create coupon |
| PUT | `/coupons/:code` | 🔐 Admin | Update coupon |
| DELETE | `/coupons/:code` | 🔐 Admin | Delete coupon |

**Validate Coupon Request:**
```typescript
{
  code: string;    // Coupon code
  amount?: number; // Total order amount (optional, for validation)
}
```

**Frontend Fetch Example:**
```typescript
// Validate coupon code at checkout
const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/coupons/validate',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: "SUMMER50",
      amount: 500
    })
  }
);

const data = await response.json();
if (data.success) {
  console.log("Coupon is valid!");
  console.log("Discount:", data.data.discountAmount);
} else {
  console.log("Coupon error:", data.message);
}
```

---

### Flash Sales

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/flash-sales` | ❌ | List all flash sales |
| GET | `/flash-sales/active` | ❌ | List active flash sales |
| GET | `/flash-sales/product/:productId` | ❌ | Get flash sale for product |
| GET | `/flash-sales/:id` | ❌ | Get single flash sale |
| GET | `/flash-sales/:id/is-active` | ❌ | Check if flash sale is active |
| POST | `/flash-sales` | 🔐 Admin | Create flash sale |
| PUT | `/flash-sales/:id` | 🔐 Admin | Update flash sale |
| DELETE | `/flash-sales/:id` | 🔐 Admin | Delete flash sale |

**Frontend Fetch Example:**
```typescript
// Get active flash sales for homepage
const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/flash-sales/active'
);
const data = await response.json();
console.log(data.data); // FlashSale[]
```

---

## 🔒 Security Implementation Details

### 1. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend sends request with JWT token in Authorization      │
│  header: "Authorization: Bearer {token}"                     │
│                                                               │
│                        ↓                                      │
│                                                               │
│  Backend authMiddleware receives request                     │
│  • Extracts token from header                               │
│  • Verifies token signature using JWT_SECRET                │
│  • Checks expiration                                        │
│  • Attaches user data to req.user                           │
│                                                               │
│                        ↓                                      │
│                                                               │
│  Role-based authorization check                             │
│  • For admin routes: checks if req.user.role === 'admin'   │
│  • For user routes: allows any authenticated user           │
│  • For public: no token required                            │
│                                                               │
│                        ↓                                      │
│                                                               │
│  If valid → Request proceeds to controller                 │
│  If invalid → 401/403 error returned                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2. JWT Token Generation

```typescript
// User Token
const userToken = generateToken({
  id: "user_123",
  email: "user@example.com",
  role: "user"  // Uses JWT_SECRET
});

// Admin Token
const adminToken = generateToken({
  id: "admin_456",
  email: "admin@example.com",
  role: "admin"  // Uses JWT_ADMIN_SECRET
});
```

### 3. Authentication Middleware Types

| Middleware | Purpose | Returns |
|------------|---------|---------|
| `authenticate(false)` | Requires user/admin token | 401 if missing |
| `authenticate(true)` | Requires admin token | 403 if not admin |
| `optionalAuth` | Token optional | Proceeds either way |

### 4. Security Headers

```typescript
// All requests include security headers:
Helmet Security Headers:
- X-Frame-Options: DENY               // Prevents clickjacking
- X-Content-Type-Options: nosniff     // Prevents MIME sniffing
- X-XSS-Protection: 1; mode=block     // XSS protection
- Strict-Transport-Security           // HTTPS only
- Content-Security-Policy             // Controls resource loading
```

### 5. CORS Configuration

```typescript
// Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
// Allowed Headers: Content-Type, Authorization, X-Requested-With
// Origin: https://your-frontend-domain.com (configure in .env)
```

---

## 🖼️ Image Upload Configuration

### Cloudinary Integration

```typescript
// All image uploads go to Cloudinary (cloud storage)
// Allowed formats: JPEG, JPG, PNG, GIF, WebP
// Max file size: 5MB
// Returned format: Cloudinary URL (https://res.cloudinary.com/...)
```

**Frontend File Upload Example:**
```typescript
// When creating a product with image

// Step 1: Prepare FormData
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', 100);
formData.append('categoryId', 'cat_123');
formData.append('image', imageFile); // File input

// Step 2: Send to backend (auto uploads to Cloudinary)
const response = await fetch(
  'https://backend-epasal.onrender.com/api/v1/products',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + adminToken
      // DON'T set Content-Type: multipart/form-data 
      // Browser will set it automatically
    },
    body: formData
  }
);

const data = await response.json();
console.log(data.data.imageUrl); // Cloudinary URL
```

---

## 🛡️ Error Handling

### Standard Error Response

```typescript
{
  success: false,
  message: "Error message here",
  error?: {
    name: "ErrorType",
    message: "Detailed error",
    stack: "..." // Only in development
  }
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Product fetched successfully |
| 201 | Created | Order created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Admin access required |
| 404 | Not Found | Product not found |
| 500 | Server Error | Database connection error |

**Frontend Error Handling Example:**
```typescript
try {
  const response = await fetch(endpoint, options);
  const data = await response.json();
  
  if (!response.ok) {
    // Handle error
    if (response.status === 401) {
      // Token expired, redirect to login
    } else if (response.status === 403) {
      // Admin access required
    } else {
      console.error(data.message);
    }
    return;
  }
  
  // Success handling
  console.log(data.data);
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 📱 Frontend Implementation Template

### Setup Fetch Helper

```typescript
// api.ts - Centralized API helper
const API_BASE = 'https://backend-epasal.onrender.com/api/v1';

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('authToken');
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  }

  // Products
  getProducts(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  createProduct(body: FormData, token: string) {
    return fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body
    }).then(r => r.json());
  }

  // Categories
  getCategories(params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/categories?${queryString}`);
  }

  getActiveCategories() {
    return this.request('/categories/active');
  }

  // Orders
  createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  getOrders(token: string, params?: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  // Coupons
  validateCoupon(code: string) {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Flash Sales
  getActiveFlashSales() {
    return this.request('/flash-sales/active');
  }

  getFlashSaleByProduct(productId: string) {
    return this.request(`/flash-sales/product/${productId}`);
  }
}

export const apiClient = new APIClient();
```

### Usage Examples

```typescript
// 1. Fetch Products
const products = await apiClient.getProducts({ 
  page: 1, 
  limit: 20,
  hasOffer: true 
});
console.log(products.data); // Product[]

// 2. Fetch Active Categories
const categories = await apiClient.getActiveCategories();
console.log(categories.data); // Category[]

// 3. Create Order (Public)
const order = await apiClient.createOrder({
  name: "John Doe",
  phone: "1234567890",
  district: "Kathmandu",
  city: "Kathmandu",
  address: "123 Main St",
  description: "Deliver ASAP",
  items: [{ productId: "123", ... }],
  totalAmount: 500
});
console.log(order.data.id); // Order ID

// 4. Validate Coupon
const coupon = await apiClient.validateCoupon("SUMMER50");
console.log(coupon.data.discountAmount); // Discount value

// 5. Fetch Flash Sales
const flashSales = await apiClient.getActiveFlashSales();
console.log(flashSales.data); // FlashSale[]
```

---

## 🔑 Environment Setup for Frontend

Create `.env` file in your frontend:

```env
REACT_APP_API_BASE_URL=https://backend-epasal.onrender.com/api/v1
REACT_APP_API_DOCS=https://backend-epasal.onrender.com/api-docs
```

Use in frontend:

```typescript
const API_BASE = process.env.REACT_APP_API_BASE_URL;
```

---

## 📊 Authentication & Authorization Matrix

| Endpoint | Public | Auth User | Auth Admin | Required Field |
|----------|--------|-----------|-----------|-----------------|
| GET /products | ✅ | ✅ | ✅ | None |
| POST /products | ❌ | ❌ | ✅ | JWT (Admin) |
| GET /categories | ✅ | ✅ | ✅ | None |
| POST /categories | ❌ | ❌ | ✅ | JWT (Admin) |
| POST /orders | ✅ | ✅ | ✅ | Optional JWT |
| GET /orders | ❌ | ❌ | ✅ | JWT (Admin) |
| GET /coupons/active | ✅ | ✅ | ✅ | None |
| POST /coupons/validate | ✅ | ✅ | ✅ | Optional JWT |
| POST /coupons | ❌ | ❌ | ✅ | JWT (Admin) |
| GET /banners | ✅ | ✅ | ✅ | None |
| POST /banners | ❌ | ❌ | ✅ | JWT (Admin) |
| GET /flash-sales | ✅ | ✅ | ✅ | None |
| POST /flash-sales | ❌ | ❌ | ✅ | JWT (Admin) |

---

## 🚨 Important Notes for Frontend Development

1. **Token Storage:** Store JWT in localStorage or sessionStorage
2. **Token Expiration:** Default 7 days - refresh before expiry
3. **CORS:** Frontend domain must be whitelisted (contact admin to set CORS_ORIGIN)
4. **Image URLs:** All returned image URLs are Cloudinary CDN URLs (safe to use directly)
5. **Phone Field:** Can be string or number
6. **Timestamps:** All dates in ISO format (2024-01-15T10:30:00Z)
7. **Pagination:** Default page=1, limit=10
8. **Errors:** Always check `response.success === true` before using `data`

---

## 🎯 Quick Reference

```typescript
// Public Endpoints (no token needed)
GET /products
GET /products/offers
GET /products/:id
GET /categories
GET /banners
GET /flash-sales/active
GET /coupons/active

// Authentication Required (include Authorization header)
POST /orders (optional auth)
POST /coupons/validate (optional auth)
POST /products (admin)
PUT /products/:id (admin)
DELETE /products/:id (admin)
GET /orders (admin)
POST /categories (admin)
// ... and all other admin endpoints

// Header Template
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📞 Support

**API Documentation:** https://backend-epasal.onrender.com/api-docs  
**Health Check:** https://backend-epasal.onrender.com/api/v1/health  
**Root Endpoint:** https://backend-epasal.onrender.com/
