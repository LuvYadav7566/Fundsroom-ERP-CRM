import React, { useEffect, useState, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product, PaginationMeta } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Search, Plus, Edit3, AlertTriangle, MapPin, Tag } from 'lucide-react';

export const Products: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        search,
        category: categoryFilter,
        lowStock: lowStockFilter,
        page,
        limit: 10,
      });
      setProducts(res.data);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      showError('Failed to load product catalog.');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, lowStockFilter, page, showError]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    setIsSaving(true);
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, data);
        showSuccess(`Product '${data.productName}' updated successfully.`);
      } else {
        await productService.createProduct(data);
        showSuccess(`Product '${data.productName}' added to catalog.`);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save product entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog & Inventory Tracking</h1>
          <p className="page-description">
            Manage wholesale products, unit prices, SKU identification codes, and warehouse stock thresholds.
          </p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Button variant="primary" icon={<Plus size={18} />} onClick={handleOpenAddModal}>
            Add New Product
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-bar" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name, SKU code, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '160px' }}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          <option value="Laptops">Laptops</option>
          <option value="Networking">Networking</option>
          <option value="Monitors">Monitors</option>
          <option value="Peripherals">Peripherals</option>
          <option value="Printers">Printers</option>
          <option value="Storage">Storage</option>
          <option value="Power Systems">Power Systems</option>
        </select>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            color: lowStockFilter ? 'var(--color-danger)' : 'var(--color-text)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: lowStockFilter ? 'var(--color-danger-bg)' : 'var(--color-surface)',
          }}
        >
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => {
              setLowStockFilter(e.target.checked);
              setPage(1);
            }}
          />
          <AlertTriangle size={16} /> Show Low Stock Only
        </label>
      </div>

      {/* Product Data Table */}
      {isLoading ? (
        <LoadingSkeleton height="50px" count={5} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="No products match your current search or category filter parameters."
          actionText={hasRole('ADMIN', 'WAREHOUSE') ? 'Add New Product' : undefined}
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th>SKU Code</th>
                <th>Category</th>
                <th>Unit Price (₹)</th>
                <th>Current Stock</th>
                <th>Min Stock Limit</th>
                <th>Warehouse Location</th>
                <th>Stock Status</th>
                {hasRole('ADMIN', 'WAREHOUSE') && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const isLowStock = prod.currentStock <= prod.minimumStock;
                return (
                  <tr key={prod.id} style={isLowStock ? { backgroundColor: '#FFFBEB' } : undefined}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {prod.productName}
                    </td>
                    <td>
                      <code
                        style={{
                          backgroundColor: '#F1F5F9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          color: 'var(--color-secondary)',
                          fontWeight: 700,
                        }}
                      >
                        {prod.sku}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Tag size={13} color="var(--color-text-muted)" />
                        {prod.category}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ₹{prod.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isLowStock ? 'var(--color-danger)' : 'var(--color-text)',
                        }}
                      >
                        {prod.currentStock} Units
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {prod.minimumStock} Units
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="var(--color-text-muted)" />
                        {prod.warehouseLocation}
                      </div>
                    </td>
                    <td>
                      {isLowStock ? (
                        <Badge variant="warning" icon={<AlertTriangle size={12} />}>
                          LOW STOCK
                        </Badge>
                      ) : (
                        <Badge variant="success">IN STOCK</Badge>
                      )}
                    </td>
                    {hasRole('ADMIN', 'WAREHOUSE') && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditModal(prod)}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Products)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialData={selectedProduct}
        isLoading={isSaving}
      />
    </div>
  );
};
