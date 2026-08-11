import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Role } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
  {
    label: 'Customers CRM',
    path: '/customers',
    icon: <Users size={18} />,
    roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'],
  },
  {
    label: 'Products Catalog',
    path: '/products',
    icon: <Package size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
  {
    label: 'Inventory & Stock',
    path: '/inventory',
    icon: <Boxes size={18} />,
    roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS', 'SALES'],
  },
  {
    label: 'Sales Challans',
    path: '/challans',
    icon: <FileText size={18} />,
    roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout, hasRole } = useAuth();

  const allowedNavItems = navItems.filter((item) =>
    hasRole(...item.roles)
  );

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="nav-group">
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            padding: '0.5rem 1rem',
            letterSpacing: '0.05em',
          }}
        >
          Main Menu
        </div>
        {allowedNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-link-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            padding: '0 1rem 0.75rem',
            lineHeight: 1.4,
          }}
        >
          Logged as <strong>{user?.name}</strong>
          <br />
          <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{user?.role} Role</span>
        </div>
        <button onClick={logout} className="btn-logout">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
