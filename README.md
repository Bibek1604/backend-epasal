# Epasaley E-Commerce Backend

A complete, production-ready, scalable e-commerce backend built with Node.js, Express.js, TypeScript, and MongoDB.

## 🚀 Features

- ✅ **Full CRUD Operations** for Products, Categories, Banners, Coupons, Flash Sales, and Orders
- ✅ **JWT Authentication** with Admin and User roles
- ✅ **Image Upload** via Cloudinary
- ✅ **Advanced Filtering** and Pagination
- ✅ **Request Validation** with Joi
- ✅ **Error Handling** with custom error classes
- ✅ **MongoDB Indexes** for optimal performance
- ✅ **Cluster Mode** for horizontal scaling
- ✅ **Security** with Helmet, CORS, and compression
- ✅ **TypeScript** for type safety
- ✅ **MVC + Service Layer** architecture
- ✅ **Versioned API** (/api/v1)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                 # MongoDB connection
│   │   └── cloudinary.ts         # Cloudinary config
│   ├── controllers/              # Request handlers
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── category.controller.ts
│   │   ├── banner.controller.ts
│   │   ├── coupon.controller.ts
│   │   └── flashSale.controller.ts
│   ├── services/                 # Business logic
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── category.service.ts
│   │   ├── banner.service.ts
│   │   ├── coupon.service.ts
│   │   └── flashSale.service.ts
│   ├── routes/                   # API routes
│   │   ├── product.routes.ts
│   │   ├── order.routes.ts
│   │   ├── category.routes.ts
│   │   ├── banner.routes.ts
│   │   ├── coupon.routes.ts
│   │   ├── flashSale.routes.ts
│   │   └── index.ts
│   ├── models/                   # MongoDB schemas
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Category.ts
│   │   ├── Banner.ts
│   │   ├── Coupon.ts
│   │   └── FlashSale.ts
│   ├── middlewares/              # Custom middlewares
│   │   ├── asyncHandler.ts
│   │   ├── errorHandler.ts
│   │   ├── authMiddleware.ts
│   │   ├── validateRequest.ts
│   │   └── upload.ts
│   ├── utils/                    # Utility functions
│   │   ├── generateId.ts
│   │   ├── responseHelper.ts
│   │   ├── slugGenerator.ts
│   │   ├── tokenGenerator.ts
│   │   └── errors.ts
│   ├── validations/              # Joi schemas
│   │   ├── product.validation.ts
│   │   ├── order.validation.ts
│   │   ├── category.validation.ts
│   │   ├── banner.validation.ts
│   │   ├── coupon.validation.ts
│   │   └── flashSale.validation.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── app.ts                    # Express app
│   └── server.ts                 # Server entry point
├── .env                          # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Update `.env` file with your credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   
   MONGODB_URI=mongodb://localhost:27017/epasaley
   
   JWT_SECRET=your-super-secret-jwt-key
   JWT_ADMIN_SECRET=your-admin-secret-key
   JWT_EXPIRE=7d
   
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

5. **Run in cluster mode (production):**
   ```bash
   npm run start:cluster
   ```

## 📡 API Endpoints

Interactive API docs (Swagger UI):
- `GET /api-docs` - Swagger UI (global)
- `GET /api/v1/docs` - Swagger UI (API v1)


### Products
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/offers` - Get products with offers
- `GET /api/v1/products/category/:categoryId` - Get products by category
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get all orders (Admin)
- `GET /api/v1/orders/:id` - Get order by ID (Admin)
- `GET /api/v1/orders/stats` - Get order statistics (Admin)
- `PUT /api/v1/orders/:id/status` - Update order status (Admin)
- `GET /api/v1/orders/user/:userId` - Get orders by user (Admin)
- `GET /api/v1/orders/status/:status` - Get orders by status (Admin)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `GET /api/v1/categories/slug/:slug` - Get category by slug
- `GET /api/v1/categories/active` - Get active categories
- `POST /api/v1/categories` - Create category (Admin)
- `PUT /api/v1/categories/:id` - Update category (Admin)
- `DELETE /api/v1/categories/:id` - Delete category (Admin)

### Banners
- `GET /api/v1/banners` - Get all banners
- `GET /api/v1/banners/:id` - Get banner by ID
- `GET /api/v1/banners/active` - Get active banners
- `POST /api/v1/banners` - Create banner (Admin)
- `PUT /api/v1/banners/:id` - Update banner (Admin)
- `DELETE /api/v1/banners/:id` - Delete banner (Admin)

### Coupons
- `GET /api/v1/coupons` - Get all coupons (Admin)
- `GET /api/v1/coupons/:code` - Get coupon by code (Admin)
- `GET /api/v1/coupons/active` - Get active coupons
- `POST /api/v1/coupons/validate` - Validate coupon
- `POST /api/v1/coupons` - Create coupon (Admin)
- `PUT /api/v1/coupons/:code` - Update coupon (Admin)
- `DELETE /api/v1/coupons/:code` - Delete coupon (Admin)

### Flash Sales
- `GET /api/v1/flash-sales` - Get all flash sales
- `GET /api/v1/flash-sales/:id` - Get flash sale by ID
- `GET /api/v1/flash-sales/active` - Get active flash sales
- `GET /api/v1/flash-sales/product/:productId` - Get flash sale by product
- `GET /api/v1/flash-sales/:id/is-active` - Check if flash sale is active
- `POST /api/v1/flash-sales` - Create flash sale (Admin)
- `PUT /api/v1/flash-sales/:id` - Update flash sale (Admin)
- `DELETE /api/v1/flash-sales/:id` - Delete flash sale (Admin)
- `POST /api/v1/flash-sales/:id/increment-stock` - Increment stock (Admin)
- `POST /api/v1/flash-sales/deactivate-expired` - Deactivate expired (Admin)

## 🔐 Authentication

Add JWT token to request headers:
```
Authorization: Bearer <your-jwt-token>
```

Admin routes require admin role in JWT payload.

## 📊 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Filters
- `search` - Search term
- `sortBy` - Field to sort by
- `order` - Sort order (asc/desc)
- `isActive` - Filter by active status

### Product-specific
- `categoryId` - Filter by category
- `sectionId` - Filter by section
- `hasOffer` - Filter products with offers
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

## 🎯 Performance Optimizations

- **MongoDB Indexes** on frequently queried fields
- **Lean queries** for read operations
- **Pagination** to limit response size
- **Connection pooling** for database
- **Compression middleware** for responses
- **Cluster mode** for multi-core utilization

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **JWT** authentication
- **Request validation** with Joi
- **Error handling** without stack traces in production
- **File upload** size limits

## 📝 Database Schema

All collections follow consistent patterns with:
- Unique ID fields (e.g., `prod_1732377600000_xyz123`)
- Created timestamps
- Active/inactive status flags
- Proper indexing for performance

## 🧪 Testing

Example request to create a product:
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Sample Product",
    "description": "Product description",
    "beforePrice": 100,
    "afterPrice": 80,
    "discountPrice": 20,
    "hasOffer": true,
    "sectionId": "electronics",
    "stock": 50
  }'
```

## 📦 Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run with PM2 (recommended):
   ```bash
   pm2 start dist/server.js -i max
   ```

Or use cluster mode:
   ```bash
   node dist/server.js --cluster
   ```

## 🤝 Contributing

This is a complete, production-ready backend. Feel free to extend it with:
- User authentication system
- Payment gateway integration
- Email notifications
- Analytics and reporting
- Inventory management
- Wishlist functionality

## 📄 License

ISC


#   b a c k e n d - e p a s a l  
 