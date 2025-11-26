# Frontend Fetch Examples - Every Endpoint

## 📌 Base Configuration

```typescript
const API_BASE = 'https://backend-epasal.onrender.com/api/v1';

// Store tokens
const getAdminToken = () => localStorage.getItem('adminToken');
const getUserToken = () => localStorage.getItem('userToken');

// Error handler helper
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle auth errors
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      // Redirect to login
    }
    throw new Error(data.message || 'API Error');
  }
  
  return data;
};
```

---

## 🟢 PUBLIC ENDPOINTS (No Auth Required)

### 1. Get All Products

```typescript
// Basic
const getProducts = async () => {
  const response = await fetch(`${API_BASE}/products`);
  return handleResponse(response);
};

// With pagination and filters
const getProductsAdvanced = async (params = {}) => {
  const defaultParams = {
    page: 1,
    limit: 10,
    ...params
  };
  
  const queryString = new URLSearchParams(defaultParams).toString();
  const response = await fetch(`${API_BASE}/products?${queryString}`);
  return handleResponse(response);
};

// Usage
const data = await getProducts();
console.log(data.data);      // Product[]
console.log(data.pagination); // { page, limit, total, pages }

// With filters
const filtered = await getProductsAdvanced({
  page: 1,
  limit: 20,
  hasOffer: true,
  minPrice: 100,
  maxPrice: 1000,
  search: 'laptop'
});
```

### 2. Get Products with Offers

```typescript
const getProductsWithOffers = async () => {
  const response = await fetch(`${API_BASE}/products/offers`);
  return handleResponse(response);
};

// Usage
const data = await getProductsWithOffers();
// data.data = Product[] (only with hasOffer = true)
```

### 3. Get Products by Category

```typescript
const getProductsByCategory = async (categoryId) => {
  const response = await fetch(
    `${API_BASE}/products/category/${categoryId}`
  );
  return handleResponse(response);
};

// Usage
const data = await getProductsByCategory('cat_123');
```

### 4. Get Single Product

```typescript
const getProductById = async (productId) => {
  const response = await fetch(`${API_BASE}/products/${productId}`);
  return handleResponse(response);
};

// Usage
const product = await getProductById('prod_xyz');
console.log(product.data);
```

### 5. Get All Categories

```typescript
const getCategories = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(
    `${API_BASE}/categories?${queryString}`
  );
  return handleResponse(response);
};

// Usage
const data = await getCategories({ page: 1, limit: 50 });
```

### 6. Get Active Categories Only

```typescript
const getActiveCategories = async () => {
  const response = await fetch(`${API_BASE}/categories/active`);
  return handleResponse(response);
};

// Usage
const categories = await getActiveCategories();
// Perfect for dropdown menus
```

### 7. Get Category by Slug

```typescript
const getCategoryBySlug = async (slug) => {
  const response = await fetch(
    `${API_BASE}/categories/slug/${slug}`
  );
  return handleResponse(response);
};

// Usage
const category = await getCategoryBySlug('electronics');
```

### 8. Get Single Category

```typescript
const getCategoryById = async (categoryId) => {
  const response = await fetch(`${API_BASE}/categories/${categoryId}`);
  return handleResponse(response);
};
```

### 9. Get All Banners

```typescript
const getBanners = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(
    `${API_BASE}/banners?${queryString}`
  );
  return handleResponse(response);
};
```

### 10. Get Active Banners

```typescript
const getActiveBanners = async () => {
  const response = await fetch(`${API_BASE}/banners/active`);
  return handleResponse(response);
};

// Usage - For homepage carousel
const banners = await getActiveBanners();
// banners.data = Banner[] (ready to display)
```

### 11. Get Single Banner

```typescript
const getBannerById = async (bannerId) => {
  const response = await fetch(`${API_BASE}/banners/${bannerId}`);
  return handleResponse(response);
};
```

### 12. Get Active Coupons

```typescript
const getActiveCoupons = async () => {
  const response = await fetch(`${API_BASE}/coupons/active`);
  return handleResponse(response);
};

// Usage - Show available coupons at checkout
const coupons = await getActiveCoupons();
```

### 13. Get Active Flash Sales

```typescript
const getActiveFlashSales = async () => {
  const response = await fetch(`${API_BASE}/flash-sales/active`);
  return handleResponse(response);
};

// Usage - Show flash sales on homepage
const flashSales = await getActiveFlashSales();
```

### 14. Get Flash Sale by Product ID

```typescript
const getFlashSaleByProduct = async (productId) => {
  const response = await fetch(
    `${API_BASE}/flash-sales/product/${productId}`
  );
  return handleResponse(response);
};

// Usage - Check if product has flash sale
const flashSale = await getFlashSaleByProduct('prod_123');
if (flashSale.data) {
  console.log('Flash price:', flashSale.data.flashPrice);
}
```

