# Backend Security Architecture & Model Details

## 🔒 Security Layers Implemented

### Layer 1: HTTPS/Transport Security
```
┌─────────────────────────────────────┐
│  Client (Frontend)                  │
└──────────────┬──────────────────────┘
               │ HTTPS Encrypted
               ↓
┌─────────────────────────────────────┐
│  Render Hosting                     │
│  (Free tier with SSL certificate)   │
└──────────────┬──────────────────────┘
               │
               ↓ Secure Connection
```

### Layer 2: CORS (Cross-Origin Resource Sharing)
```typescript
// Prevents unauthorized domains from accessing API
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',  // Whitelist frontend domain
  credentials: true,                        // Allow cookies/auth headers
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
```

**Configuration in .env:**
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

### Layer 3: Helmet.js Security Headers
```typescript
// Automatic security headers on all responses
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],        // Only allow resources from same origin
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],         // No external scripts
      imgSrc: ["'self'", "data:", "https:"], // Allow images from self + HTTPS
    },
  },
  crossOriginEmbedderPolicy: false,
})
```

**Headers Sent:**
```
X-Frame-Options: DENY                        → Prevents clickjacking
X-Content-Type-Options: nosniff              → Prevents MIME sniffing
X-XSS-Protection: 1; mode=block              → XSS protection
Strict-Transport-Security: max-age=31536000  → Forces HTTPS
Content-Security-Policy: ...                 → Controls resource loading
```

### Layer 4: JWT Authentication
```
┌──────────────────────────────────────────────────────┐
│              JWT Token Generation                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Payload:                                           │
│  {                                                  │
│    "id": "user_123",                               │
│    "email": "user@example.com",                    │
│    "role": "user" | "admin"                        │
│  }                                                  │
│                                                      │
│  Signing Secret:                                    │
│  - User: JWT_SECRET (32+ chars)                    │
│  - Admin: JWT_ADMIN_SECRET (32+ chars)             │
│                                                      │
│  Expiration: 7 days (configurable)                │
│                                                      │
│  Result: Signed JWT Token                          │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.            │
│  eyJpZCI6InVzZXJfMTIzIn0...                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Layer 5: Role-Based Access Control (RBAC)

```typescript
// Authentication Middleware Chain
┌─────────────────────────────────────────────────────┐
│ 1. Extract Token from Authorization Header          │
│    "Authorization: Bearer {token}"                  │
└──────────────┬──────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────┐
│ 2. Verify JWT Signature                             │
│    - Check token hasn't been tampered               │
│    - Verify against correct secret (admin/user)     │
└──────────────┬──────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────┐
│ 3. Check Token Expiration                           │
│    - If expired → 401 Unauthorized                  │
└──────────────┬──────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────┐
│ 4. Extract & Attach User Info to Request            │
│    req.user = { id, email, role }                   │
└──────────────┬──────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────┐
│ 5. Check Authorization (if required)                │
│    - For admin routes: role === 'admin' ?           │
│    - For user routes: role exists ?                 │
│    - If fails → 403 Forbidden                       │
└──────────────┬──────────────────────────────────────┘
               ↓
         ✅ Request Allowed
```

### Middleware Types

```typescript
// 1. Public (No Auth Required)
router.get('/products', productController.getProducts);

// 2. Optional Auth
router.post('/orders', optionalAuth, orderController.createOrder);
// - Works with or without token
// - If token provided, req.user populated
// - If no token, req.user = undefined, request continues

// 3. User Auth
router.get('/orders', requireAuth, orderController.getOrders);
// - Must have valid token
// - req.user.role can be 'user' or 'admin'
// - If missing/invalid → 401 Unauthorized

// 4. Admin Auth Only
router.post('/products', requireAdmin, productController.createProduct);
// - Must have valid token
// - Must have req.user.role === 'admin'
// - If not admin → 403 Forbidden
```

### Layer 6: Input Validation

```typescript
// Joi Schema Validation on ALL inputs
createProductSchema = {
  body: Joi.object({
    name: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(200),
    price: Joi.number()
      .min(0),
    description: Joi.string()
      .allow(null, ''),
  }),
};

// Validation middleware runs on all routes
router.post('/products', 
  requireAdmin,
  validateRequest(createProductSchema),  // ← Validates input
  productController.createProduct
);

// Returns 400 Bad Request if validation fails
{
  "success": false,
  "message": "Validation failed: 'name' must be at least 3 characters"
}
```

### Layer 7: File Upload Security

```typescript
// Multer Configuration
const upload = multer({
  storage: multer.memoryStorage(),  // Store in RAM, not disk
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(file.mimetype);
    
    if (isValid) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only image files allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB max
  },
});

