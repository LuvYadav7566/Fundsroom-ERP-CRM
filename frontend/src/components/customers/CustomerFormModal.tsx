import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Customer, CustomerType, CustomerStatus } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Customer>) => Promise<void>;
  initialData?: Customer | null;
  isLoading?: boolean;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('WHOLESALE');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customerName || '');
      setMobile(initialData.mobile || '');
      setEmail(initialData.email || '');
      setBusinessName(initialData.businessName || '');
      setGstNumber(initialData.gstNumber || '');
      setCustomerType(initialData.customerType || 'WHOLESALE');
      setAddress(initialData.address || '');
      setStatus(initialData.status || 'ACTIVE');
      setFollowUpDate(
        initialData.followUpDate
          ? new Date(initialData.followUpDate).toISOString().split('T')[0]
          : ''
      );
      setNotes(initialData.notes || '');
    } else {
      setCustomerName('');
      setMobile('');
      setEmail('');
      setBusinessName('');
      setGstNumber('');
      setCustomerType('WHOLESALE');
      setAddress('');
      setStatus('ACTIVE');
      setFollowUpDate('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      customerName,
      mobile,
      email,
      businessName,
      gstNumber: gstNumber || null,
      customerType,
      address,
      status,
      followUpDate: followUpDate || null,
      notes: notes || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Customer CRM Profile' : 'Add New Customer'}
      maxWidth="600px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Contact Person Name *"
            placeholder="e.g. Rajesh Sharma"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <Input
            label="Business Name *"
            placeholder="e.g. Sharma Distributors Pvt Ltd"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Mobile Number *"
            placeholder="+91 98230 11223"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="contact@sharma.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="GST Number (Optional)"
            placeholder="27AAACS1234H1Z5"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
          <Select
            label="Customer Category Type *"
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            options={[
              { value: 'WHOLESALE', label: 'Wholesale' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
              { value: 'RETAIL', label: 'Retail' },
            ]}
          />
        </div>

        <Input
          label="Billing / Delivery Address *"
          placeholder="Building, Industrial Area, City, State, Pincode"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="CRM Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value as CustomerStatus)}
            options={[
              { value: 'LEAD', label: 'Lead' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
          <Input
            label="Next CRM Follow-up Date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">CRM Notes / Sales Inquiry History</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Add follow-up discussion notes, bulk inquiry details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
