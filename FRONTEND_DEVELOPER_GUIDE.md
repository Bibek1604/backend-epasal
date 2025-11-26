# Complete Backend Documentation Summary

## 📚 Overview

Your Epasaley E-Commerce Backend is a **production-ready TypeScript/Node.js API** with comprehensive security, authentication, and authorization mechanisms. This document summarizes everything needed for frontend integration.

---

## 🎯 Quick Links

| Document | Purpose |
|----------|---------|
| **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** | Complete guide for frontend developers - models, endpoints, auth flow |
| **[SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)** | Detailed security implementation - JWT, RBAC, validation |
| **[FRONTEND_FETCH_EXAMPLES.md](./FRONTEND_FETCH_EXAMPLES.md)** | Copy-paste ready fetch examples for every endpoint |
| **[API_DOCS (Swagger UI)](https://backend-epasal.onrender.com/api-docs)** | Interactive API documentation |

---

## 🚀 API Quick Start

### Base URL
```
https://backend-epasal.onrender.com/api/v1
```

### Documentation
```
https://backend-epasal.onrender.com/api-docs
```

### Health Check
```
GET https://backend-epasal.onrender.com/api/v1/health
```

---

## 📋 Data Models (6 Entities)

### 1. **Product** 🛍️
```typescript
{
  id: string;
  name: string;
  description?: string;
  beforePrice: number;        // Original price
  afterPrice: number;         // Discounted price
  discountPrice: number;      // Discount amount
  hasOffer: boolean;
  imageUrl: string;           // Cloudinary URL
  stock?: number;
  category_id?: string;
  sectionId: string;
  isActive: boolean;
  created_at: string;
}
```
**Public Access:** ✅ Yes | **Indexed:** Yes | **Pagination:** Yes

### 2. **Category** 📂
```typescript
{
  id: string;
  name: string;
  slug: string;               // URL-friendly (unique)
  description: string;
  imageUrl: string;           // Cloudinary URL
  isActive: boolean;
  created_at: string;
}
```
**Public Access:** ✅ Yes | **Indexed:** Yes | **Pagination:** Yes

### 3. **Banner** 🎨
```typescript
{
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;           // Cloudinary URL
  isActive: boolean;
  created_at: string;
}
```
**Public Access:** ✅ Yes | **Indexed:** Yes | **Pagination:** Yes

### 4. **Order** 📦
```typescript
{
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  name: string;               // Required
  phone: string | number;     // Required
  district: string;           // Required
  city: string;               // Required
  address: string;            // Required
  description: string;        // Required
  items: OrderItem[];         // At least 1 item required
  totalAmount: number;
  status: OrderStatus;        // pending → delivered → reached
  statusHistory?: Array<{
    status: string;
    note?: string;
    location?: string;
    timestamp: string;
  }>;
  created_at: string;
}

type OrderStatus = 
  | 'pending' | 'confirmed' | 'processing' | 'sent'
  | 'on_the_way' | 'out_for_delivery' | 'shipped'
  | 'delivered' | 'received' | 'reached' | 'cancelled';
```
**Create:** ⚠️ Optional Auth | **Read/Update:** 🔐 Admin Only | **Indexed:** Yes

### 5. **Coupon** 🎟️
```typescript
{
  code: string;               // Unique, uppercase
  discountAmount: number;
  validFrom: string | Date;
  validTo: string | Date;
  isActive: boolean;
  created_at: string;
}
```
**Read Active:** ✅ Yes | **Validate:** ⚠️ Optional Auth | **Create:** 🔐 Admin Only

### 6. **Flash Sale** ⚡
```typescript
{
  id: string;
  productId: string;
  flashPrice: number;         // Special sale price
  currentStock: number;       // Used inventory
  maxStock: number;           // Max available
  startTime: string;          // ISO timestamp
  endTime: string;            // ISO timestamp
  isActive: boolean;
  created_at: string;
}
```
**Public Access:** ✅ Yes | **Create/Update:** 🔐 Admin Only

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```typescript
// User Token
{
  id: string;
  email?: string;
  role: 'user' | 'admin';
}

// Signing: Uses JWT_SECRET or JWT_ADMIN_SECRET
// Expiration: 7 days
// Header: Authorization: Bearer {token}
```

### Three Auth Levels

| Level | Requirement | Example Routes |
|-------|-------------|-----------------|
| **Public** | None | GET /products, /categories, /banners |
| **Optional** | Optional JWT | POST /orders, POST /coupons/validate |
| **Admin** | JWT + role='admin' | POST /products, PUT /categories, DELETE /banners |

### Security Layers

1. **HTTPS Encryption** - All traffic encrypted
2. **CORS Protection** - Whitelist frontend domain
3. **Helmet Headers** - XSS, clickjacking protection
4. **JWT Verification** - Token signature validation
5. **Role-Based Access** - Admin/user distinction
6. **Input Validation** - Joi schema validation
7. **File Upload Restrictions** - 5MB max, image types only
8. **Cloudinary Storage** - Secure image hosting

---

## 📡 API Endpoints (All 50+)

### Products (7 endpoints)
```
GET    /products               - List all (public, paginated)
GET    /products/offers        - List with offers (public)
GET    /products/category/:id  - By category (public)
GET    /products/:id           - Single product (public)
POST   /products               - Create (admin + image)
PUT    /products/:id           - Update (admin + image)
DELETE /products/:id           - Delete (admin)
```

### Categories (7 endpoints)
```
GET    /categories             - List all (public, paginated)
GET    /categories/active      - Active only (public)
GET    /categories/slug/:slug  - By slug (public)
GET    /categories/:id         - Single (public)
POST   /categories             - Create (admin + image)
PUT    /categories/:id         - Update (admin + image)
DELETE /categories/:id         - Delete (admin)
```

### Banners (7 endpoints)
```
GET    /banners                - List all (public, paginated)
GET    /banners/active         - Active only (public)
GET    /banners/:id            - Single (public)
POST   /banners                - Create (admin + image)
PUT    /banners/:id            - Update (admin + image)
DELETE /banners/:id            - Delete (admin)
```

### Orders (9 endpoints)
```
POST   /orders                 - Create (optional auth)
GET    /orders                 - List all (admin)
GET    /orders/stats           - Statistics (admin)
GET    /orders/status/:status  - By status (admin)
GET    /orders/user/:userId    - By user (admin)
GET    /orders/:id             - Single (admin)
GET    /orders/:id/status      - Status only (admin)
PUT    /orders/:id/status      - Update status (admin)
```

### Coupons (7 endpoints)
```
GET    /coupons/active         - Active coupons (public)
POST   /coupons/validate       - Validate code (optional auth)
GET    /coupons                - List all (admin)
GET    /coupons/:code          - By code (admin)
POST   /coupons                - Create (admin)
PUT    /coupons/:code          - Update (admin)
DELETE /coupons/:code          - Delete (admin)
```

### Flash Sales (8 endpoints)
```
GET    /flash-sales            - List all (public, paginated)
GET    /flash-sales/active     - Active only (public)
GET    /flash-sales/product/:id - By product (public)
GET    /flash-sales/:id        - Single (public)
GET    /flash-sales/:id/is-active - Check active (public)
POST   /flash-sales            - Create (admin)
PUT    /flash-sales/:id        - Update (admin)
DELETE /flash-sales/:id        - Delete (admin)
```

### Miscellaneous
```
GET    /health                 - Health check (public)
GET    /                       - Root info (public)
```

---

## 💻 Frontend Implementation Template

### 1. Setup API Client

```typescript
const API_BASE = 'https://backend-epasal.onrender.com/api/v1';

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  // Public endpoints
  getProducts(params?: any) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/products?${qs}`);
  }

  getCategories(params?: any) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/categories?${qs}`);
  }

  // Protected endpoints
  createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Admin endpoints
  createProduct(token: string, formData: FormData) {
    return fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    }).then(r => r.json());
  }
}

export const api = new APIClient();
```