// Uploaded to Cloudinary (secure cloud storage)
// Local disk never receives user files
```

### Layer 8: Error Handling Security

```typescript
// Development vs Production Error Response
if (process.env.NODE_ENV === 'development') {
  // Include full stack trace in development
  response = {
    success: false,
    message: "Database connection failed",
    error: {
      name: "MongooseError",
      message: "Connection timeout",
      stack: "[full stack trace]"
    }
  };
} else {
  // Hide technical details in production
  response = {
    success: false,
    message: "Server error occurred"
    // No error details exposed
  };
}
```

---

## 📊 Complete Data Models with Field Specifications

### Product Model (Full Specification)

```typescript
// TypeScript Interface
interface IProduct {
  id: string;                 // Unique identifier (generated)
  name: string;               // Required, 3-200 chars
  description?: string;       // Optional
  price?: number;             // Calculated from other prices
  beforePrice: number;        // Original price (required)
  afterPrice: number;         // Discounted price (required)
  discountPrice: number;      // Discount amount (required)
  hasOffer: boolean;          // Offer flag
  imageUrl: string;           // Cloudinary URL (required)
  stock?: number;             // Inventory quantity
  category_id?: string;       // Reference to Category
  sectionId: string;          // Product section (required)
  isActive: boolean;          // Active/inactive flag
  created_at: string;         // ISO timestamp
}

// MongoDB Schema Validation
{
  id: { type: String, required: true, unique: true, indexed: true },
  name: { type: String, required: true, trim: true, indexed: true },
  description: { type: String, default: null },
  price: { type: Number, default: null },
  beforePrice: { type: Number, required: true, min: 0 },
  afterPrice: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, required: true, default: 0, min: 0 },
  hasOffer: { type: Boolean, default: false, indexed: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, default: null },
  category_id: { type: String, default: null, indexed: true },
  sectionId: { type: String, required: true, indexed: true },
  isActive: { type: Boolean, default: true, indexed: true },
  created_at: { type: String, required: true },
}

// Database Indexes (Performance Optimization)
ProductSchema.index({ isActive: 1, created_at: -1 });
ProductSchema.index({ category_id: 1, isActive: 1 });
ProductSchema.index({ sectionId: 1, isActive: 1 });
ProductSchema.index({ hasOffer: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
// ↑ Enables fast searching and filtering
```

### Order Model (Full Specification)

```typescript
// OrderItem Embedded Schema
interface IOrderItem {
  productId: string;          // Product reference
  name: string;               // Product name (snapshot)
  price: number;              // Price at purchase time
  quantity: number;           // Units ordered (min: 1)
  imageUrl: string;           // Product image (snapshot)
}

// Full Order Schema
interface IOrder {
  id: string;                 // Unique order ID
  user_id?: string;           // Optional customer ID
  first_name?: string;
  last_name?: string;
  name: string;               // Customer name (required)
  phone: string | number;     // Contact number (required)
  district: string;           // Location (required)
  city: string;               // City (required, indexed)
  address: string;            // Delivery address (required)
  description: string;        // Special instructions (required)
  items: IOrderItem[];        // Order items (min: 1)
  totalAmount: number;        // Total price
  status: OrderStatus;        // Current status
  statusHistory?: Array<{
    status: string;           // Status at this time
    note?: string;            // Update note
    location?: string;        // Delivery location
    timestamp: string;        // When changed (ISO format)
  }>;
  created_at: string;         // Order creation time
}

// Status Enum
type OrderStatus = 
  | 'pending'               // Just created
  | 'confirmed'             // Customer confirmed
  | 'processing'            // Being packed
  | 'sent'                  // Shipped out
  | 'on_the_way'            // In transit
  | 'out_for_delivery'      // Day of delivery
  | 'shipped'               // Delivered to location
  | 'delivered'             // Received
  | 'received'              // Acknowledged
  | 'reached'               // Final status
  | 'cancelled';            // Order cancelled

// MongoDB Indexes
OrderSchema.index({ status: 1, created_at: -1 });
OrderSchema.index({ user_id: 1, created_at: -1 });
OrderSchema.index({ user_id: 1, status: 1 });

// Validation: At least 1 item required
items: {
  type: [OrderItemSchema],
  required: true,
  validate: {
    validator: (v: IOrderItem[]) => v.length > 0,
    message: 'Order must have at least one item',
  },
}
```

### Category Model (Full Specification)

```typescript
interface ICategory {
  id: string;                 // Unique ID
  name: string;               // Category name (required)
  slug: string;               // URL-friendly slug (unique, indexed)
  description: string;        // Category description
  imageUrl: string;           // Cloudinary image URL
  isActive: boolean;          // Active/inactive
  created_at: string;         // Creation timestamp
}

// MongoDB Validation
{
  id: { type: String, required: true, unique: true, indexed: true },
  name: { type: String, required: true, trim: true, indexed: true },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true, 
    indexed: true 
  },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true, indexed: true },
  created_at: { type: String, required: true },
}

