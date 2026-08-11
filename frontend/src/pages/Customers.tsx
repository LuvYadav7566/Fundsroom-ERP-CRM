import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { Customer, PaginationMeta } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Search, Plus, Eye, Edit3, Calendar, Phone, Mail, Building } from 'lucide-react';

export const Customers: React.FC = () => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        search,
        status: statusFilter,
        customerType: typeFilter,
        page,
        limit: 10,
      });
      setCustomers(res.data);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      showError('Failed to load customers list.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, page, showError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAddModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (data: Partial<Customer>) => {
    setIsSaving(true);
    try {
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, data);
        showSuccess(`Customer '${data.customerName}' updated successfully.`);
      } else {
        await customerService.createCustomer(data);
        showSuccess(`Customer '${data.customerName}' created successfully.`);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save customer.';
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer CRM Management</h1>
          <p className="page-description">
            Track business contacts, lead status, customer classification, and follow-ups.
          </p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button variant="primary" icon={<Plus size={18} />} onClick={handleOpenAddModal}>
            Add New Customer
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
            placeholder="Search by customer name, business, mobile, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '150px' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="LEAD">LEAD</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '160px' }}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Customer Types</option>
          <option value="WHOLESALE">WHOLESALE</option>
          <option value="DISTRIBUTOR">DISTRIBUTOR</option>
          <option value="RETAIL">RETAIL</option>
        </select>
      </div>

      {/* Customer Data Table */}
      {isLoading ? (
        <LoadingSkeleton height="50px" count={5} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No Customers Found"
          description="No customer records match your selected search or filter criteria."
          actionText={hasRole('ADMIN', 'SALES') ? 'Add New Customer' : undefined}
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Contact</th>
                <th>Business Name</th>
                <th>Mobile / Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Next Follow-up</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr
                  key={cust.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/customers/${cust.id}`)}
                >
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {cust.customerName}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                      <Building size={14} color="var(--color-text-muted)" />
                      {cust.businessName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={12} color="var(--color-text-muted)" /> {cust.mobile}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                        <Mail size={12} /> {cust.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="neutral">{cust.customerType}</Badge>
                  </td>
                  <td>
                    {cust.status === 'ACTIVE' && <Badge variant="success">Active</Badge>}
                    {cust.status === 'LEAD' && <Badge variant="warning">Lead</Badge>}
                    {cust.status === 'INACTIVE' && <Badge variant="danger">Inactive</Badge>}
                  </td>
                  <td>
                    {cust.followUpDate ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                        <Calendar size={14} />
                        {new Date(cust.followUpDate).toLocaleDateString('en-IN')}
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>Not scheduled</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${cust.id}`);
                        }}
                        title="View CRM Detail"
                      >
                        <Eye size={14} /> View
                      </button>
                      {hasRole('ADMIN', 'SALES') && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={(e) => handleOpenEditModal(cust, e)}
                          title="Edit Customer"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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
                Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Total Customers)
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

      {/* Add / Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCustomer}
        initialData={selectedCustomer}
        isLoading={isSaving}
      />
    </div>
  );
};
