import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Product } from '../../types';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; quantity: number; reason: string }) => Promise<void>;
  products: Product[];
  isLoading?: boolean;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  isLoading = false,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [reason, setReason] = useState<string>('Inward Purchase Procurement Shipment');

  const productOptions = [
    { value: '', label: '-- Select Product for Stock IN Entry --' },
    ...products.map((p) => ({
      value: p.id,
      label: `${p.productName} (SKU: ${p.sku}) [Current: ${p.currentStock} Units]`,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    await onSubmit({
      productId: selectedProductId,
      quantity: Number(quantity),
      reason,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Stock Inward Entry (Stock IN)"
      maxWidth="550px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading} disabled={!selectedProductId}>
            Process Inward Stock
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Select
          label="Select Target Product *"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          options={productOptions}
          required
        />

        <Input
          label="Quantity to Add *"
          type="number"
          min="1"
          placeholder="e.g. 25"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
          required
        />

        <Input
          label="Reason / Inward Shipment Reference *"
          placeholder="e.g. PO-8892 Inward Vendor Shipment"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </form>
    </Modal>
  );
};