// Index
CategorySchema.index({ isActive: 1, created_at: -1 });
```

### Banner Model (Full Specification)

```typescript
interface IBanner {
  id: string;                 // Unique ID
  title: string;              // Banner title
  subtitle?: string;          // Optional subtitle
  imageUrl: string;           // Cloudinary image
  isActive: boolean;          // Display flag
  created_at: string;         // Creation time
}

// MongoDB Validation
{
  id: { type: String, required: true, unique: true, indexed: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: null },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true, indexed: true },
  created_at: { type: String, required: true },
}

// Index
BannerSchema.index({ isActive: 1, created_at: -1 });
```

### Coupon Model (Full Specification)

```typescript
interface ICoupon {
  code: string;               // Coupon code (unique, uppercase)
  discountAmount: number;     // Discount value
  validFrom: string | Date;   // Start date
  validTo: string | Date;     // Expiry date
  isActive: boolean;          // Active flag
  created_at: string;         // Creation time
}

// MongoDB Validation
{
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true, 
    indexed: true 
  },
  discountAmount: { type: Number, required: true, min: 0 },
  validFrom: { type: Schema.Types.Mixed, required: true },
  validTo: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true, indexed: true },
  created_at: { type: String, required: true },
}

// Indexes
CouponSchema.index({ isActive: 1, validTo: 1 });
CouponSchema.index({ code: 1, isActive: 1 });
```

### Flash Sale Model (Full Specification)

```typescript
interface IFlashSale {
  id: string;                 // Unique ID
  productId: string;          // Product being sold
  flashPrice: number;         // Flash sale price
  currentStock: number;       // Stock used (min: 0)
  maxStock: number;           // Max available
  startTime: string;          // Sale start (ISO format)
  endTime: string;            // Sale end (ISO format)
  isActive: boolean;          // Active flag
  created_at: string;         // Creation time
}

// MongoDB Validation & Pre-hook
FlashSaleSchema.pre('save', function (next) {
  // Validate: currentStock <= maxStock
  if (this.currentStock > this.maxStock) {
    next(new Error('Current stock cannot exceed max stock'));
  } else {
    next();
  }
});

// Indexes
FlashSaleSchema.index({ isActive: 1, startTime: 1, endTime: 1 });
FlashSaleSchema.index({ productId: 1, isActive: 1 });
```

---

## 🔐 Authentication Methods by Route

### Public Routes (No Authentication)

```typescript
// These endpoints work WITHOUT any token

// Get all products
GET /products
→ No Authorization header needed
← Returns: [Product[], pagination]

// Get active categories
GET /categories/active
→ No Authorization header needed
← Returns: [Category[]]

// Get active banners
GET /banners/active
→ No Authorization header needed
← Returns: [Banner[]]

// Get active coupons
GET /coupons/active
→ No Authorization header needed
← Returns: [Coupon[]]

// Get active flash sales
GET /flash-sales/active
→ No Authorization header needed
← Returns: [FlashSale[]]
```

### Optional Authentication Routes

```typescript
// These endpoints WORK with OR without token
// If token provided, will attach user info
// If no token, proceeds as guest

// Create order (guest or registered)
POST /orders
Optional: Authorization: Bearer {token}
← Returns: Order (with user_id if authenticated)

// Validate coupon
POST /coupons/validate
Optional: Authorization: Bearer {token}
← Returns: { valid: boolean, ... }
```

### User Authentication Required

```typescript
// These endpoints require valid user or admin token
Required: Authorization: Bearer {userToken}

// For user-specific operations
// (Currently not heavily used in this API)
```

### Admin Authentication Required

```typescript
// These endpoints require valid ADMIN token
Required: Authorization: Bearer {adminToken}
// AND user.role === 'admin'

// Products
POST /products           // Create
PUT /products/:id        // Update
DELETE /products/:id     // Delete

// Categories
POST /categories
PUT /categories/:id
DELETE /categories/:id

// Banners
POST /banners
PUT /banners/:id
DELETE /banners/:id

// Coupons
POST /coupons
PUT /coupons/:code
DELETE /coupons/:code

// Orders (read-only for admin)
GET /orders
GET /orders/:id
PUT /orders/:id/status

// Flash Sales
POST /flash-sales
PUT /flash-sales/:id
DELETE /flash-sales/:id

