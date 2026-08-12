import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, LogOut, Shield } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="brand-container">
        <button className="mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle Navigation Menu">
          <Menu size={22} />
        </button>
        <div className="brand-logo">FR</div>
        <div>
          <div className="brand-title">Fundsroom Infotech</div>
          <div className="brand-subtitle">Business Operations ERP + CRM</div>
        </div>
      </div>

      {user && (
        <div className="header-user-profile">
          <div className="system-status-pill">
            <div className="status-dot-active"></div>
            <span>Cloud System Active</span>
          </div>

          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role-badge">
              <Shield size={10} style={{ display: 'inline', marginRight: '3px' }} />
              {user.role}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-outline"
            style={{
              color: '#F8FAFC',
              borderColor: 'rgba(255,255,255,0.2)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
            <span style={{ marginLeft: '0.35rem' }}>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
