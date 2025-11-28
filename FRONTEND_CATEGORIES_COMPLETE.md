# 🔗 Connect Categories Backend to Frontend - Complete Guide

## 📋 Overview

**Flow:**
1. Frontend sends request to backend
2. Backend retrieves categories from MongoDB
3. Frontend displays categories with images
4. User can create/update/delete categories

---

## 🚀 Step 1: Create Category Service (Frontend)

**File: `src/services/categoryService.ts`**

```typescript
import API from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const categoryService = {
  /**
   * Get all categories
   */
  getAll: async (page = 1, limit = 10): Promise<{ 
    categories: Category[]; 
    pagination: any 
  }> => {
    const response = await API.get(`/categories?page=${page}&limit=${limit}`);
    return {
      categories: response.data.data,
      pagination: response.data.pagination
    };
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await API.get(`/categories/${id}`);
    return response.data.data;
  },

  /**
   * Get category by slug
   */
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await API.get(`/categories/slug/${slug}`);
    return response.data.data;
  },

  /**
   * Create category (with image upload)
   */
  create: async (data: {
    name: string;
    description?: string;
    image?: File;
  }): Promise<Category> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await API.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Update category
   */
  update: async (id: string, data: {
    name?: string;
    description?: string;
    image?: File;
  }): Promise<Category> => {
    const formData = new FormData();
    if (data.name) {
      formData.append('name', data.name);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await API.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  /**
   * Delete category
   */
  delete: async (id: string): Promise<void> => {
    await API.delete(`/categories/${id}`);
  }
};
```

---

## 🎨 Step 2: Create Categories Display Component

**File: `src/components/CategoryList.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { categoryService, Category } from '../services/categoryService';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  // ✅ Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await categoryService.getAll(page, 10);
      setCategories(result.categories);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get full image URL
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/placeholder-category.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  if (loading) return <div className="text-center p-4">Loading categories...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (categories.length === 0) return <div className="text-gray-500 p-4">No categories found</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
            {/* Category Image */}
            <img
              src={getImageUrl(category.imageUrl)}
              alt={category.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-category.jpg';
              }}
            />

            {/* Category Info */}
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{category.name}</h2>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-sm ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## ➕ Step 3: Create Category Form Component

**File: `src/components/CategoryForm.tsx`**

```typescript
import React, { useState } from 'react';
import { categoryService } from '../services/categoryService';

export const CategoryForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState('');

  // ✅ Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      await categoryService.create({
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined
      });

      setSuccess('✅ Category created successfully!');
      setFormData({ name: '', description: '', image: null });
      setPreview('');

      // Refresh list after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create Category</h2>

      {/* Error Message */}
      {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}

      {/* Success Message */}
      {success && <div className="text-green-500 mb-4 p-2 bg-green-50 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Category Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Electronics"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Category description..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Category Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF, WebP</p>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  );
};
```

---

## 📄 Step 4: Setup API Service with Interceptor

**File: `src/services/api.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api/v1'
});

// ✅ Add token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// ✅ Handle errors
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

---

## 🏠 Step 5: Setup App.tsx with Routes

**File: `src/App.tsx`**

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';

function App() {
  const isAuthenticated = !!localStorage.getItem('adminToken');

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 📊 Step 6: Categories Page Component

**File: `src/pages/CategoriesPage.tsx`**

```typescript
import React, { useState } from 'react';
import { CategoryList } from '../components/CategoryList';
import { CategoryForm } from '../components/CategoryForm';

export const CategoriesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Categories Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600"
          >
            {showForm ? 'View All' : '+ Create Category'}
          </button>
        </div>

        {/* Form or List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {showForm ? (
            <CategoryForm />
          ) : (
            <CategoryList />
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🔑 Step 7: Login & Authentication

**File: `src/pages/LoginPage.tsx`**

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
      // 1️⃣ Login request
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email,
        password
      });

      // 2️⃣ Extract token
      const { token, admin } = response.data.data;

      // 3️⃣ Save to localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(admin));

      // 4️⃣ Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@epasaley.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          Demo: admin@epasaley.com / ePasaley@SecureAdmin2025!
        </p>
      </div>
    </div>
  );
};
```

---

## 📦 Step 8: Install Dependencies

```bash
npm install axios react-router-dom
```

---

## 🧪 Complete Flow

### 1️⃣ User Logs In
```
User enters: admin@epasaley.com / ePasaley@SecureAdmin2025!
      ↓
LoginPage sends POST to /auth/login
      ↓
Backend validates credentials
      ↓
Returns JWT token
      ↓
Frontend saves token to localStorage
      ↓
Redirects to /dashboard
```

### 2️⃣ View Categories
```
User navigates to /categories
      ↓
ComponentMount → useEffect triggers
      ↓
categoryService.getAll() called
      ↓
API interceptor adds Authorization header with token
      ↓
Backend receives authenticated request
      ↓
Returns categories from MongoDB
      ↓
Frontend displays categories with images
```

### 3️⃣ Create Category
```
User fills form:
  - Name: "Electronics"
  - Description: "Electronic devices"
  - Image: [file from input]
      ↓
Submit button clicked
      ↓
categoryService.create() called
      ↓
Creates FormData with file
      ↓
API interceptor adds token
      ↓
Backend receives multipart/form-data
      ↓
Saves image to /uploads folder
      ↓
Saves category to MongoDB with imageUrl
      ↓
Returns response with imageUrl: "/uploads/..."
      ↓
Frontend displays success message
      ↓
Page refreshes to show new category
```

### 4️⃣ Display Image
```
Response includes: imageUrl: "/uploads/1234567890.jpg"
      ↓
Frontend constructs full URL:
"http://localhost:5000/uploads/1234567890.jpg"
      ↓
<img src={fullUrl} /> displays image
```

---

## 🎯 Key Points

### ✅ Token Management
- Token stored in localStorage after login
- Automatically added to all API requests
- Requests fail if token expires

### ✅ Image Handling
- Upload as FormData with file
- Backend saves to /uploads/
- Response includes accessible path
- Frontend displays with full URL

### ✅ Error Handling
- Login failures show error message
- API errors caught and displayed
- 401 errors redirect to login

### ✅ State Management
- React useState for form data
- useEffect for data fetching
- Loading states for UX

---

## 📁 Final Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── CategoriesPage.tsx
│   ├── components/
│   │   ├── CategoryList.tsx
│   │   └── CategoryForm.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── categoryService.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── ...
```

---

## ✨ Summary

**What we built:**
1. ✅ API service with axios interceptor
2. ✅ Login component with token storage
3. ✅ Category list component with pagination
4. ✅ Category form with image upload
5. ✅ Image display with error handling
6. ✅ Protected routes with authentication

**Everything connected:**
- Frontend ↔ Backend ✅
- Token management ✅
- Image upload & display ✅
- Error handling ✅

Ready to use! 🚀
