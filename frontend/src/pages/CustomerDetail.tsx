import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { Customer } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  FileText,
  Calendar,
  MapPin,
  FileCheck,
  Edit3,
  Plus,
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchCustomer = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
    } catch (err: any) {
      showError('Failed to load customer profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleUpdateCustomer = async (data: Partial<Customer>) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await customerService.updateCustomer(id, data);
      showSuccess('Customer CRM profile updated successfully.');
      setIsEditModalOpen(false);
      fetchCustomer();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !customer) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')} icon={<ArrowLeft size={16} />}>
          Back to Customers
        </Button>
        <div style={{ marginTop: '1.5rem' }}>
          <LoadingSkeleton height="150px" count={2} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button & Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')} icon={<ArrowLeft size={16} />}>
          Back to Customers List
        </Button>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">{customer.customerName}</h1>
            {customer.status === 'ACTIVE' && <Badge variant="success">Active</Badge>}
            {customer.status === 'LEAD' && <Badge variant="warning">Lead</Badge>}
            {customer.status === 'INACTIVE' && <Badge variant="danger">Inactive</Badge>}
            <Badge variant="neutral">{customer.customerType}</Badge>
          </div>
          <p className="page-description" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
            <Building size={16} color="var(--color-secondary)" /> <strong>{customer.businessName}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {hasRole('ADMIN', 'SALES') && (
            <>
              <Button variant="outline" icon={<Edit3 size={16} />} onClick={() => setIsEditModalOpen(true)}>
                Edit CRM Profile
              </Button>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => navigate('/challans/create', { state: { selectedCustomerId: customer.id } })}
              >
                Create Sales Challan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid Layout: Customer Info + CRM Notes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Contact & Business Info Card */}
        <div className="card">
          <h3
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-primary)',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.6rem',
            }}
          >
            Business Contact Overview
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.92rem' }}>
            <div>
              <span className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Primary Mobile
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Phone size={16} color="var(--color-secondary)" /> {customer.mobile}
              </div>
            </div>

            <div>
              <span className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Mail size={16} color="var(--color-secondary)" /> {customer.email}
              </div>
            </div>

            <div>
              <span className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                GST Identification Number
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <FileCheck size={16} color="var(--color-secondary)" /> {customer.gstNumber || 'N/A (Not Provided)'}
              </div>
            </div>

            <div>
              <span className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Registered Billing / Delivery Address
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontWeight: 500, lineHeight: 1.4, marginTop: '0.2rem' }}>
                <MapPin size={16} color="var(--color-secondary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                {customer.address}
              </div>
            </div>
          </div>
        </div>

        {/* CRM Follow-up & Sales Notes Card */}
        <div className="card" style={{ backgroundColor: '#FAFBFD' }}>
          <h3
            style={{
              fontSize: '1.05rem',
              color: 'var(--color-primary)',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.6rem',
            }}
          >
            CRM Follow-up & Activity Log
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <span className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Scheduled Next Follow-Up Date
            </span>
            {customer.followUpDate ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-secondary)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  marginTop: '0.4rem',
                }}
              >
                <Calendar size={18} />
                {new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                No active follow-up date scheduled.
              </p>
            )}
          </div>

          <div>
            <span className="text-muted" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CRM Sales & Account History Notes
            </span>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
                lineHeight: 1.5,
                marginTop: '0.4rem',
                minHeight: '100px',
              }}
            >
              {customer.notes || 'No CRM history notes added for this customer yet.'}
            </div>
          </div>
        </div>
      </div>

      {/* Related Sales Challans Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
            Sales Challans History ({customer.challans?.length || 0})
          </h3>
        </div>

        {!customer.challans || customer.challans.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <FileText size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p>No sales challans generated for {customer.customerName} yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan Number</th>
                <th>Total Quantity</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {customer.challans.map((challan) => (
                <tr
                  key={challan.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/challans/${challan.id}`)}
                >
                  <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {challan.challanNumber}
                  </td>
                  <td style={{ fontWeight: 700 }}>{challan.totalQuantity} Units</td>
                  <td>
                    {challan.status === 'CONFIRMED' && <Badge variant="success">Confirmed</Badge>}
                    {challan.status === 'DRAFT' && <Badge variant="warning">Draft</Badge>}
                    {challan.status === 'CANCELLED' && <Badge variant="danger">Cancelled</Badge>}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{challan.user?.name || 'Sales Staff'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(challan.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/challans/${challan.id}`);
                      }}
                    >
                      View Challan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCustomer}
        initialData={customer}
        isLoading={isSaving}
      />
    </div>
  );
};
