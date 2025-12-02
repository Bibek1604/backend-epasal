# Frontend Image Handling Guide - Cloudinary Integration

This guide explains how to properly handle images in your React/Vite frontend with the Cloudinary-backed API.

## 🏗️ Folder Structure (Frontend)

```
frontend/
├── public/
│   └── logos/                    # Local SVG logos (avoid OpaqueResponseBlocking)
│       ├── logo.svg
│       ├── esewa.svg
│       └── khalti.svg
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance with baseURL
│   ├── components/
│   │   ├── Banner.jsx            # Display banners with Cloudinary images
│   │   ├── BannerForm.jsx        # Upload banner with image
│   │   ├── ProductCard.jsx       # Display product images
│   │   └── ImageWithFallback.jsx # Reusable image component
│   ├── hooks/
│   │   └── useFetch.js           # Custom fetch hook
│   └── utils/
│       └── imageUtils.js         # Image URL helpers
```

---

## 📁 A) API Configuration

### `src/api/axios.js`
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-epasal.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for Render cold starts
  headers: {
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Render may be starting up');
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 📁 B) Image Utilities

### `src/utils/imageUtils.js`
```javascript
/**
 * Get a valid image URL
 * - Returns Cloudinary URLs as-is
 * - Returns placeholder for old /uploads/ paths (data is lost)
 * - Returns placeholder for null/undefined
 */
export const getImageUrl = (imagePath) => {
  // No image
  if (!imagePath) {
    return '/placeholder.png';
  }

  // Already a full URL (Cloudinary or external)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Old local path from before Cloudinary migration - image is lost
  if (imagePath.startsWith('/uploads/')) {
    console.warn('Old local image path detected:', imagePath);
    return '/placeholder.png';
  }

  // Fallback
  return '/placeholder.png';
};

/**
 * Preload image to check if it loads successfully
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
};

/**
 * Load image with retry (handles NS_BINDING_ABORTED)
 */
export const loadImageWithRetry = async (src, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await preloadImage(src);
      return src;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  return '/placeholder.png';
};
```

---

## 📁 C) Reusable Image Component

### `src/components/ImageWithFallback.jsx`
```jsx
import { useState, useEffect, memo } from 'react';
import { getImageUrl } from '../utils/imageUtils';

/**
 * Image component with:
 * - Automatic fallback to placeholder
 * - Loading state
 * - Error handling (prevents NS_BINDING_ABORTED issues)
 * - Memoized to prevent unnecessary re-renders
 */
const ImageWithFallback = memo(({ 
  src, 
  alt = '', 
  fallback = '/placeholder.png',
  className = '',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Process the image URL once
  const processedSrc = getImageUrl(src);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    // Create new image to preload
    const img = new Image();
    
    img.onload = () => {
      if (isMounted) {
        setImageSrc(processedSrc);
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setImageSrc(fallback);
        setHasError(true);
        setIsLoading(false);
      }
    };

    img.src = processedSrc;

    // Cleanup to prevent NS_BINDING_ABORTED
    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
      img.src = '';
    };
  }, [processedSrc, fallback]);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} {...props}>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
});

ImageWithFallback.displayName = 'ImageWithFallback';

export default ImageWithFallback;
```

---

## 📁 D) Banner Display Component

### `src/components/Banner.jsx`
```jsx
import { useState, useEffect, useCallback, memo } from 'react';
import api from '../api/axios';
import ImageWithFallback from './ImageWithFallback';

const Banner = memo(() => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banners once on mount
  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/banners/active');
      
      if (response.data.success && response.data.data) {
        setBanners(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg">
      {/* Banner Image - Cloudinary URL */}
      <ImageWithFallback
        src={currentBanner.imageUrl}
        alt={currentBanner.title}
        className="w-full h-full object-cover"
      />

      {/* Overlay with text */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
        <h2 className="text-2xl md:text-4xl font-bold mb-2">
          {currentBanner.title}
        </h2>
        {currentBanner.subtitle && (
          <p className="text-lg md:text-xl">{currentBanner.subtitle}</p>
        )}
      </div>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

Banner.displayName = 'Banner';

export default Banner;
```

---

