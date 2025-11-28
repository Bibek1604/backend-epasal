# 📤 Image Upload Guide - Local Storage

## ✅ What Changed

**Before:** Had to provide image URL
**Now:** Upload image files directly - stored locally in `/uploads` folder

---

## 🎯 How It Works

### Step 1: Upload Image File
Send a `multipart/form-data` request with the image file

### Step 2: Backend Saves Locally
Image is saved to `/uploads/[filename]` folder

### Step 3: Get Access URL
Response includes the path: `/uploads/image-name.jpg`

### Step 4: Serve Static Files
You can access the image via: `http://localhost:5000/uploads/image-name.jpg`

---

## 📝 API Endpoints for Image Upload

### Create Category with Image Upload
```
POST /api/v1/categories
Content-Type: multipart/form-data

Fields:
- name (text): "Electronics"
- description (text): "Electronic devices"
- image (file): [select image file]
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat_123",
    "name": "Electronics",
    "imageUrl": "/uploads/1234567890-123456789.jpg"
  }
}
```

The `imageUrl` path can be used directly in frontend!

---

### Create Product with Image Upload
```
POST /api/v1/products
Content-Type: multipart/form-data

Fields:
- name (text): "Laptop Pro"
- price (text): "150000"
- beforePrice (text): "150000"
- afterPrice (text): "120000"
- category_id (text): "cat_123"
- description (text): "High performance laptop"
- image (file): [select image file]
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "prod_123",
    "name": "Laptop Pro",
    "imageUrl": "/uploads/1234567890-987654321.jpg",
    "price": 150000
  }
}
```

---

### Create Banner with Image Upload
```
POST /api/v1/banners
Content-Type: multipart/form-data

Fields:
- title (text): "Summer Sale"
- description (text): "Get 50% off"
- image (file): [select image file]
```

**Response:**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "id": "banner_123",
    "title": "Summer Sale",
    "imageUrl": "/uploads/1234567890-456789123.jpg"
  }
}
```

---

## 🖼️ Using Uploaded Images in Frontend

### Method 1: Direct URL
```html
<img src="http://localhost:5000/uploads/1234567890-123456789.jpg" alt="Product">
```

### Method 2: Combine with Base URL
```javascript
const baseURL = "http://localhost:5000";
const imageURL = baseURL + imageUrlFromResponse;
// Result: http://localhost:5000/uploads/1234567890-123456789.jpg

<img src={imageURL} alt="Product">
```

### Method 3: Dynamic Base URL (React)
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getImageUrl = (path) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

// Usage
<img src={getImageUrl(product.imageUrl)} alt={product.name} />
```

---

## 📂 File Storage

### Location
```
backend/
├── uploads/
│   ├── 1234567890-123456789.jpg
│   ├── 1234567890-987654321.jpg
│   └── 1234567890-456789123.jpg
├── src/
├── package.json
└── ...
```

### File Naming
- Unique: `[timestamp]-[random].jpg`
- Automatically created
- Prevents conflicts

### File Size Limit
- Max: 5MB per file
- Format: JPEG, JPG, PNG, GIF, WebP

---

## 🧪 Testing with cURL

### Create Category with Image
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer <token>" \
  -F "name=Electronics" \
  -F "description=Electronic devices" \
  -F "image=@/path/to/image.jpg"
```

### Create Product with Image
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -F "name=Laptop Pro" \
  -F "price=150000" \
  -F "beforePrice=150000" \
  -F "afterPrice=120000" \
  -F "category_id=cat_123" \
  -F "image=@/path/to/product-image.jpg"
```

### Create Banner with Image
```bash
curl -X POST http://localhost:5000/api/v1/banners \
  -H "Authorization: Bearer <token>" \
  -F "title=Summer Sale" \
  -F "description=Get 50% off" \
  -F "image=@/path/to/banner-image.jpg"
```

---

## 🧑‍💻 Frontend Example (React)

### Using FormData for File Upload
```javascript
const handleCreateCategory = async (formData) => {
  const token = localStorage.getItem('adminToken');
  
  // Create FormData object (for file upload)
  const data = new FormData();
  data.append('name', formData.name);
  data.append('description', formData.description);
  data.append('image', formData.imageFile); // File from <input type="file">
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // DO NOT set Content-Type: multipart/form-data
        // Browser will set it automatically!
      },
      body: data
    });
    
    const result = await response.json();
    console.log('Image uploaded:', result.data.imageUrl);
    // result.data.imageUrl = "/uploads/1234567890-123456789.jpg"
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Usage in component
<form onSubmit={(e) => {
  e.preventDefault();
  const formData = {
    name: e.target.name.value,
    description: e.target.description.value,
    imageFile: e.target.image.files[0] // File object
  };
  handleCreateCategory(formData);
}}>
  <input type="text" name="name" placeholder="Category name" required />
  <input type="text" name="description" placeholder="Description" />
  <input type="file" name="image" accept="image/*" required />
  <button type="submit">Create Category</button>
</form>
```

---

## ⚠️ Important Notes

### 1. Content-Type Header
- **DO NOT** manually set `Content-Type: multipart/form-data`
- Let the browser set it automatically
- Browser adds the boundary automatically

### 2. File Input
```javascript
// ✅ Correct
const file = inputElement.files[0];
formData.append('image', file);

// ❌ Wrong - don't stringify
formData.append('image', JSON.stringify(file));
```

### 3. Authorization Header
```javascript
// ✅ Correct - Include token
headers: {
  'Authorization': `Bearer ${token}`
}

// ✅ Also works - FormData with auth
const data = new FormData();
data.append('name', name);
data.append('image', file);
// Auth header still needed!
```

### 4. Response Includes Path
```json
{
  "data": {
    "imageUrl": "/uploads/1234567890-123456789.jpg"  // ← Use this path
  }
}
```

---

## 📊 Status

✅ Models updated to accept optional images
✅ Services fixed to handle null images
✅ Local storage configured
✅ Static files serving enabled
✅ File upload middleware working
✅ Response includes accessible image path

---

## 🚀 Next Steps

1. **Test Upload** - Create category/product with image
2. **Check Response** - See the `/uploads/...` path
3. **Access Image** - Open in browser: `http://localhost:5000/uploads/...`
4. **Use in Frontend** - Display with `<img src={imageUrl}>`

---

## 📞 Troubleshooting

### Issue: "Path `imageUrl` is required"
**Solution:** Image field is now optional - upload image file or leave blank

### Issue: Image not found after upload
**Solution:** Check the response - imageUrl should be included

### Issue: CORS error when accessing image
**Solution:** Images are served from same domain, should not have CORS issues

### Issue: Image file too large
**Solution:** Max size is 5MB, compress image if needed

---

## ✨ Summary

**Before:** 
```
POST /categories
{
  "name": "Electronics",
  "imageUrl": "https://example.com/image.jpg"  ← URL
}
```

**Now:**
```
POST /categories
FormData:
  name: "Electronics"
  image: [file]  ← Actual file

Response:
{
  "imageUrl": "/uploads/1234567890-123456789.jpg"  ← Local path
}

Access at:
http://localhost:5000/uploads/1234567890-123456789.jpg
```

Much cleaner! 🎉
