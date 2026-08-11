import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Badge } from '../components/common/Badge';
import {
  Users,
  Package,
  Boxes,
  AlertTriangle,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading || !stats) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Loading Fundsroom Infotech operational metrics...</p>
          </div>
        </div>
        <LoadingSkeleton height="100px" count={3} />
      </div>
    );
  }

  const { metrics, visualizations, recentActivity, roleFocusNotice } = stats;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Dashboard</h1>
          <p className="page-description">
            Welcome back, <strong>{user?.name}</strong>. Here is your real-time operations breakdown.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/challans/create')}>
            + New Challan
          </button>
        </div>
      </div>

      {/* Role Focus Notice Banner */}
      {roleFocusNotice && (
        <div
          style={{
            backgroundColor: 'var(--color-accent-light)',
            borderLeft: '4px solid var(--color-accent)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-primary)',
            fontSize: '0.92rem',
            fontWeight: 500,
          }}
        >
          <Info size={20} color="var(--color-secondary)" />
          <span>{roleFocusNotice}</span>
        </div>
      )}

      {/* Top Metrics Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              TOTAL CUSTOMERS
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {metrics.totalCustomers}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F0FDFA',
              color: '#0D9488',
            }}
          >
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              TOTAL PRODUCTS
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {metrics.totalProducts}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#F0FDF4',
              color: '#16A34A',
            }}
          >
            <Boxes size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              TOTAL STOCK UNITS
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {metrics.totalStockUnits.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: metrics.lowStockProductsCount > 0 ? 'var(--color-warning-bg)' : '#F8FAFC',
              color: metrics.lowStockProductsCount > 0 ? 'var(--color-warning-text)' : 'var(--color-text-muted)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              LOW STOCK ITEMS
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: metrics.lowStockProductsCount > 0 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
              {metrics.lowStockProductsCount}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              CONFIRMED REVENUE
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              ₹{metrics.totalRevenueConfirmed.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Inventory Stock by Category Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
            Inventory Stock by Product Category
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visualizations.inventoryCategoryBreakdown}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val: any) => [`${val} Units`, 'Stock Quantity']} />
                <Bar dataKey="stock" fill="#1565C0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Challan Status Distribution Pie Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
            Sales Challans Status Distribution
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visualizations.challanStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {visualizations.challanStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Sales Challans */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>Recent Sales Challans</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/challans')}
              style={{ fontSize: '0.78rem' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.recentChallans.map((challan) => (
                <tr
                  key={challan.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/challans/${challan.id}`)}
                >
                  <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {challan.challanNumber}
                  </td>
                  <td>
                    {challan.customer?.businessName || challan.customer?.customerName}
                  </td>
                  <td>
                    {challan.status === 'CONFIRMED' && <Badge variant="success">Confirmed</Badge>}
                    {challan.status === 'DRAFT' && <Badge variant="warning">Draft</Badge>}
                    {challan.status === 'CANCELLED' && <Badge variant="danger">Cancelled</Badge>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {new Date(challan.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Stock Movements Stream */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>Stock Movement Logs</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate('/inventory')}
              style={{ fontSize: '0.78rem' }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Type</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.recentStockMovements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>
                    {m.product?.productName}
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      SKU: {m.product?.sku}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{m.quantity}</td>
                  <td>
                    {m.movementType === 'IN' ? (
                      <Badge variant="success">IN</Badge>
                    ) : (
                      <Badge variant="danger">OUT</Badge>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {m.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
