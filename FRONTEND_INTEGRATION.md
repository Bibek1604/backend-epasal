# 🎯 Frontend Integration Guide - Login & Categories

## 📋 Complete Step-by-Step

### Step 1: Create Login Page Component

**`src/pages/LoginPage.tsx`**
```typescript
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1️⃣ SEND LOGIN REQUEST
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email,
        password
      });

      // 2️⃣ GET TOKEN FROM RESPONSE
      const { token, admin } = response.data.data;

      // 3️⃣ SAVE TOKEN TO LOCALSTORAGE
      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(admin));

      // 4️⃣ REDIRECT TO DASHBOARD
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Admin Login</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@epasaley.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="demo-creds">
          Demo: admin@epasaley.com / ePasaley@SecureAdmin2025!
        </p>
      </div>
    </div>
  );
};
```

---

### Step 2: Create API Service (Separate File)

**`src/services/api.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
});

// Add token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    // 🔑 ADD TOKEN TO HEADER
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

**Why this works:**
- ✅ Every request automatically includes `Authorization: Bearer <token>`
- ✅ No need to manually add token to each request
- ✅ If token expires (401), automatically redirects to login

---

### Step 3: Create Category Service

**`src/services/categoryService.ts`**
```typescript
import API from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  // ✅ GET ALL CATEGORIES
  getAll: async (): Promise<Category[]> => {
    const response = await API.get('/categories');
    return response.data.data;
  },

  // ✅ GET SINGLE CATEGORY
  getById: async (id: string): Promise<Category> => {
    const response = await API.get(`/categories/${id}`);
    return response.data.data;
  },

  // ✅ CREATE CATEGORY (REQUIRES TOKEN)
  create: async (data: { name: string; description?: string; image?: string }): Promise<Category> => {
    const response = await API.post('/categories', data);
    return response.data.data;
  },

  // ✅ UPDATE CATEGORY (REQUIRES TOKEN)
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await API.put(`/categories/${id}`, data);
    return response.data.data;
  },

  // ✅ DELETE CATEGORY (REQUIRES TOKEN)
  delete: async (id: string): Promise<void> => {
    await API.delete(`/categories/${id}`);
  }
};
```

---

### Step 4: Create Category Page Component

**`src/pages/CategoriesPage.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { categoryService, Category } from '../services/categoryService';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  // ✅ FETCH CATEGORIES ON PAGE LOAD
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE NEW CATEGORY
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      setError('Category name required');
      return;
    }

    try {
      // 🔑 TOKEN IS AUTOMATICALLY INCLUDED BY INTERCEPTOR
      const created = await categoryService.create({
        name: newCategory,
        description: `Description for ${newCategory}`
      });

      setCategories([...categories, created]);
      setNewCategory('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  // ✅ DELETE CATEGORY
  const handleDeleteCategory = async (id: string) => {
    try {
      // 🔑 TOKEN IS AUTOMATICALLY INCLUDED BY INTERCEPTOR
      await categoryService.delete(id);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err: any) {
      setError('Failed to delete category');
    }
  };

  return (
    <div className="categories-container">
      <h1>Categories Management</h1>

      {error && <div className="error-message">{error}</div>}

      {/* ✅ CREATE CATEGORY FORM */}
      <form onSubmit={handleCreateCategory} className="create-form">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
        />
        <button type="submit">Add Category</button>
      </form>

      {/* ✅ CATEGORIES LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p>No categories yet</p>
      ) : (
        <div className="categories-list">
          {categories.map((category) => (
            <div key={category._id} className="category-card">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <button onClick={() => handleDeleteCategory(category._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### Step 5: How Token is Used (Flow Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN PAGE                           │
│  Input: email + password                                │
│  Click: Login button                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  POST /api/v1/auth/login                                │
│  Body: { email, password }                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Response:                                              │
│  {                                                      │
│    "token": "eyJhbGc...",        ◄── SAVE THIS!       │
│    "admin": { ... }                                     │
│  }                                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  localStorage.setItem('adminToken', token)              │
│  ✅ Token saved!                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  NAVIGATE TO CATEGORIES PAGE                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  CREATE CATEGORY                                        │
│  POST /api/v1/categories                                │
│  Body: { name, description }                            │
│                                                         │
│  ⚠️ INTERCEPTOR AUTOMATICALLY ADDS:                      │
│  Header: Authorization: Bearer <token>                 │
│                                                         │
│  (No manual header setup needed!)                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Backend verifies token                                 │
│  ✅ Token valid? → Create category                      │
│  ❌ Token invalid? → 401 Unauthorized                    │
│                                                         │
│  If 401 → Interceptor redirects to /login               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Install Dependencies
```bash
npm install axios react-router-dom
```

### App.tsx Setup
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CategoriesPage } from './pages/CategoriesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<CategoriesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 💡 How Token Works (Simple Explanation)

### Without Token (❌ Won't Work)
```typescript
// This will FAIL - no authorization
await axios.post('http://localhost:5000/api/v1/categories', {
  name: 'Electronics'
});
// Response: 401 Unauthorized
```

### With Token Manual (✅ Works but tedious)
```typescript
// This works but you need to manually add token every time
const token = localStorage.getItem('adminToken');

await axios.post('http://localhost:5000/api/v1/categories', 
  { name: 'Electronics' },
  { headers: { Authorization: `Bearer ${token}` } }
);
// Response: ✅ Category created
```

### With Interceptor (✅ Works and automatic!)
```typescript
// This works AND token is added automatically!
// (Because of the interceptor we set up)

await API.post('/categories', {
  name: 'Electronics'
});
// Token added automatically! ✅
// Response: ✅ Category created
```

---

## 🔑 Token Lifecycle

```
1. LOGIN
   └─► Token generated on backend
   └─► Sent to frontend in response

2. STORE TOKEN
   └─► localStorage.setItem('adminToken', token)

3. USE TOKEN
   └─► Interceptor reads from localStorage
   └─► Adds to Authorization header
   └─► Sent with every request

4. OPERATIONS ALLOWED
   ✅ Create categories
   ✅ Create products
   ✅ Create coupons
   ✅ Create banners
   ✅ Create flash sales
   ✅ All admin operations

5. TOKEN EXPIRES (7 days)
   └─► Backend returns 401
   └─► Interceptor catches 401
   └─► Redirects to /login
   └─► User logs in again
```

---

## 📝 API Endpoints Available (With Token)

### Categories
```bash
POST /api/v1/categories              # Create (needs token)
GET /api/v1/categories               # List all
GET /api/v1/categories/:id           # Get one
PUT /api/v1/categories/:id           # Update (needs token)
DELETE /api/v1/categories/:id        # Delete (needs token)
```

### Products
```bash
POST /api/v1/products                # Create (needs token)
GET /api/v1/products                 # List all
GET /api/v1/products/:id             # Get one
PUT /api/v1/products/:id             # Update (needs token)
DELETE /api/v1/products/:id          # Delete (needs token)
```

### Coupons
```bash
POST /api/v1/coupons                 # Create (needs token)
GET /api/v1/coupons                  # List all
PUT /api/v1/coupons/:id              # Update (needs token)
DELETE /api/v1/coupons/:id           # Delete (needs token)
```

### Banners
```bash
POST /api/v1/banners                 # Create (needs token)
GET /api/v1/banners                  # List all
DELETE /api/v1/banners/:id           # Delete (needs token)
```

### Flash Sales
```bash
POST /api/v1/flashSales              # Create (needs token)
GET /api/v1/flashSales               # List all
DELETE /api/v1/flashSales/:id        # Delete (needs token)
```

---

## ✨ Complete Working Example

**Full Login + Create Category Flow:**

```typescript
// 1️⃣ USER FILLS LOGIN FORM
// Email: admin@epasaley.com
// Password: ePasaley@SecureAdmin2025!

// 2️⃣ BACKEND VALIDATES & RETURNS TOKEN
// Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 3️⃣ FRONTEND SAVES TOKEN
localStorage.setItem('adminToken', token);

// 4️⃣ USER NAVIGATES TO CATEGORIES PAGE
// useNavigate('/dashboard')

// 5️⃣ CATEGORIES PAGE LOADS
// Calls: categoryService.getAll()

// 6️⃣ USER CREATES CATEGORY
// Input: "Electronics"
// Click: Add Category button

// 7️⃣ FRONTEND SENDS REQUEST
// POST /api/v1/categories
// Body: { name: "Electronics" }
// ⚠️ Interceptor adds: Header: Authorization: Bearer <token>

// 8️⃣ BACKEND RECEIVES REQUEST WITH TOKEN
// Verifies token ✅
// Creates category ✅
// Returns: { _id: "cat_123", name: "Electronics", ... }

// 9️⃣ FRONTEND UPDATES UI
// setCategories([...categories, newCategory])
// ✅ New category appears in list!

// 🔟 ALL FUTURE REQUESTS USE SAME TOKEN
// categoryService.create(), 
// categoryService.update(),
// categoryService.delete()
// All automatically include token!
```

---

## 🎯 Summary

**What to do in Frontend:**

1. ✅ Create **LoginPage** component
2. ✅ Create **api.ts** with interceptor (auto-token)
3. ✅ Create **categoryService.ts** functions
4. ✅ Create **CategoriesPage** component
5. ✅ Login with: `admin@epasaley.com` / `ePasaley@SecureAdmin2025!`
6. ✅ Token automatically added to all requests
7. ✅ Create/update/delete categories with same token

**How Token is Used:**

| Step | Action |
|------|--------|
| 1 | User enters email + password in LoginPage |
| 2 | Frontend sends POST /api/v1/auth/login |
| 3 | Backend returns token in response |
| 4 | Frontend saves token to localStorage |
| 5 | Interceptor reads token from localStorage |
| 6 | Interceptor adds `Authorization: Bearer <token>` to every request |
| 7 | Backend verifies token = request authorized |
| 8 | Operations allowed (create/update/delete) |
| 9 | Token expires after 7 days → redirect to login |

---

## 🔗 Files Needed in Frontend

```
src/
├── pages/
│   ├── LoginPage.tsx           # Login form
│   └── CategoriesPage.tsx      # Categories management
├── services/
│   ├── api.ts                  # Axios with interceptor
│   └── categoryService.ts      # Category functions
└── App.tsx                     # Routes setup
```

All code provided above - just copy & use! 🚀
