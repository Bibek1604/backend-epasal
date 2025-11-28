# ✅ Login Updated - Email + Password

Your authentication system is now updated to use **Email + Password** instead of Admin ID.

## 🔐 Admin Credentials

**Email:** `admin@epasaley.com`  
**Password:** `ePasaley@SecureAdmin2025!`

---

## 📱 Login Endpoint

### Request
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@epasaley.com",
  "password": "ePasaley@SecureAdmin2025!"
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

## 🧪 Test Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@epasaley.com",
    "password": "ePasaley@SecureAdmin2025!"
  }'
```

---

## 💾 Use Token for Operations

After login, include the token in Authorization header:

### Create Category
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "price": 50000,
    "category_id": "cat_123"
  }'
```

---

## 💻 React Frontend Example

```typescript
// 1. Login with email + password
const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@epasaley.com',
    password: 'ePasaley@SecureAdmin2025!'
  })
});

const { data: { token } } = await loginRes.json();
console.log('✅ Login successful! Token:', token);

// 2. Store token
localStorage.setItem('adminToken', token);

// 3. Create category with token
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

const category = await categoryRes.json();
console.log('✅ Category created!');

// 4. Create product with SAME token
const productRes = await fetch('http://localhost:5000/api/v1/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Laptop',
    price: 50000,
    category_id: category.data._id
  })
});

const product = await productRes.json();
console.log('✅ Product created!');
```

---

## 🚀 Setup

### Step 1: Create Admin Account
```bash
npm run setup-admin
```

This will create admin with the credentials:
- Email: `admin@epasaley.com`
- Password: `ePasaley@SecureAdmin2025!`

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -d '{
    "email": "admin@epasaley.com",
    "password": "ePasaley@SecureAdmin2025!"
  }'
```

### Step 4: Use Token
Include token in Authorization header for all admin operations.

---

## ✅ What Was Changed

**Updated:**
- ✅ Login now uses **email** instead of adminId
- ✅ Admin credentials set to your provided email + password
- ✅ Setup script creates admin with your credentials

**Still Works:**
- ✅ Token generation
- ✅ Category operations
- ✅ Product operations
- ✅ All admin operations

---

## 🎯 Flow

```
Admin Login Page
   ↓
Input: email: admin@epasaley.com
Input: password: ePasaley@SecureAdmin2025!
   ↓
POST /api/v1/auth/login
   ↓
Backend verifies email + password
   ↓
✅ Valid → Generate token
   ↓
Send token to frontend
   ↓
Frontend stores token
   ↓
Use token for:
  - Create categories
  - Create products
  - Create coupons
  - Create banners
  - Create flash sales
  - etc.
```

---

## 🔑 Token Details

- **Valid for:** 7 days
- **Format:** `Authorization: Bearer <token>`
- **Include in:** All admin requests (POST, PUT, DELETE for admin operations)

---

## ✨ Status

✅ Email + Password login configured  
✅ Credentials set to your provided values  
✅ Token generation working  
✅ Ready for frontend integration  
✅ Production ready  

---

**Admin Email:** `admin@epasaley.com`  
**Admin Password:** `ePasaley@SecureAdmin2025!`  
**Token:** Get from login endpoint  
**Use:** In Authorization header for all admin operations

**Ready to use!** 🚀
