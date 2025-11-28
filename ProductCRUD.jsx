import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, X, Upload, Search, Eye, EyeOff } from 'lucide-react';
import './ProductCRUD.css';

const ProductCRUD = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    beforePrice: '',
    afterPrice: '',
    description: '',
    stock: '',
    category_id: '',
    image: null
  });

  // ✅ Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search, filterCategory, sortBy]);

  // ✅ Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(filterCategory && { category_id: filterCategory }),
        ...(sortBy && { sort: sortBy })
      });

      const response = await fetch(
        `http://localhost:5000/api/v1/products?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // ✅ Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files?.[0];
      setFormData(prev => ({ ...prev, image: file }));
      
      // Preview image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Create product
  const handleCreate = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      const body = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          body.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5000/api/v1/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      setSuccess('Product created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      const body = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          body.append(key, formData[key]);
        }
      });

      const response = await fetch(
        `http://localhost:5000/api/v1/products/${editingId}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body
        }
      );

      if (!response.ok) throw new Error('Failed to update product');

      setSuccess('Product updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:5000/api/v1/products/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to delete product');

      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowDeleteModal(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Edit product
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      beforePrice: product.beforePrice,
      afterPrice: product.afterPrice,
      description: product.description || '',
      stock: product.stock || '',
      category_id: product.category_id,
      image: null
    });
    setImagePreview(product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null);
    setShowForm(true);
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      beforePrice: '',
      afterPrice: '',
      description: '',
      stock: '',
      category_id: '',
      image: null
    });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  // ✅ Get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  return (
    <div className="product-crud-container">
      {/* Header */}
      <div className="crud-header">
        <div>
          <h1 className="crud-title">📦 Product Management</h1>
          <p className="crud-subtitle">Manage your product inventory</p>
        </div>
        <button className="btn-create" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <X size={20} className="cursor-pointer" onClick={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <X size={20} className="cursor-pointer" onClick={() => setSuccess('')} />
        </div>
      )}

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="stock">Sort by Stock</option>
          <option value="-createdAt">Sort by Newest</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="products-section">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>📭 No products found</p>
            <button className="btn-create" onClick={() => setShowForm(true)}>
              Create your first product
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Offer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="product-row">
                      <td>
                        <div className="product-cell">
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="product-thumb"
                            onError={(e) => e.target.src = '/placeholder-product.jpg'}
                          />
                          <div>
                            <p className="product-name">{product.name}</p>
                            <p className="product-id">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.category_id}</span>
                      </td>
                      <td>
                        <div className="price-cell">
                          <p className="price-current">₹{product.afterPrice}</p>
                          {product.beforePrice > product.afterPrice && (
                            <p className="price-original">₹{product.beforePrice}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td>
                        {product.hasOffer ? (
                          <span className="offer-badge">
                            🎉 -{Math.round(((product.beforePrice - product.afterPrice) / product.beforePrice) * 100)}%
                          </span>
                        ) : (
                          <span className="no-offer">-</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => setShowDeleteModal(product.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2>{editingId ? '✏️ Edit Product' : '➕ Create New Product'}</h2>
              <button className="btn-close" onClick={resetForm}>
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="product-form">
              <div className="form-grid">
                {/* Product Name */}
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                    className="form-input"
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="form-group">
                  <label>Current Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                    className="form-input"
                  />
                </div>

                {/* Before Price */}
                <div className="form-group">
                  <label>Before Price (₹)</label>
                  <input
                    type="number"
                    name="beforePrice"
                    value={formData.beforePrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                {/* After Price */}
                <div className="form-group">
                  <label>After Price (₹)</label>
                  <input
                    type="number"
                    name="afterPrice"
                    value={formData.afterPrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                {/* Stock */}
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                {/* Description - Full Width */}
                <div className="form-group form-full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    rows="3"
                    className="form-input"
                  />
                </div>

                {/* Image Upload */}
                <div className="form-group form-full-width">
                  <label>Product Image</label>
                  <div className="image-upload-area">
                    {imagePreview ? (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <Upload size={32} />
                        <div>
                          <p>Click to upload image</p>
                          <p className="upload-hint">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          name="image"
                          onChange={handleInputChange}
                          accept="image/*"
                          className="file-input"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-delete" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">🗑️</div>
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(showDeleteModal)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCRUD;
