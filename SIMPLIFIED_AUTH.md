# 🔐 SIMPLIFIED Authentication - Only Login

You asked for **ONLY LOGIN** with ID + password. That's exactly what you have now!

## 🎯 Simple Flow

```
1. Admin enters ID + Password
   ↓
2. Backend verifies credentials
   ↓
3. Backend sends back JWT TOKEN
   ↓
4. Frontend stores token
   ↓
5. Frontend includes token in Authorization header for ALL requests:
   - Create category
   - Create product
   - Update category
   - Delete product
   - etc.
```

---

## 🚀 Setup (1 minute)

### Step 1: Create Admin Account
```bash
npm run setup-admin
```

This creates:
- **Admin ID:** `ADMIN001`
- **Password:** `Admin@123`

---

## 📱 Login Endpoint (Only Endpoint You Need)

### Request
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "adminId": "ADMIN001",
  "password": "Admin@123"
}
```

### Response (Success)
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

---

## 💾 How to Use Token

### Frontend (React/Vue/Angular)

```typescript
// 1. LOGIN - Get token
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const { data: { token } } = await response.json();

// 2. STORE token in frontend
localStorage.setItem('adminToken', token);

// 3. USE token for all admin operations
const token = localStorage.getItem('adminToken');

// CREATE CATEGORY
await fetch('http://localhost:5000/api/v1/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,  // ← Include token here
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Electronics',
    description: 'Electronic devices'
  })
});

// CREATE PRODUCT
await fetch('http://localhost:5000/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,  // ← Include token here
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Laptop',
    price: 50000,
    category_id: 'cat_123'
  })
});

// UPDATE CATEGORY
await fetch('http://localhost:5000/api/v1/categories/cat_123', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,  // ← Include token here
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Category'
  })
});

// DELETE PRODUCT
await fetch('http://localhost:5000/api/v1/products/prod_123', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`  // ← Include token here
  }
});
```

---

## 🔑 Token Details

**Token is valid for:** 7 days  
**Header format:** `Authorization: Bearer <token>`  
**Stored in frontend:** localStorage or sessionStorage

---

## ✅ What You Have Now

✅ Login endpoint only (no registration needed)  
✅ ID + Password authentication  
✅ JWT token generation  
✅ Token for category operations  
✅ Token for product operations  
✅ Token for all admin operations  

---

## ❌ What You DON'T Have Anymore

❌ Registration endpoint (only login)  
❌ Profile endpoint  
❌ Password update endpoint  
❌ Logout endpoint  

---

## 🧪 Quick Test

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"ADMIN001","password":"Admin@123"}'
```

### Test Create Category (with token)
```bash
# Copy token from login response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic devices"}'
```

---

## 📋 Files Changed

**Code:**
- ✅ `src/routes/auth.routes.ts` - Only login endpoint
- ✅ `src/controllers/auth.controller.ts` - Only login function

**Removed:**
- ❌ Register endpoint
- ❌ Profile endpoint
- ❌ Password update endpoint
- ❌ Logout endpoint

---

## 🚀 Usage Example (Full Flow)

```typescript
// STEP 1: LOGIN
const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const loginData = await loginRes.json();
const token = loginData.data.token; // ← Get token

console.log('✅ Logged in successfully');
console.log('Token:', token);

// STEP 2: STORE TOKEN (in browser localStorage)
localStorage.setItem('adminToken', token);

// STEP 3: CREATE CATEGORY (using token)
const categoryRes = await fetch('http://localhost:5000/api/v1/categories', {
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

const categoryData = await categoryRes.json();
console.log('✅ Category created:', categoryData.data);

// STEP 4: CREATE PRODUCT (using same token)
const productRes = await fetch('http://localhost:5000/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Laptop',
    price: 50000,
    category_id: categoryData.data._id
  })
});

const productData = await productRes.json();
console.log('✅ Product created:', productData.data);
```

---

## 🎯 That's It!

**Simple authentication:**
1. Login with ID + password
2. Get token
3. Use token for everything
4. Done! 🎉

---

**Status:** ✅ Simplified to ONLY Login  
**Complexity:** Minimum  
**Endpoints:** 1 (only `/api/v1/auth/login`)  
**Ready to use:** Yes