### 2. Usage Examples

```typescript
// Fetch products
const { data: products } = await api.getProducts({ 
  page: 1, 
  limit: 20,
  hasOffer: true 
});

// Create order
const order = await api.createOrder({
  name: "John Doe",
  phone: "1234567890",
  district: "Kathmandu",
  city: "Kathmandu",
  address: "123 Main St",
  description: "ASAP",
  items: [
    {
      productId: "123",
      name: "Laptop",
      price: 50000,
      quantity: 1,
      imageUrl: "https://..."
    }
  ],
  totalAmount: 50000
});

// Validate coupon
const coupon = await api.request('/coupons/validate', {
  method: 'POST',
  body: JSON.stringify({ code: 'SUMMER50' })
});
```

---

## 🛡️ Security Best Practices for Frontend

### 1. Token Storage
```typescript
// Store in localStorage (or sessionStorage for sensitive apps)
localStorage.setItem('adminToken', token);

// Never store in cookies accessible to JavaScript
// Never log tokens to console in production
```

### 2. Request Headers
```typescript
// Always include token for protected routes
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

### 3. Error Handling
```typescript
try {
  const response = await fetch(endpoint, options);
  const data = await response.json();
  
  if (response.status === 401) {
    // Token expired - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else if (response.status === 403) {
    // Admin access required
    alert('Admin access required');
  } else if (!response.ok) {
    throw new Error(data.message);
  }
  
  return data;
} catch (error) {
  console.error('Request failed:', error);
}
```

### 4. Image URLs
```typescript
// All images returned are Cloudinary URLs
// Safe to use directly in <img> tags
<img src={product.imageUrl} alt={product.name} />

