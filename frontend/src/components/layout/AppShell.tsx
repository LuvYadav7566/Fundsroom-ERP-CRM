import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="app-body">
        <Sidebar isOpen={isMobileSidebarOpen} onCloseMobile={closeMobileSidebar} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
