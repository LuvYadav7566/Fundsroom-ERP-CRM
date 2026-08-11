import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Customers } from '../pages/Customers';
import { CustomerDetail } from '../pages/CustomerDetail';
import { Products } from '../pages/Products';
import { Inventory } from '../pages/Inventory';
import { Challans } from '../pages/Challans';
import { ChallanCreate } from '../pages/ChallanCreate';
import { ChallanDetail } from '../pages/ChallanDetail';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside AppShell Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/challans" element={<Challans />} />
          <Route
            path="/challans/create"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />
            }
          >
            <Route index element={<ChallanCreate />} />
          </Route>
          <Route path="/challans/:id" element={<ChallanDetail />} />
        </Route>
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
