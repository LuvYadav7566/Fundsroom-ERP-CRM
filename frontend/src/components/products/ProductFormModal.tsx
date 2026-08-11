import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Product } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [unitPrice, setUnitPrice] = useState<number | ''>(0);
  const [currentStock, setCurrentStock] = useState<number | ''>(0);
  const [minimumStock, setMinimumStock] = useState<number | ''>(5);
  const [warehouseLocation, setWarehouseLocation] = useState('');

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName || '');
      setSku(initialData.sku || '');
      setCategory(initialData.category || 'Laptops');
      setUnitPrice(initialData.unitPrice || 0);
      setCurrentStock(initialData.currentStock || 0);
      setMinimumStock(initialData.minimumStock || 5);
      setWarehouseLocation(initialData.warehouseLocation || '');
    } else {
      setProductName('');
      setSku('');
      setCategory('Laptops');
      setUnitPrice(0);
      setCurrentStock(0);
      setMinimumStock(5);
      setWarehouseLocation('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      productName,
      sku,
      category,
      unitPrice: Number(unitPrice),
      currentStock: Number(currentStock),
      minimumStock: Number(minimumStock),
      warehouseLocation,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Product Catalog Entry' : 'Add New Product'}
      maxWidth="580px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Product Name *"
          placeholder="e.g. Fundsroom ProBook 15.6 i7 Workstation"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="SKU Code *"
            placeholder="FR-LAP-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
          <Input
            label="Category *"
            placeholder="e.g. Laptops, Networking, Storage"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Input
            label="Unit Price (₹) *"
            type="number"
            min="0"
            step="0.01"
            placeholder="65000"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
            required
          />
          <Input
            label="Current Stock *"
            type="number"
            min="0"
            placeholder="25"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value ? Number(e.target.value) : '')}
            required
          />
          <Input
            label="Min Stock Warning *"
            type="number"
            min="0"
            placeholder="5"
            value={minimumStock}
            onChange={(e) => setMinimumStock(e.target.value ? Number(e.target.value) : '')}
            required
          />
        </div>

        <Input
          label="Warehouse Location Tag *"
          placeholder="e.g. Aisle A-101 (Bhiwandi Hub)"
          value={warehouseLocation}
          onChange={(e) => setWarehouseLocation(e.target.value)}
          required
        />
      </form>
    </Modal>
  );
};