// Cloudinary handles optimization and caching
// Format: https://res.cloudinary.com/...
```

### 5. CORS Configuration
```env
# Backend .env (for you to configure)
CORS_ORIGIN=https://your-frontend-domain.com

# This enables your frontend to make requests to the API
```

---

## 🔍 Query Parameters Reference

### Pagination (All list endpoints)
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 10, max: 100
}
```

### Products Filter
```typescript
{
  search?: string;      // Search in name/description
  categoryId?: string;  // Filter by category
  sectionId?: string;   // Filter by section
  hasOffer?: boolean;   // Only with offers
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;   // Active/inactive
  sortBy?: string;      // Field to sort
  order?: 'asc' | 'desc';
}
```

### Orders Filter
```typescript
{
  status?: string;      // pending, processing, etc.
  userId?: string;      // Filter by user
  startDate?: string;   // ISO date
  endDate?: string;     // ISO date
}
```

---

## 📊 Response Format

### Success Response
```typescript
{
  success: true,
  message: "Operation successful",
  data: { /* entity or array */ },
  pagination?: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### Error Response
```typescript
{
  success: false,
  message: "Error description",
  error?: {                    // Only in development
    name: "ErrorType",
    message: "Details",
    stack: "..."
  }
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## 🎨 Image Upload

### Supported Formats
- JPEG, JPG
- PNG
- GIF
- WebP

### Constraints
- **Max Size:** 5MB
- **Storage:** Cloudinary (secure cloud storage)
- **Return:** Cloudinary URL (https://res.cloudinary.com/...)

### Frontend Upload
```typescript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('beforePrice', 100);
formData.append('image', imageFile); // File input

const response = await fetch(`${API_BASE}/products`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
    // Don't set Content-Type - browser will set it
  },
  body: formData
});
```

---

## 🚀 Deployment Info

### Current Deployment
- **Platform:** Render (free tier)
- **URL:** https://backend-epasal.onrender.com
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary
- **SSL:** Automatic (Render provides)

### Important Notes
- Free tier has 15-min inactivity spindown
- Upgrade to paid ($7+/month) for always-on
- MongoDB has 512MB free storage limit
- All services operational and tested

---

## 📞 Support Resources

| Resource | URL |
|----------|-----|
| **API Documentation** | https://backend-epasal.onrender.com/api-docs |
| **Health Check** | https://backend-epasal.onrender.com/api/v1/health |
| **GitHub Repository** | https://github.com/Bibek1604/backend-epasal |
| **Environment Variables** | See .env.example in repo |

---

## 🗂️ Frontend Integration Files

All documentation files are available in the repository:

1. **FRONTEND_INTEGRATION_GUIDE.md** - Complete guide with models and endpoints
2. **SECURITY_ARCHITECTURE.md** - Security implementation details
3. **FRONTEND_FETCH_EXAMPLES.md** - Copy-paste ready code examples
4. **This file** - Summary and quick reference

---

## ✅ Checklist for Frontend Developer

- [ ] Read FRONTEND_INTEGRATION_GUIDE.md completely
- [ ] Understand JWT authentication flow
- [ ] Set up API client with token management
- [ ] Implement error handling for 401/403 responses
- [ ] Test at least 3 public endpoints
- [ ] Test order creation (most critical)
- [ ] Configure CORS_ORIGIN environment variable
- [ ] Handle image URLs properly (use Cloudinary URLs directly)
- [ ] Implement pagination for list endpoints
- [ ] Set up proper token storage and refresh logic

---

## 🎯 Most Important Endpoints for MVP

```typescript
// Homepage
GET /products?limit=10
GET /categories/active
GET /banners/active
GET /flash-sales/active

// Product Page
GET /products/:id
GET /flash-sales/product/:productId

// Checkout
POST /orders
POST /coupons/validate

// Admin Dashboard
GET /orders (with admin token)
POST /products (with admin token, FormData)
```

---

## 📝 Notes

- All timestamps are ISO 8601 format (2024-01-15T10:30:00Z)
- Phone field accepts both string and number
- All prices are numbers (no currency symbol)
- Categories have unique slugs (use for URLs)
- Orders require at least 1 item
- Coupons are case-insensitive in validation but stored uppercase
- Flash sales check time automatically (isActive flag independent)

---

**Last Updated:** January 2025  
**API Version:** 1.0.0  
**Backend Status:** ✅ Production Ready