### 15. Get Flash Sale by ID

```typescript
const getFlashSaleById = async (flashSaleId) => {
  const response = await fetch(
    `${API_BASE}/flash-sales/${flashSaleId}`
  );
  return handleResponse(response);
};
```

### 16. Check if Flash Sale is Active

```typescript
const isFlashSaleActive = async (flashSaleId) => {
  const response = await fetch(
    `${API_BASE}/flash-sales/${flashSaleId}/is-active`
  );
  return handleResponse(response);
};

// Usage
const active = await isFlashSaleActive('fs_123');
console.log(active.data.isActive); // true or false
```

### 17. Validate Coupon (Optional Auth)

```typescript
const validateCoupon = async (code, amount = null) => {
  const body = { code };
  if (amount) body.amount = amount;
  
  const token = getUserToken(); // Optional
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  return handleResponse(response);
};

// Usage
const coupon = await validateCoupon('SUMMER50', 500);
if (coupon.success) {
  console.log('Discount:', coupon.data.discountAmount);
}
```

### 18. Create Order (Optional Auth)

```typescript
const createOrder = async (orderData, userToken = null) => {
  const headers = { 'Content-Type': 'application/json' };
  
  // Add token if available
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });
  return handleResponse(response);
};

// Usage - Guest checkout
const guestOrder = await createOrder({
  name: "John Doe",
  phone: "1234567890",
  district: "Kathmandu",
  city: "Kathmandu",
  address: "123 Main St",
  description: "Please deliver ASAP",
  items: [
    {
      productId: "prod_123",
      name: "Laptop",
      price: 50000,
      quantity: 1,
      imageUrl: "https://..."
    },
    {
      productId: "prod_456",
      name: "Mouse",
      price: 500,
      quantity: 2,
      imageUrl: "https://..."
    }
  ],
  totalAmount: 51000
});

console.log('Order ID:', guestOrder.data.id);

// Usage - Authenticated user
const userOrder = await createOrder(
  { /* order data */ },
  getUserToken()
);
```

### 19. Health Check

```typescript
const healthCheck = async () => {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse(response);
};

// Usage - Check if API is live
const health = await healthCheck();
console.log(health.message); // "API is running"
```

---

## 🔐 ADMIN PROTECTED ENDPOINTS

### Admin Setup

```typescript
const makeAdminRequest = async (endpoint, method = 'GET', body = null) => {
  const token = getAdminToken();
  
  if (!token) {
    throw new Error('Admin token not found. Please login.');
  }
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return handleResponse(response);
};
```

### Admin: Products

```typescript
// Create Product
const createProduct = async (productData, imageFile = null) => {
  const token = getAdminToken();
  
  if (imageFile) {
    // With image upload
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description || '');
    formData.append('beforePrice', productData.beforePrice);
    formData.append('afterPrice', productData.afterPrice);
    formData.append('discountPrice', productData.discountPrice);
    formData.append('hasOffer', productData.hasOffer);
    formData.append('stock', productData.stock || '');
    formData.append('category_id', productData.category_id || '');
    formData.append('sectionId', productData.sectionId);
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData
      },
      body: formData
    });
    return handleResponse(response);
  } else {
    // Without image
    return makeAdminRequest('/products', 'POST', productData);
  }
};

// Update Product
const updateProduct = async (productId, updates, imageFile = null) => {
  const token = getAdminToken();
  
  if (imageFile) {
    const formData = new FormData();
    Object.keys(updates).forEach(key => {
      formData.append(key, updates[key]);
    });
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  } else {
    return makeAdminRequest(`/products/${productId}`, 'PUT', updates);
  }
};

// Delete Product
const deleteProduct = async (productId) => {
  return makeAdminRequest(`/products/${productId}`, 'DELETE');
};

// Usage
const newProduct = await createProduct({
  name: "Gaming Laptop",
  description: "High performance laptop",
  beforePrice: 100000,
  afterPrice: 80000,
  discountPrice: 20000,
  hasOffer: true,
  stock: 10,
  category_id: "cat_456",
  sectionId: "sec_789"
}, imageFile);

const updated = await updateProduct('prod_123', {
  name: "Updated Laptop",
  stock: 5
});

await deleteProduct('prod_123');
```

### Admin: Categories

