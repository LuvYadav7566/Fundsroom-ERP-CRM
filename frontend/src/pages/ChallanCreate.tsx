import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { Customer, Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Input } from '../components/common/Input';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ArrowLeft, Plus, Trash2, Save, CheckCircle2, AlertTriangle, Building } from 'lucide-react';

interface ChallanRowItem {
  productId: string;
  quantity: number;
}

export const ChallanCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();

  const preselectedCustomerId = (location.state as any)?.selectedCustomerId || '';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId);
  const [items, setItems] = useState<ChallanRowItem[]>([{ productId: '', quantity: 1 }]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isConfirmingDirectly, setIsConfirmingDirectly] = useState<boolean>(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ page: 1, limit: 100 }),
          productService.getProducts({ page: 1, limit: 100 }),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        showError('Failed to load customers and products list.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

  const handleAddItemRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculations
  const calculatedItemsSummary = items.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = product ? product.unitPrice : 0;
    const availableStock = product ? product.currentStock : 0;
    const rowTotal = unitPrice * (item.quantity || 0);
    const isInsufficient = product ? item.quantity > product.currentStock : false;

    return {
      ...item,
      product,
      unitPrice,
      availableStock,
      rowTotal,
      isInsufficient,
    };
  });

  const totalQuantitySum = calculatedItemsSummary.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAmountSum = calculatedItemsSummary.reduce((sum, item) => sum + item.rowTotal, 0);

  const validateForm = () => {
    if (!selectedCustomerId) {
      showError('Please select a customer for the sales challan.');
      return false;
    }
    if (items.length === 0 || items.some((i) => !i.productId)) {
      showError('Please select a product for all row items.');
      return false;
    }
    if (items.some((i) => !i.quantity || i.quantity <= 0)) {
      showError('Product quantity must be at least 1.');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    setIsSavingDraft(true);

    try {
      const challan = await challanService.createDraftChallan({
        customerId: selectedCustomerId,
        items,
      });
      showSuccess(`Draft Sales Challan '${challan.challanNumber}' created successfully.`);
      navigate(`/challans/${challan.id}`);
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create draft challan.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleConfirmDirectly = async () => {
    if (!validateForm()) return;

    // Check for obvious frontend stock deficiency first
    const insufficientItem = calculatedItemsSummary.find((i) => i.isInsufficient);
    if (insufficientItem) {
      showError(
        `Insufficient stock for '${insufficientItem.product?.productName}'. Available: ${insufficientItem.availableStock}, Requested: ${insufficientItem.quantity}`
      );
      return;
    }

    setIsConfirmingDirectly(true);

    try {
      // Step 1: Create draft
      const draft = await challanService.createDraftChallan({
        customerId: selectedCustomerId,
        items,
      });

      // Step 2: Transactional confirmation
      const confirmed = await challanService.confirmChallan(draft.id);
      showSuccess(`Sales Challan '${confirmed.challanNumber}' confirmed! Inventory updated.`);
      navigate(`/challans/${confirmed.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Transaction failed. Stock preserved.';
      showError(msg);
    } finally {
      setIsConfirmingDirectly(false);
    }
  };

  if (isLoadingData) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate('/challans')} icon={<ArrowLeft size={16} />}>
          Back to Sales Challans
        </Button>
        <div style={{ marginTop: '1.5rem' }}>
          <LoadingSkeleton height="150px" count={2} />
        </div>
      </div>
    );
  }

  const customerOptions = [
    { value: '', label: '-- Select Customer Business --' },
    ...customers.map((c) => ({
      value: c.id,
      label: `${c.businessName} (${c.customerName} - ${c.customerType})`,
    })),
  ];

  return (
    <div>
      {/* Back button & Page Title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Button variant="outline" size="sm" onClick={() => navigate('/challans')} icon={<ArrowLeft size={16} />}>
          Back to Sales Challans
        </Button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Generate New Sales Challan</h1>
          <p className="page-description">
            Select customer business, specify order quantities, check real-time stock levels, and save or confirm.
          </p>
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.05rem',
            color: 'var(--color-primary)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Building size={18} color="var(--color-secondary)" /> Step 1: Customer Business Details
        </h3>

        <Select
          label="Customer Business Account *"
          value={selectedCustomerId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCustomerId(e.target.value)}
          options={customerOptions}
        />

        {selectedCustomerId && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginTop: '0.5rem',
              fontSize: '0.88rem',
              display: 'flex',
              gap: '2rem',
            }}
          >
            {(() => {
              const cust = customers.find((c) => c.id === selectedCustomerId);
              if (!cust) return null;
              return (
                <>
                  <div>
                    <span className="text-muted">Contact:</span> <strong>{cust.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Mobile:</span> <strong>{cust.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Type:</span> <strong>{cust.customerType}</strong>
                  </div>
                  <div>
                    <span className="text-muted">GST:</span> <strong>{cust.gstNumber || 'N/A'}</strong>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Step 2: Line Items Builder */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
            Step 2: Add Products & Line Quantities
          </h3>
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={handleAddItemRow}>
            Add Item Row
          </Button>
        </div>

        <div className="table-container" style={{ border: '1px solid var(--color-border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Product Selection</th>
                <th style={{ width: '15%' }}>Available Stock</th>
                <th style={{ width: '15%' }}>Unit Price</th>
                <th style={{ width: '15%' }}>Quantity</th>
                <th style={{ width: '15%' }}>Total Value</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {calculatedItemsSummary.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      className="form-control"
                      value={item.productId}
                      onChange={(e) => handleRowChange(idx, 'productId', e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {item.product ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: item.isInsufficient ? 'var(--color-danger)' : 'var(--color-success-text)',
                          }}
                        >
                          {item.availableStock} Units
                        </span>
                        {item.isInsufficient && (
                          <span title="Requested quantity exceeds available stock!">
                            <AlertTriangle size={16} color="var(--color-danger)" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {item.product ? `₹${item.unitPrice.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      className={`form-control ${item.isInsufficient ? 'error' : ''}`}
                      value={item.quantity}
                      onChange={(e) => handleRowChange(idx, 'quantity', parseInt(e.target.value, 10) || 0)}
                    />
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    ₹{item.rowTotal.toLocaleString('en-IN')}
                  </td>
                  <td>
                    {items.length > 1 && (
                      <button
                        className="modal-close"
                        onClick={() => handleRemoveItemRow(idx)}
                        style={{ color: 'var(--color-danger)' }}
                        title="Remove Line Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ORDER TOTAL SUMMARY</div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.2rem' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total Items Quantity:</span>{' '}
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{totalQuantitySum} Units</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>Estimated Subtotal:</span>{' '}
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-secondary)' }}>
                ₹{totalAmountSum.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            icon={<Save size={16} />}
            onClick={handleSaveDraft}
            isLoading={isSavingDraft}
            disabled={isConfirmingDirectly}
          >
            Save as Draft
          </Button>

          <Button
            variant="secondary"
            icon={<CheckCircle2 size={16} />}
            onClick={handleConfirmDirectly}
            isLoading={isConfirmingDirectly}
            disabled={isSavingDraft}
          >
            Confirm Challan & Deduct Stock
          </Button>
        </div>
      </div>
    </div>
  );
};
