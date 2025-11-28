# 🛍️ How to Fetch Products in Frontend - Complete Guide

## 📋 Overview

**Flow:**
1. Frontend sends GET request to backend
2. Backend retrieves products from MongoDB
3. Frontend displays products with images, prices, filters
4. User can create/update/delete products (admin)

---

## 🚀 Step 1: Create Product Service

**File: `src/services/productService.ts`**

```typescript
import API from './api';

export interface Product {
  id: string;
  name: string;
  price: number;
  beforePrice: number;
  afterPrice: number;
  discountPrice: number;
  hasOffer: boolean;
  description?: string;
  imageUrl?: string;
  stock: number;
  category_id: string;
  createdAt: string;
  updatedAt: string;
}

export const productService = {
  /**
   * Get all products with pagination and filters
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    sort?: string;
  }): Promise<{
    products: Product[];
    pagination: any;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.sort) queryParams.append('sort', params.sort);

    const response = await API.get(`/products?${queryParams.toString()}`);
    return {
      products: response.data.data,
      pagination: response.data.pagination
    };
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await API.get(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Get products by category
   */
  getByCategory: async (categoryId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    products: Product[];
    pagination: any;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await API.get(`/products/category/${categoryId}?${queryParams.toString()}`);
    return {
      products: response.data.data,
      pagination: response.data.pagination
    };
  },

  /**
   * Get products with offers
   */
  getWithOffers: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    products: Product[];
    pagination: any;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await API.get(`/products/offers?${queryParams.toString()}`);
    return {
      products: response.data.data,
      pagination: response.data.pagination
    };
  },

  /**
   * Create product (admin)
   */
  create: async (data: {
    name: string;
    price: number;
    beforePrice: number;
    afterPrice: number;
    category_id: string;
    description?: string;
    stock?: number;
    discountPrice?: number;
    image?: File;
  }): Promise<Product> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price.toString());
    formData.append('beforePrice', data.beforePrice.toString());
    formData.append('afterPrice', data.afterPrice.toString());
    formData.append('category_id', data.category_id);
    if (data.description) formData.append('description', data.description);
    if (data.stock) formData.append('stock', data.stock.toString());
    if (data.discountPrice) formData.append('discountPrice', data.discountPrice.toString());
    if (data.image) formData.append('image', data.image);

    const response = await API.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  /**
   * Update product (admin)
   */
  update: async (id: string, data: Partial<Product> & { image?: File }): Promise<Product> => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key !== 'image' && (data as any)[key] !== undefined) {
        formData.append(key, (data as any)[key].toString());
      }
    });
    if (data.image) formData.append('image', data.image);

    const response = await API.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  /**
   * Delete product (admin)
   */
  delete: async (id: string): Promise<void> => {
    await API.delete(`/products/${id}`);
  }
};
```

---

## 📦 Step 2: Display All Products

**File: `src/components/ProductList.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { productService, Product } from '../services/productService';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // ✅ Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [page, search, filterCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await productService.getAll({
        page,
        limit: 12,
        search: search || undefined,
        category_id: filterCategory || undefined
      });
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get full image URL
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  // ✅ Calculate discount percentage
  const getDiscountPercent = (before: number, after: number) => {
    return Math.round(((before - after) / before) * 100);
  };

  if (loading) return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (products.length === 0) return <div className="text-gray-500 p-8">No products found</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Products</h1>

        {/* Search & Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="cat_electronics">Electronics</option>
            <option value="cat_clothing">Clothing</option>
            <option value="cat_books">Books</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />

                {/* Discount Badge */}
                {product.hasOffer && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{getDiscountPercent(product.beforePrice, product.afterPrice)}%
                  </div>
                )}

                {/* Stock Badge */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                {/* Prices */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold text-blue-600">₹{product.afterPrice}</span>
                  {product.beforePrice > product.afterPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{product.beforePrice}</span>
                  )}
                </div>

                {/* Stock Info */}
                <div className="text-sm mb-3">
                  <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={product.stock === 0}>
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
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
    </div>
  );
};
```

---

## 🏷️ Step 3: Products by Category