```typescript
const createCategory = async (categoryData, imageFile) => {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('name', categoryData.name);
  formData.append('description', categoryData.description);
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return handleResponse(response);
};

const updateCategory = async (categoryId, updates, imageFile = null) => {
  const token = getAdminToken();
  
  if (imageFile) {
    const formData = new FormData();
    Object.keys(updates).forEach(key => {
      formData.append(key, updates[key]);
    });
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return handleResponse(response);
  } else {
    return makeAdminRequest(`/categories/${categoryId}`, 'PUT', updates);
  }
};

const deleteCategory = async (categoryId) => {
  return makeAdminRequest(`/categories/${categoryId}`, 'DELETE');
};
```

### Admin: Banners

```typescript
const createBanner = async (bannerData, imageFile) => {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append('title', bannerData.title);
  formData.append('subtitle', bannerData.subtitle || '');
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_BASE}/banners`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return handleResponse(response);
};

const updateBanner = async (bannerId, updates, imageFile = null) => {
  const token = getAdminToken();
  
  if (imageFile) {
    const formData = new FormData();
    Object.keys(updates).forEach(key => {
      formData.append(key, updates[key]);
    });
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE}/banners/${bannerId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return handleResponse(response);
  } else {
    return makeAdminRequest(`/banners/${bannerId}`, 'PUT', updates);
  }
};

const deleteBanner = async (bannerId) => {
  return makeAdminRequest(`/banners/${bannerId}`, 'DELETE');
};
```

### Admin: Coupons

```typescript
const createCoupon = async (couponData) => {
  return makeAdminRequest('/coupons', 'POST', couponData);
};

const getAllCoupons = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return makeAdminRequest(`/coupons?${queryString}`);
};

const getCouponByCode = async (code) => {
  return makeAdminRequest(`/coupons/${code}`);
};

const updateCoupon = async (code, updates) => {
  return makeAdminRequest(`/coupons/${code}`, 'PUT', updates);
};

const deleteCoupon = async (code) => {
  return makeAdminRequest(`/coupons/${code}`, 'DELETE');
};

// Usage
const coupon = await createCoupon({
  code: "SUMMER50",
  discountAmount: 500,
  validFrom: "2024-06-01",
  validTo: "2024-08-31",
  isActive: true
});
```

### Admin: Orders

```typescript
const getAllOrders = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return makeAdminRequest(`/orders?${queryString}`);
};

const getOrderById = async (orderId) => {
  return makeAdminRequest(`/orders/${orderId}`);
};

const getOrdersByStatus = async (status, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return makeAdminRequest(`/orders/status/${status}?${queryString}`);
};

const getOrdersByUser = async (userId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return makeAdminRequest(`/orders/user/${userId}?${queryString}`);
};

const getOrderStatistics = async () => {
  return makeAdminRequest('/orders/stats');
};

const getOrderStatus = async (orderId) => {
  return makeAdminRequest(`/orders/${orderId}/status`);
};

const updateOrderStatus = async (orderId, statusUpdate) => {
  return makeAdminRequest(`/orders/${orderId}/status`, 'PUT', statusUpdate);
};

// Usage
const orders = await getAllOrders({ page: 1, limit: 20 });

const pendingOrders = await getOrdersByStatus('pending');

const updated = await updateOrderStatus('order_123', {
  status: 'processing',
  note: 'Preparing for shipment',
  location: 'Warehouse'
});
```

### Admin: Flash Sales

```typescript
const getAllFlashSales = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return makeAdminRequest(`/flash-sales?${queryString}`);
};

const createFlashSale = async (flashSaleData) => {
  return makeAdminRequest('/flash-sales', 'POST', flashSaleData);
};

const updateFlashSale = async (flashSaleId, updates) => {
  return makeAdminRequest(`/flash-sales/${flashSaleId}`, 'PUT', updates);
};

const deleteFlashSale = async (flashSaleId) => {
  return makeAdminRequest(`/flash-sales/${flashSaleId}`, 'DELETE');
};

const incrementFlashSaleStock = async (flashSaleId) => {
  return makeAdminRequest(
    `/flash-sales/${flashSaleId}/increment-stock`,
    'POST'
  );
};

const deactivateExpiredFlashSales = async () => {
  return makeAdminRequest(
    '/flash-sales/deactivate-expired',
    'POST'
  );
};

// Usage
const flashSale = await createFlashSale({
  productId: "prod_123",
  flashPrice: 40000,
  maxStock: 50,
  startTime: "2024-06-01T10:00:00Z",
  endTime: "2024-06-01T23:59:59Z",
  isActive: true
});
```

---

## ⚡ React Hooks Example

```typescript
import { useState, useEffect } from 'react';

// Custom hook for API calls
const useAPI = (url, token = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(
          `${API_BASE}${url}`,
          { headers }
        );
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.message);
        
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, token]);

  return { data, loading, error };
};

// Usage
function ProductList() {
  const { data, loading, error } = useAPI('/products?page=1&limit=20');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.data?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

