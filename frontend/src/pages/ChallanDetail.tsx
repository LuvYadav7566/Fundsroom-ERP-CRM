import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanService } from '../services/challanService';
import { Challan } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dialog actions
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  const fetchChallan = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await challanService.getChallanById(id);
      setChallan(data);
    } catch (err) {
      showError('Failed to load sales challan document.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirmChallan = async () => {
    if (!id) return;
    setIsConfirming(true);
    try {
      const updated = await challanService.confirmChallan(id);
      showSuccess(`Challan '${updated.challanNumber}' confirmed! Inventory deducted.`);
      setIsConfirmModalOpen(false);
      fetchChallan();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Confirmation failed.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const updated = await challanService.cancelChallan(id);
      showSuccess(`Challan '${updated.challanNumber}' cancelled.`);
      setIsCancelModalOpen(false);
      fetchChallan();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !challan) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate('/challans')} icon={<ArrowLeft size={16} />}>
          Back to Challans
        </Button>
        <div style={{ marginTop: '1.5rem' }}>
          <LoadingSkeleton height="200px" count={2} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Header Controls (Hidden during print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Button variant="outline" size="sm" onClick={() => navigate('/challans')} icon={<ArrowLeft size={16} />}>
          Back to Sales Challans
        </Button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={<Printer size={16} />} onClick={handlePrint}>
            Print / Save Document
          </Button>

          {hasRole('ADMIN', 'SALES') && challan.status === 'DRAFT' && (
            <>
              <Button variant="secondary" icon={<CheckCircle2 size={16} />} onClick={() => setIsConfirmModalOpen(true)}>
                Confirm Challan & Deduct Stock
              </Button>
              <Button variant="danger" icon={<XCircle size={16} />} onClick={() => setIsCancelModalOpen(true)}>
                Cancel Challan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Official Business Document Wrapper */}
      <div
        className="card challan-document-printable"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2.5rem 3rem',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--color-primary)',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                FR
              </div>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--color-primary)' }}>
                Fundsroom Infotech Pvt. Ltd.
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Enterprise Wholesale & Distribution Operations Division
              <br />
              Bhiwandi Logistics Hub, Plot 42, MIDC, Mumbai, Maharashtra - 400093
              <br />
              GSTIN: 27AAACF9988P1Z0 | Contact: +91 22 6800 1122 | ops@fundsroom.com
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-secondary)',
                letterSpacing: '0.04em',
                marginBottom: '0.25rem',
              }}
            >
              OFFICIAL SALES CHALLAN
            </h1>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {challan.challanNumber}
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              {challan.status === 'CONFIRMED' && <Badge variant="success">CONFIRMED</Badge>}
              {challan.status === 'DRAFT' && <Badge variant="warning">DRAFT (PENDING)</Badge>}
              {challan.status === 'CANCELLED' && <Badge variant="danger">CANCELLED</Badge>}
            </div>
          </div>
        </div>

        {/* Customer & Order Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
            padding: '1.25rem',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Customer Info */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              CUSTOMER BILL TO / DELIVER TO
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
              {challan.customer?.businessName}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>Attn: <strong>{challan.customer?.customerName}</strong> ({challan.customer?.customerType})</div>
              <div>Phone: {challan.customer?.mobile}</div>
              <div>Email: {challan.customer?.email}</div>
              <div>GSTIN: {challan.customer?.gstNumber || 'N/A'}</div>
              <div style={{ marginTop: '0.2rem', lineHeight: 1.3 }}>
                Address: {challan.customer?.address}
              </div>
            </div>
          </div>

          {/* Challan Details */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              DOCUMENT METADATA
            </div>
            <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                Challan Date: <strong>{new Date(challan.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
              <div>
                Generated By: <strong>{challan.user?.name || 'Sales Staff'}</strong>
              </div>
              <div>
                Total Line Items: <strong>{challan.items.length} Products</strong>
              </div>
              <div>
                Total Units Quantity: <strong>{challan.totalQuantity} Units</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Snapshot Items Table */}
        <div style={{ marginBottom: '2rem' }}>
          <table className="data-table" style={{ border: '1px solid var(--color-border)' }}>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '45%' }}>Product Description (Snapshot)</th>
                <th style={{ width: '15%' }}>SKU Snapshot</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Quantity</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Unit Price (₹)</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {item.productNameSnapshot}
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem', backgroundColor: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {item.skuSnapshot}
                    </code>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    ₹{item.unitPriceSnapshot.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Terms Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '2px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ maxWidth: '400px', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            <p><strong>Terms & Conditions:</strong></p>
            <p>1. Goods once delivered as per sales challan snapshot cannot be returned without prior written authorization.</p>
            <p>2. Subject to Mumbai Jurisdiction.</p>
          </div>

          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem' }}>
              <span>Total Quantity:</span>
              <strong>{challan.totalQuantity} Units</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.65rem 0',
                borderTop: '1px solid var(--color-border)',
                borderBottom: '2px solid var(--color-primary)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginTop: '0.35rem',
              }}
            >
              <span>Challan Total Value:</span>
              <span>₹{(challan.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Signatures Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px dashed #94A3B8', marginBottom: '0.35rem' }}></div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Customer Received Signature</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', borderBottom: '1px dashed #94A3B8', marginBottom: '0.35rem' }}></div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>For Fundsroom Infotech Pvt. Ltd.</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmChallan}
        title="Confirm Sales Challan & Deduct Stock?"
        message={`Confirming challan '${challan.challanNumber}' will execute a database transaction to validate product stock availability, deduct ${challan.totalQuantity} units from inventory, and generate outward stock movement logs.`}
        confirmText="Confirm & Deduct Inventory"
        isLoading={isConfirming}
      />

      {/* Cancel Modal */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelChallan}
        title="Cancel Sales Challan?"
        message={`Are you sure you want to mark '${challan.challanNumber}' as CANCELLED?`}
        confirmText="Yes, Cancel Challan"
        isDanger
        isLoading={isCancelling}
      />
    </div>
  );
};
