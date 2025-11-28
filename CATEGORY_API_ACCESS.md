# 🔗 How to Access Category API - Quick Reference

## 🌐 Base URL
```
http://localhost:5000/api/v1
```

---

## 📋 Category API Endpoints

### 1️⃣ GET All Categories
**Without Authentication** (Public)
```
GET /api/v1/categories
```

**Example:**
```bash
curl http://localhost:5000/api/v1/categories
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search by name

**Example with parameters:**
```bash
curl "http://localhost:5000/api/v1/categories?page=1&limit=5&search=electronics"
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "cat_123",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices",
      "imageUrl": "/uploads/1234567890-123456789.jpg",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 2️⃣ GET Category by ID
**Without Authentication** (Public)
```
GET /api/v1/categories/{id}
```

**Example:**
```bash
curl http://localhost:5000/api/v1/categories/cat_123
```

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "cat_123",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices",
    "imageUrl": "/uploads/1234567890-123456789.jpg",
    "isActive": true
  }
}
```

---

### 3️⃣ GET Category by Slug
**Without Authentication** (Public)
```
GET /api/v1/categories/slug/{slug}
```

**Example:**
```bash
curl http://localhost:5000/api/v1/categories/slug/electronics
```

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "cat_123",
    "name": "Electronics",
    "slug": "electronics",
    "imageUrl": "/uploads/1234567890-123456789.jpg"
  }
}
```

---

### 4️⃣ CREATE Category
**Requires Authentication** (Admin Only)
```
POST /api/v1/categories
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Required Fields:**
- `name` (string) - Category name ✓
- `image` (file) - Image file ✓

**Optional Fields:**
- `description` (string) - Category description

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "name=Electronics" \
  -F "description=Electronic devices and gadgets" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat_456",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and gadgets",
    "imageUrl": "/uploads/1234567890-987654321.jpg",
    "isActive": true
  }
}
```

---

### 5️⃣ UPDATE Category
**Requires Authentication** (Admin Only)
```
PUT /api/v1/categories/{id}
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Optional Fields (at least one required):**
- `name` (string) - Update name
- `description` (string) - Update description
- `image` (file) - Update image

**Example with cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/categories/cat_123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "name=Electronics Updated" \
  -F "description=Updated description"
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "cat_123",
    "name": "Electronics Updated",
    "slug": "electronics",
    "imageUrl": "/uploads/1234567890-123456789.jpg"
  }
}
```

---

### 6️⃣ DELETE Category
**Requires Authentication** (Admin Only)
```
DELETE /api/v1/categories/{id}
Authorization: Bearer {token}
```

**Example with cURL:**
```bash
curl -X DELETE http://localhost:5000/api/v1/categories/cat_123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 🔐 Getting Admin Token (Authentication)

### Step 1: Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@epasaley.com",
    "password": "ePasaley@SecureAdmin2025!"
  }'
```

### Step 2: Extract Token from Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f...",
      "email": "admin@epasaley.com"
    }
  }
}
```

### Step 3: Use Token in Header
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Testing in Postman

### 1. Create Collection
- Name: "Epasaley API"

### 2. Add Environment Variable
```
{
  "base_url": "http://localhost:5000/api/v1",
  "token": ""
}
```

### 3. Test Login Request
```
Method: POST
URL: {{base_url}}/auth/login
Headers: 
  - Content-Type: application/json
Body:
{
  "email": "admin@epasaley.com",
  "password": "ePasaley@SecureAdmin2025!"
}
```

### 4. Copy Token to Environment
After login, copy the token from response and save to environment variable

### 5. Test Category Requests
```
Method: GET
URL: {{base_url}}/categories
Headers:
  - Authorization: Bearer {{token}}
```

---

## 💻 Testing with JavaScript/Fetch

### Get All Categories (No Auth)
```javascript
const getCategories = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/categories');
    const data = await response.json();
    console.log('Categories:', data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
getCategories();
```

### Create Category (With Auth)
```javascript
const createCategory = async () => {
  const token = localStorage.getItem('adminToken');
  
  const formData = new FormData();
  formData.append('name', 'Electronics');
  formData.append('description', 'Electronic devices');
  formData.append('image', fileInput.files[0]); // File from input
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // DO NOT set Content-Type header - browser will set it
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('Created:', data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Update Category
```javascript
const updateCategory = async (categoryId) => {
  const token = localStorage.getItem('adminToken');
  
  const formData = new FormData();
  formData.append('name', 'Electronics Updated');
  formData.append('description', 'Updated description');
  
  try {
    const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    console.log('Updated:', data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Delete Category
```javascript
const deleteCategory = async (categoryId) => {
  const token = localStorage.getItem('adminToken');
  
  try {
    const response = await fetch(`http://localhost:5000/api/v1/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Deleted:', data.message);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🌐 Access Category Images

### From Response
Backend returns: `imageUrl: "/uploads/1234567890-123456789.jpg"`

### Build Full URL
```javascript
const baseURL = "http://localhost:5000";
const fullImageUrl = baseURL + imageUrl;
// Result: http://localhost:5000/uploads/1234567890-123456789.jpg
```

### Display in HTML
```html
<img src="http://localhost:5000/uploads/1234567890-123456789.jpg" alt="Category">
```

### Display in React
```jsx
<img 
  src={`http://localhost:5000${category.imageUrl}`}
  alt={category.name}
  onError={(e) => {
    e.target.src = '/placeholder.jpg';
  }}
/>
```

---

## 📊 Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success - GET, PUT | Category retrieved/updated |
| 201 | Success - POST | Category created |
| 204 | Success - DELETE | Category deleted |
| 400 | Bad Request | Missing required field |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not Found | Category ID not found |
| 409 | Conflict | Category name already exists |
| 500 | Server Error | Database connection issue |

---

## ✅ Common Errors & Solutions

### ❌ "Path `imageUrl` is required"
**Solution:** Upload an image file with the request

### ❌ "Invalid email or password"
**Solution:** Check credentials - admin@epasaley.com / ePasaley@SecureAdmin2025!

### ❌ "Invalid or missing token"
**Solution:** Make sure you include Authorization header with valid token

### ❌ "Category with this name already exists"
**Solution:** Use a different category name

### ❌ Image not displaying
**Solution:** Check the full URL - should be `http://localhost:5000/uploads/...`

### ❌ CORS error
**Solution:** CORS is configured, should work from any origin

---

## 🚀 Quick Start Checklist

✅ Server running on port 5000
```bash
npm run dev
```

✅ Login to get token
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@epasaley.com","password":"ePasaley@SecureAdmin2025!"}'
```

✅ Copy token from response

✅ Use token in requests
```bash
curl http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer <token>"
```

✅ Create category
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer <token>" \
  -F "name=Electronics" \
  -F "image=@image.jpg"
```

✅ Get categories
```bash
curl http://localhost:5000/api/v1/categories
```

---

## 🎯 Summary

| Operation | Method | Auth | URL |
|-----------|--------|------|-----|
| List all | GET | No | `/categories` |
| Get one | GET | No | `/categories/{id}` |
| Get by slug | GET | No | `/categories/slug/{slug}` |
| Create | POST | Yes | `/categories` |
| Update | PUT | Yes | `/categories/{id}` |
| Delete | DELETE | Yes | `/categories/{id}` |

**Base URL:** `http://localhost:5000/api/v1`

**Auth Token:** From `/auth/login` endpoint

**Images:** `http://localhost:5000/uploads/...`

Ready to access! 🚀