**File: `src/components/ProductsByCategory.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { productService, Product } from '../services/productService';

interface ProductsByCategoryProps {
  categoryId: string;
  categoryName?: string;
}

export const ProductsByCategory: React.FC<ProductsByCategoryProps> = ({ categoryId, categoryName }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await productService.getByCategory(categoryId, { page, limit: 12 });
      setProducts(result.products);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  if (loading) return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">{categoryName || 'Products'}</h2>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 p-8">No products in this category</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-t"
                />
                <div className="p-3">
                  <h3 className="font-bold mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600">₹{product.afterPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
```

---

## 🎉 Step 4: Products with Offers/Discounts

**File: `src/components/FeaturedProducts.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { productService, Product } from '../services/productService';

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      const result = await productService.getWithOffers({ limit: 8 });
      setProducts(result.products);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  if (loading) return <div className="text-center p-8">Loading featured products...</div>;

  return (
    <div className="bg-white p-8 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">🎉 Special Offers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
            <div className="relative">
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                Save ₹{product.beforePrice - product.afterPrice}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2">{product.name}</h3>
              <div className="flex gap-2 mb-3">
                <span className="text-xl font-bold">₹{product.afterPrice}</span>
                <span className="text-lg line-through text-gray-500">₹{product.beforePrice}</span>
              </div>
              <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔍 Step 5: Single Product Detail Page

**File: `src/pages/ProductDetailPage.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService, Product } from '../services/productService';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const result = await productService.getById(id);
      setProduct(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  if (loading) return <div className="text-center p-8">Loading product...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!product) return <div className="text-gray-500 p-8">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Pricing */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold text-blue-600">₹{product.afterPrice}</span>
                <span className="text-2xl line-through text-gray-400">₹{product.beforePrice}</span>
              </div>
              {product.hasOffer && (
                <span className="text-red-600 font-bold">
                  Save ₹{product.beforePrice - product.afterPrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className={`text-lg font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            </div>

            {/* Add to Cart */}
            {product.stock > 0 && (
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-16 text-center border-0 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-lg"
                  >
                    +
                  </button>
                </div>
                <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600">
                  Add to Cart ({quantity})
                </button>
              </div>
            )}

            {/* Product Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Product ID:</span>
                <span>{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <span>{product.category_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Stock:</span>
                <span>{product.stock} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🛣️ Step 6: Add Routes

**File: `src/App.tsx`**

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductList } from './components/ProductList';
import { ProductDetailPage } from './pages/ProductDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🧪 Testing Products API

### Get All Products
```bash
curl http://localhost:5000/api/v1/products
```

### Search Products
```bash
curl "http://localhost:5000/api/v1/products?search=laptop&page=1&limit=10"
```

### Get by Category
```bash
curl http://localhost:5000/api/v1/products/category/cat_123
```

### Get Products with Offers
```bash
curl http://localhost:5000/api/v1/products/offers
```

### Get Single Product
```bash
curl http://localhost:5000/api/v1/products/prod_123
```

---

## 📊 Complete Product Fetching Flow

```
Frontend Component
    ↓
useEffect triggers on mount
    ↓
productService.getAll() called
    ↓
API.get('/products') sent
    ↓
Interceptor adds Authorization header
    ↓
Backend receives request
    ↓
MongoDB returns products
    ↓
Response includes: {
  data: [
    {
      id: "prod_123",
      name: "Laptop",
      price: 150000,
      imageUrl: "/uploads/...",
      ...
    }
  ],
  pagination: {...}
}
    ↓
Frontend displays products in grid
    ↓
Images load from http://localhost:5000/uploads/...
    ↓
User can search, filter, paginate
```

---

## ✨ Summary

**What we created:**
1. ✅ Product service with all API calls
2. ✅ Product list with search & filter
3. ✅ Products by category component
4. ✅ Featured/offer products component
5. ✅ Product detail page
6. ✅ Pagination support
7. ✅ Image display handling

**Features:**
- ✅ Fetch all products
- ✅ Search & filter
- ✅ Category filtering
- ✅ Pagination
- ✅ Offers display
- ✅ Stock management
- ✅ Price formatting
- ✅ Error handling

Ready to use! 🚀
