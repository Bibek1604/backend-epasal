# Authentication API Documentation

Complete authentication system for admin access with JWT token generation.

## 📋 Overview

- **Authentication Type**: JWT (JSON Web Tokens)
- **Token Expiry**: 7 days
- **Storage**: Headers (Authorization: Bearer <token>)
- **Use Cases**: Category management, product management, order management (admin endpoints)

## 🔐 Endpoints

### 1. Login with Admin ID & Password

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Generate JWT token for authorization using admin ID and password.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "adminId": "ADMIN001",
  "password": "Admin@123"
}
```

**Parameters:**
- `adminId` (string, required): Unique admin identifier (minimum 3 characters)
- `password` (string, required): Admin password (minimum 6 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "adminId": "ADMIN001",
      "name": "Admin User",
      "email": "admin@epasaley.com",
      "role": "super_admin"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing adminId or password:
```json
{
  "success": false,
  "message": "Admin ID and password are required"
}
```

- **401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid admin ID or password"
}
```

- **401 Unauthorized** - Inactive admin:
```json
{
  "success": false,
  "message": "Admin account is inactive"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "ADMIN001",
    "password": "Admin@123"
  }'
```

**JavaScript Fetch Example:**
```typescript
import { apiClient } from '@/api'; // Using React API service

const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const data = await response.json();
if (data.success) {
  // Store token
  localStorage.setItem('authToken', data.data.token);
  console.log('Admin:', data.data.admin);
}
```

---

### 2. Get Current Admin Profile

**Endpoint:** `GET /api/v1/auth/profile`

**Description:** Retrieve current authenticated admin's profile information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "adminId": "ADMIN001",
    "name": "Admin User",
    "email": "admin@epasaley.com",
    "role": "super_admin",
    "isActive": true,
    "lastLogin": "2025-11-28T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **401 Unauthorized** - Missing or invalid token

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Update Admin Password

**Endpoint:** `PUT /api/v1/auth/password`

**Description:** Change admin password (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "Admin@123",
  "newPassword": "NewPassword@456"
}
```

**Parameters:**
- `oldPassword` (string, required): Current password (minimum 6 characters)
- `newPassword` (string, required): New password (minimum 6 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- **400 Bad Request** - Missing fields or validation error
- **401 Unauthorized** - Old password is incorrect

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/v1/auth/password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "Admin@123",
    "newPassword": "NewPassword@456"
  }'
```

---

### 4. Admin Registration (Super Admin Only)

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register new admin account (only super_admin can create admins).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "adminId": "ADMIN002",
  "email": "manager@epasaley.com",
  "password": "Manager@123",
  "name": "Manager User",
  "role": "admin"
}
```

**Parameters:**
- `adminId` (string, required): Unique admin ID (minimum 3 characters)
- `email` (string, required): Valid email address
- `password` (string, required): Password (minimum 6 characters)
- `name` (string, required): Admin name
- `role` (string, optional): "admin" or "super_admin" (default: "admin")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f1f77bcf86cd799439012",
      "adminId": "ADMIN002",
      "name": "Manager User",
      "email": "manager@epasaley.com",
      "role": "admin"
    }
  }
}
```

**Error Responses:**
- **400 Bad Request** - Missing fields or duplicate admin

---

### 5. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout (mainly for frontend to clear token). Token remains valid until expiry.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please clear the token from your client."
}
```

---

## 🛡️ Using Token with Admin Endpoints

After login, include the token in all admin-protected requests:

### Example: Create Category (requires token)

```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices",
    "slug": "electronics"
  }'
```

---

## 📋 Admin Roles

### Super Admin (super_admin)
- Can create new admins
- Can manage all categories, products, orders, coupons, banners, flash sales
- Can view all admin activities
- Full system access

### Admin
- Cannot create new admins
- Can manage categories, products, orders, coupons, banners, flash sales
- Limited system access

---

## 🔑 Sample Admin Credentials

Run the setup script to create sample admins:

```bash
npm run setup-admin
```

Default credentials after setup:

**Super Admin:**
- Admin ID: `ADMIN001`
- Email: `admin@epasaley.com`
- Password: `Admin@123`
- Role: `super_admin`

**Manager:**
- Admin ID: `ADMIN002`
- Email: `manager@epasaley.com`
- Password: `Manager@123`
- Role: `admin`

---

## 🚀 Integration Steps

### Step 1: Setup Initial Admin
```bash
npm run setup-admin
```

### Step 2: Login to Get Token
```javascript
const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;
```

### Step 3: Use Token for Admin Operations
```javascript
// Create category
const categoryResponse = await fetch('http://localhost:5000/api/v1/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Electronics',
    description: 'Electronic devices'
  })
});
```

### Step 4: Store Token (Frontend)
```javascript
// In React
localStorage.setItem('authToken', token);

// Retrieve for subsequent requests
const token = localStorage.getItem('authToken');
```

### Step 5: Handle Token Expiry
```javascript
try {
  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## 🔐 Security Best Practices

1. **Never share tokens** - Keep tokens confidential
2. **Use HTTPS** - Always use HTTPS in production
3. **Store securely** - Use secure storage (localStorage, sessionStorage, or httpOnly cookies)
4. **Add expiry** - Tokens expire in 7 days for security
5. **Refresh tokens** - Implement refresh token mechanism if needed
6. **Clear on logout** - Always clear token from storage when logout
7. **Use strong passwords** - Minimum 6 characters, mix of alphanumeric and special characters

---

## 📚 Related Endpoints Requiring Authentication

All admin operations require `Authorization: Bearer <token>` header:

| Endpoint | Method | Role Required |
|----------|--------|---------------|
| `/categories` | POST/PUT/DELETE | admin, super_admin |
| `/products` | POST/PUT/DELETE | admin, super_admin |
| `/orders` | GET/PUT | admin, super_admin |
| `/coupons` | POST/PUT/DELETE | admin, super_admin |
| `/banners` | POST/PUT/DELETE | admin, super_admin |
| `/flash-sales` | POST/PUT/DELETE | admin, super_admin |

---

## 🎯 Testing with Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/v1/auth/login`
   - Body (JSON):
   ```json
   {
     "adminId": "ADMIN001",
     "password": "Admin@123"
   }
   ```

2. **Use Token in Header:**
   - In Postman, go to Authorization tab
   - Select "Bearer Token"
   - Paste the token from login response

3. **Make Admin Request:**
   - Create category, product, etc. with the token

---

## 🐛 Troubleshooting

**"Invalid admin ID or password"**
- Verify credentials are correct
- Check admin ID exists in database
- Use setup script if no admins exist: `npm run setup-admin`

**"Admin account is inactive"**
- Contact super_admin to activate account
- Or update in database: `db.admins.updateOne({ adminId: 'ADMIN001' }, { isActive: true })`

**"Admin access required"**
- Current token is not admin role
- Login with admin credentials

**Token expired**
- Login again to get new token
- Token lasts 7 days

---

**Created:** 2025-11-28  
**Backend Version:** 1.0.0  
**API Version:** v1
