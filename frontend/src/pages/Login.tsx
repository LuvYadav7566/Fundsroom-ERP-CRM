import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { Role } from '../types';

interface LocationState {
  from?: { pathname: string };
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@fundsroom.demo');
  const [password, setPassword] = useState<string>('Fundsroom@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.name}! Authenticated as ${user.role}.`);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoRole = (role: Role) => {
    const roleEmailMap: Record<Role, string> = {
      ADMIN: 'admin@fundsroom.demo',
      SALES: 'sales@fundsroom.demo',
      WAREHOUSE: 'warehouse@fundsroom.demo',
      ACCOUNTS: 'accounts@fundsroom.demo',
    };
    setEmail(roleEmailMap[role]);
    setPassword('Fundsroom@123');
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-primary)',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(21, 101, 192, 0.3) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 168, 232, 0.15) 0%, transparent 40%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(0,168,232,0.3)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.35rem' }}>
            Fundsroom Infotech
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Operations Portal | Mini ERP + CRM
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(220, 38, 38, 0.2)',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Corporate Email Address"
            type="email"
            placeholder="user@fundsroom.demo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            style={{ marginTop: '0.75rem', height: '44px', fontSize: '0.95rem' }}
            isLoading={isSubmitting}
            icon={<ArrowRight size={18} />}
          >
            Sign In to Portal
          </Button>
        </form>

        {/* Demo Quick Shortcuts for Evaluator */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            ⚡ Demo Quick Login Shortcuts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoRole('ADMIN')}
              style={{ justifyContent: 'center' }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoRole('SALES')}
              style={{ justifyContent: 'center' }}
            >
              💼 Sales
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoRole('WAREHOUSE')}
              style={{ justifyContent: 'center' }}
            >
              📦 Warehouse
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDemoRole('ACCOUNTS')}
              style={{ justifyContent: 'center' }}
            >
              📊 Accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
