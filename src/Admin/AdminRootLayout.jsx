// src/admin/AdminRootLayout.jsx
import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { useNavigate } from 'react-router-dom';

const AdminRootLayout = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.15)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600" />
            <span className="font-semibold">ReliefTrace Admin</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/admin" end className={({ isActive }) =>
              `hover:text-blue-700 ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/batches" className={({ isActive }) =>
              `hover:text-blue-700 ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
              Batches
            </NavLink>
            <NavLink to="/admin/distributions" className={({ isActive }) =>
              `hover:text-blue-700 ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
              Distributions
            </NavLink>
          
          </nav>

          {/* Right-side shortcuts */}
          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                  {chain?.name || `Chain ID: ${chainId}`}
                </span>
                <button
                  
                  onClick={() => {
    disconnect();         // disconnect wallet
    navigate('/');        // go back to landing page
  }}
                  className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-100"
                  
                >
                  Disconnect
                </button>
              </div>
            )}

            <Link to="/public" className="px-3 py-2 rounded-lg  hover:bg-gray-100 text-sm bg-[#3563E9] text-white">
              Public Dashboard
            </Link>
            
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="bg-[#F5F5F5] min-h-[calc(100vh-64px)]">
  <div className="max-w-7xl mx-auto p-4">
    <Outlet />
  </div>
</main>

    </div>
  );
};

export default AdminRootLayout;