## 📁 E) Banner Upload Form (Admin)

### `src/components/BannerForm.jsx`
```jsx
import { useState, useRef } from 'react';
import api from '../api/axios';

const BannerForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only image files are allowed (jpeg, jpg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for multipart upload
      const data = new FormData();
      data.append('title', formData.title.trim());
      if (formData.subtitle.trim()) {
        data.append('subtitle', formData.subtitle.trim());
      }
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const response = await api.post('/banners', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Reset form
        setFormData({ title: '', subtitle: '' });
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notify parent
        onSuccess?.(response.data.data);
      }
    } catch (err) {
      console.error('Error creating banner:', err);
      setError(
        err.response?.data?.message || 
        'Failed to create banner. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">Create Banner</h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter banner title"
          required
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Subtitle
        </label>
        <input
          type="text"
          name="subtitle"
          value={formData.subtitle}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter banner subtitle (optional)"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Banner Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Max 5MB. Supported: JPEG, PNG, GIF, WebP
        </p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded border"
          />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded text-white font-medium transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Uploading...' : 'Create Banner'}
      </button>
    </form>
  );
};

export default BannerForm;
```

---

## 📁 F) Product Card Component

### `src/components/ProductCard.jsx`
```jsx
import { memo } from 'react';
import ImageWithFallback from './ImageWithFallback';

const ProductCard = memo(({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image - Cloudinary URL */}
      <ImageWithFallback
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            Rs. {product.price}
          </span>
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
```

---

## 📁 G) Environment Variables

### `.env` (Frontend - Vite)
```bash
VITE_API_URL=https://backend-epasal.onrender.com/api/v1
```

### `.env.development` (Local Development)
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 📁 H) Local Logos (Avoid OpaqueResponseBlocking)

Place SVG logos in `public/logos/` to load them locally:

```
public/
└── logos/
    ├── logo.svg
    ├── esewa.svg
    ├── khalti.svg
    └── placeholder.png
```

Usage:
```jsx
// ✅ Local logo - no CORS issues
<img src="/logos/esewa.svg" alt="eSewa" />

// ❌ External SVG - may cause OpaqueResponseBlocking
<img src="https://example.com/logo.svg" alt="Logo" />
```

---

## 🔄 Migration Steps (From /uploads to Cloudinary)

### Step 1: Update Frontend Code
Replace all image URL handling with `getImageUrl()` helper.

### Step 2: Re-upload Existing Images
Old images stored as `/uploads/xxx.jpg` are lost on Render.

**Option A: Manual (Admin Panel)**
1. Go to admin panel
2. Edit each product/banner/category
3. Upload new image → Cloudinary URL is saved

**Option B: Script (MongoDB)**
```javascript
// Run in MongoDB shell or script
// Mark items with old local paths so you know which need re-upload
db.products.updateMany(
  { imageUrl: { $regex: '^/uploads/' } },
  { $set: { needsImageReupload: true } }
);
```

### Step 3: Test
1. Create new banner with image
2. Check MongoDB - imageUrl should be `https://res.cloudinary.com/...`
3. Frontend should display image correctly

---

## ✅ Checklist

| Item | Status |
|------|--------|
| Cloudinary config in backend | ✅ |
| Memory storage (no disk) | ✅ |
| CORS with OPTIONS handler | ✅ |
| Error handling for uploads | ✅ |
| Frontend axios with timeout | ✅ |
| ImageWithFallback component | ✅ |
| getImageUrl helper | ✅ |
| Local logos in public/ | ✅ |
| Environment variables | ✅ |

---

## 🐛 Troubleshooting

### NS_BINDING_ABORTED
- Caused by component unmounting before image loads
- Fix: Use `ImageWithFallback` component with cleanup

### 502 on POST
- Caused by preflight OPTIONS not handled
- Fix: Backend has `app.options('*', cors(corsOptions))`

### 422 Validation Error
- Missing required fields
- Fix: Check form data includes all required fields

### Images Not Loading
- Old `/uploads/` paths don't exist on Render
- Fix: Re-upload images through admin panel

### CORS Error
- Frontend and backend domains don't match
- Fix: Backend CORS allows `origin: '*'`
