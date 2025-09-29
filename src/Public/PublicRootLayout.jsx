// src/public/PublicRootLayout.jsx
import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

const PublicRootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Public Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600" />
            <span className="font-semibold">ReliefTrace</span>
          </Link>

         

          
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicRootLayout;
