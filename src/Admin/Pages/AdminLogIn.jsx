// src/admin/AdminLogIn.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const ADMIN_ADDRESS = '0x42C31Db2d6B12D5CD81e23d33eab7Abf49188E35';

const AdminLogIn = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState('');

  const isAdmin = useMemo(() => {
    if (!address) return false;
    return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  }, [address]);

  useEffect(() => {
    if (!isConnected) {
      setError('');
      return;
    }
    if (isAdmin) {
      localStorage.setItem('relieftrace_admin_authed', 'true');
      navigate('/admin', { replace: true });
    } else {
      setError('This wallet is not authorized for admin access.');
    }
  }, [isConnected, isAdmin, navigate]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/L1.png')" }} // <-- replace with your path
    >
      {/* overlay */}
      <div className="absolute inset-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl p-6 text-center shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <h1 className="text-2xl font-bold text-[#3563E9]">Admin Login</h1>
        <p className="text-gray-700 mt-2">
          Connect the authorized admin wallet to continue.
        </p>

        <div className="mt-6 flex justify-center">
          <ConnectButton showBalance={false} />
        </div>

        {isConnected && !isAdmin && (
          <div className="mt-6">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => {
                localStorage.removeItem('relieftrace_admin_authed');
                disconnect();
              }}
              className="mt-3 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Disconnect
            </button>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          Allowed wallet: <code>{ADMIN_ADDRESS}</code>
        </div>
      </div>
    </div>
  );
};

export default AdminLogIn;
