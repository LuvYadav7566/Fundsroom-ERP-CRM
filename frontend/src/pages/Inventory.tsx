import React, { useEffect, useState, useCallback } from 'react';
import { stockService } from '../services/stockService';
import { productService } from '../services/productService';
import { StockMovement, Product, PaginationMeta } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { AddStockModal } from '../components/inventory/AddStockModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Boxes, PlusCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, UserCheck } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Modal
  const [isAddStockOpen, setIsAddStockOpen] = useState<boolean>(false);
  const [isSubmittingStock, setIsSubmittingStock] = useState<boolean>(false);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await stockService.getMovements({
        movementType: typeFilter,
        page,
        limit: 10,
      });
      setMovements(res.data);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      showError('Failed to load stock movement history.');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, page, showError]);

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await productService.getProducts({ page: 1, limit: 100 });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products for stock modal:', err);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
    fetchAllProducts();
  }, [fetchMovements, fetchAllProducts]);

  const handleAddStock = async (data: { productId: string; quantity: number; reason: string }) => {
    setIsSubmittingStock(true);
    try {
      await stockService.addStockIn(data);
      showSuccess(`Inward stock entry of ${data.quantity} units processed successfully.`);
      setIsAddStockOpen(false);
      fetchMovements();
      fetchAllProducts();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to add stock.');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minimumStock).length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory & Stock Movement Audit</h1>
          <p className="page-description">
            Audit inward shipments (IN), outward challan deductions (OUT), and warehouse movement history.
          </p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => setIsAddStockOpen(true)}>
            Add Inward Stock (IN)
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card flex items-center gap-4">
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Boxes size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TOTAL STOCK UNITS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {totalStockUnits.toLocaleString()} Units
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            <ArrowUpRight size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>CATALOG PRODUCTS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {products.length} Products
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: lowStockCount > 0 ? 'var(--color-warning-bg)' : '#F8FAFC',
              color: lowStockCount > 0 ? 'var(--color-warning-text)' : 'var(--color-text-muted)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>LOW STOCK ALERTS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: lowStockCount > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
              {lowStockCount} Items Below Threshold
            </div>
          </div>
        </div>
      </div>

      {/* Movements Filter Bar */}
      <div className="card filter-bar" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          Filter Stock Movements:
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Movement Types</option>
          <option value="IN">IN (Inward Procurement)</option>
          <option value="OUT">OUT (Sales Challan Outward)</option>
        </select>
      </div>

      {/* Stock Movement Log Table */}
      {isLoading ? (
        <LoadingSkeleton height="50px" count={5} />
      ) : movements.length === 0 ? (
        <EmptyState
          title="No Stock Movements Logged"
          description="There are no stock inward or outward transaction records matching the current filter."
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Reason / Transaction Details</th>
                <th>Logged By User</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {m.product?.productName}
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>
                      SKU: {m.product?.sku}
                    </div>
                  </td>
                  <td>
                    {m.movementType === 'IN' ? (
                      <Badge variant="success" icon={<ArrowUpRight size={12} />}>
                        INWARD (IN)
                      </Badge>
                    ) : (
                      <Badge variant="danger" icon={<ArrowDownRight size={12} />}>
                        OUTWARD (OUT)
                      </Badge>
                    )}
                  </td>
                  <td
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: m.movementType === 'IN' ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                    }}
                  >
                    {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} Units
                  </td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                    {m.reason}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <UserCheck size={14} color="var(--color-text-muted)" />
                      {m.user?.name || 'Warehouse Staff'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {new Date(m.createdAt).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
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
                Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Movement Logs)
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

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        onSubmit={handleAddStock}
        products={products}
        isLoading={isSubmittingStock}
      />
    </div>
  );
};
