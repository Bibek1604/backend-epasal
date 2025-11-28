# Authentication System - Implementation Summary

Complete JWT-based authentication system for admin authorization.

## ✅ What Was Created

### 1. **Admin Model** (`src/models/Admin.ts`)
- MongoDB schema for admin users
- Password hashing with bcryptjs
- Admin ID (unique identifier) instead of username
- Admin roles: `admin` and `super_admin`
- Active/inactive status
- Last login tracking

### 2. **Auth Controller** (`src/controllers/auth.controller.ts`)
- **login()** - Generate JWT token with admin ID + password
- **getProfile()** - Get current admin info
- **register()** - Create new admin (super_admin only)
- **updatePassword()** - Change admin password
- **logout()** - Logout endpoint

### 3. **Auth Routes** (`src/routes/auth.routes.ts`)
- `POST /api/v1/auth/login` - Login with adminId + password → get token
- `GET /api/v1/auth/profile` - Get admin profile (requires auth)
- `POST /api/v1/auth/register` - Register new admin (requires auth)
- `PUT /api/v1/auth/password` - Update password (requires auth)
- `POST /api/v1/auth/logout` - Logout (requires auth)

### 4. **Setup Script** (`setupAdmin.ts`)
- Run: `npm run setup-admin`
- Creates default admin accounts
- Interactive setup process

### 5. **Documentation** (`AUTH_API.md`)
- Complete API documentation
- Usage examples
- Security best practices
- Troubleshooting guide

---

## 🚀 Quick Start

### Step 1: Install bcryptjs (if not already installed)
```bash
npm install bcryptjs
```

### Step 2: Create Admin Accounts
```bash
npm run setup-admin
```

### Step 3: Login to Get Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "ADMIN001",
    "password": "Admin@123"
  }'
```

### Step 4: Use Token for Category Operations
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices"
  }'
```

---

## 📋 Default Admin Credentials (After Setup)

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

## 🔑 How It Works

```
1. Admin sends ID + Password
   ↓
2. Backend verifies credentials
   ↓
3. Backend generates JWT token
   ↓
4. Admin stores token
   ↓
5. Admin includes token in Authorization header for all admin requests
   ↓
6. Backend verifies token and checks admin role
   ↓
7. If valid, allow operation; if invalid, return 401 error
```

---

## 🛡️ Token Structure

**Token Payload:**
```json
{
  "id": "admin_mongodb_id",
  "email": "admin@epasaley.com",
  "role": "super_admin",
  "iat": 1701158400,
  "exp": 1701763200
}
```

**Expiry:** 7 days

**Storage:** Include in `Authorization: Bearer <token>` header

---

## 📍 Integration with Existing Endpoints

All admin-only endpoints now use the auth system:

| Endpoint | Method | Auth Required | Role |
|----------|--------|---------------|------|
| `/categories` | GET | ❌ No | Public |
| `/categories` | POST | ✅ Yes | admin, super_admin |
| `/categories/{id}` | PUT | ✅ Yes | admin, super_admin |
| `/categories/{id}` | DELETE | ✅ Yes | admin, super_admin |
| `/products` | GET | ❌ No | Public |
| `/products` | POST | ✅ Yes | admin, super_admin |
| `/products/{id}` | PUT | ✅ Yes | admin, super_admin |
| `/products/{id}` | DELETE | ✅ Yes | admin, super_admin |
| `/orders` | GET | ✅ Yes | admin, super_admin |
| `/orders` | POST | ❌ No | Public |
| `/banners` | GET | ❌ No | Public |
| `/banners` | POST | ✅ Yes | admin, super_admin |
| `/coupons` | GET | ❌ No | Public |
| `/coupons/validate` | POST | ❌ No | Public |
| `/flash-sales` | GET | ❌ No | Public |

---

## 🔐 Example: Login and Create Category

### JavaScript
```typescript
// Step 1: Login
const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const { data } = await loginRes.json();
const token = data.token;

// Step 2: Create Category
const categoryRes = await fetch('http://localhost:5000/api/v1/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Electronics',
    description: 'Electronic devices',
    slug: 'electronics'
  })
});

const category = await categoryRes.json();
console.log('Category created:', category.data);
```

### React (Using API Service)
```typescript
import { apiClient } from '@/api';

// Login
const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const { data: { token } } = await loginRes.json();

// Set token globally
apiClient.setToken(token);

// Now all requests automatically include the token
const response = await fetch('http://localhost:5000/api/v1/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Electronics',
    description: 'Electronic devices'
  })
});
```

---

## 🎯 Features

✅ **JWT Token Generation** - Secure token-based authentication  
✅ **Password Hashing** - bcryptjs hashing with salt  
✅ **Role-Based Access** - admin and super_admin roles  
✅ **Token Expiry** - 7-day expiration for security  
✅ **Admin ID System** - Unique admin IDs instead of usernames  
✅ **Last Login Tracking** - Track when admins last logged in  
✅ **Account Status** - Activate/deactivate admin accounts  
✅ **Password Update** - Change password with old password verification  
✅ **Profile Retrieval** - Get admin profile information  
✅ **Setup Script** - Easy admin initialization  

---

## 📁 File Changes

**New Files:**
- ✅ `src/models/Admin.ts` - Admin schema
- ✅ `src/controllers/auth.controller.ts` - Auth logic
- ✅ `src/routes/auth.routes.ts` - Auth endpoints
- ✅ `setupAdmin.ts` - Setup script
- ✅ `AUTH_API.md` - Documentation

**Modified Files:**
- ✅ `src/routes/index.ts` - Added auth routes
- ✅ `package.json` - Added setup-admin script

---

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"ADMIN001","password":"Admin@123"}'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <token_from_login>"
```

### Test Category Creation
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electric devices"}'
```

---

## 🔄 Admin Workflow

```
1. Register Admin (Super Admin Creates)
   ↓
2. Admin gets credentials (ID + Password)
   ↓
3. Admin logs in → gets JWT token
   ↓
4. Admin uses token for all operations
   ↓
5. Token includes admin role (admin or super_admin)
   ↓
6. Backend validates role for protected endpoints
```

---

## 📚 API Response Format

### Success (200/201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* operation data */ }
}
```

### Error (400/401/403/500)
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

---

## ⚙️ Configuration

**Environment Variables Required:**
```env
JWT_SECRET=your_jwt_secret_for_users
JWT_ADMIN_SECRET=your_jwt_secret_for_admins
JWT_EXPIRE=7d
MONGODB_URI=your_mongodb_uri
```

**Token Generation Logic:**
- Admins use `JWT_ADMIN_SECRET`
- Users use `JWT_SECRET`
- This allows separate key rotation for admins

---

## 🚀 Next Steps

1. **Run Setup:** `npm run setup-admin`
2. **Login:** Get token with admin credentials
3. **Test:** Create categories, products, etc. using token
4. **Deploy:** Deploy to production with proper env variables
5. **Rotate Keys:** Periodically rotate JWT secrets

---

## 📖 Documentation

Full authentication API documentation available in: **AUTH_API.md**

---

**Status:** ✅ Complete and Ready  
**Tested:** JWT token generation, login flow  
**Production Ready:** Yes  
**Deployment:** Ready for Render/production

---

Need help? Check `AUTH_API.md` for complete endpoint documentation and examples.