// If not admin → 403 Forbidden error
{
  "success": false,
  "message": "Admin access required"
}
```

---

## 🛡️ Security Checklist

### ✅ Implemented Security Features

- [x] **HTTPS Encryption** - All traffic encrypted in transit
- [x] **JWT Authentication** - Stateless token-based auth
- [x] **Separate Admin Secrets** - Different keys for admin/user tokens
- [x] **Token Expiration** - 7-day validity period
- [x] **Role-Based Access Control** - Admin/user distinction
- [x] **CORS Protection** - Frontend domain whitelisting
- [x] **Helmet.js Security Headers** - XSS, clickjacking protection
- [x] **Input Validation** - Joi schema validation on all inputs
- [x] **File Upload Restrictions** - Max 5MB, image types only
- [x] **Cloudinary Integration** - Secure cloud storage for images
- [x] **Error Handling** - Production error hiding
- [x] **Database Indexes** - Efficient query performance
- [x] **MongoDB Authentication** - Username/password + IP whitelist
- [x] **Rate Limiting Ready** - Can be added to middleware stack

### ⚠️ Additional Recommendations

1. **Rate Limiting** - Add to prevent brute force attacks
   ```typescript
   // Install: npm install express-rate-limit
   const rateLimit = require('express-rate-limit');
   app.use(rateLimit({
     windowMs: 15 * 60 * 1000,  // 15 minutes
     max: 100,                   // Requests per window
   }));
   ```

2. **Refresh Tokens** - Implement token refresh flow
3. **API Key for Mobile** - Alternative to JWT for mobile apps
4. **Audit Logging** - Log all admin actions
5. **2FA for Admin** - Two-factor authentication
6. **Request Signing** - HMAC signatures for sensitive operations

---

## 🚀 How Frontend Should Implement Auth

### Step 1: Get Admin Token (if needed)

```typescript
// For admin operations, need to get admin token first
const loginAsAdmin = async (credentials) => {
  // This endpoint doesn't exist yet - needs implementation
  // Mock example:
  const response = await fetch('/api/v1/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  // data.token = JWT_ADMIN_SECRET signed token
  
  return data.token;
};

// Store token
localStorage.setItem('adminToken', adminToken);
```

### Step 2: Use Token for Admin API Calls

```typescript
// When making admin requests
const createProduct = async (productData) => {
  const adminToken = localStorage.getItem('adminToken');
  
  const response = await fetch(
    'https://backend-epasal.onrender.com/api/v1/products',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`  // ← Include token
      },
      body: JSON.stringify(productData)
    }
  );
  
  return await response.json();
};
```

### Step 3: Handle Auth Errors

```typescript
const makeAuthenticatedRequest = async (endpoint, options) => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Handle different status codes
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('adminToken');
    // Redirect to login
    window.location.href = '/admin/login';
  } else if (response.status === 403) {
    // Admin access required
    alert('You do not have admin access');
  } else if (!response.ok) {
    throw new Error(data.message);
  }
  
  return data;
};
```

---

## 📝 Example: Complete Flow for Creating Product

```
Frontend Admin Dashboard
│
├─ User clicks "Create Product"
│
├─ Opens form with:
│  ├─ name (string, 3-200 chars)
│  ├─ description (string, optional)
│  ├─ beforePrice (number)
│  ├─ afterPrice (number)
│  ├─ discountPrice (number)
│  ├─ hasOffer (boolean)
│  ├─ stock (number, optional)
│  ├─ category_id (string, optional)
│  ├─ sectionId (string)
│  └─ image file (image/jpeg, png, gif, webp, max 5MB)
│
├─ User fills form and clicks "Create"
│
├─ Frontend validation:
│  ├─ Check name length ✓
│  ├─ Check prices are positive ✓
│  ├─ Check image is valid format ✓
│  └─ Check file size < 5MB ✓
│
├─ Prepare FormData
│  └─ Append all fields + image file
│
├─ Send request with admin token:
│  POST /products
│  Headers: Authorization: Bearer {adminToken}
│  Body: FormData
│
├─ Backend receives request
│  ├─ Extract token from header
│  ├─ Verify JWT signature ✓
│  ├─ Check token not expired ✓
│  ├─ Check role === 'admin' ✓
│  ├─ Validate input (Joi schema) ✓
│  ├─ Upload image to Cloudinary ✓
│  ├─ Generate unique product ID ✓
│  ├─ Save to MongoDB ✓
│  └─ Create indexes for performance ✓
│
├─ Backend returns:
│  {
│    "success": true,
│    "message": "Product created successfully",
│    "data": {
│      "id": "prod_xyz",
│      "name": "...",
│      "imageUrl": "https://res.cloudinary.com/...",
│      "created_at": "2024-01-15T10:30:00Z"
│    }
│  }
│
└─ Frontend:
   ├─ Show success message
   ├─ Add product to list
   └─ Redirect or refresh
```

