import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';

const Header = () => {
  const { user, logout } = useAuth();
  // NEW: confirm dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  // const handleLogout = () => {
  //   if (window.confirm('Are you sure you want to logout?')) {
  //     logout();
  //   }
  // };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

   // OPEN confirm dialog instead of window.confirm
  const handleLogoutClick = () => setShowConfirm(true);

  const handleConfirmLogout = async () => {
    try {
      setBusy(true);
      await logout(); // AuthContext handles clearing + API call
    } finally {
      setBusy(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* User Avatar */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(user?.username)}`}>
            {getInitial(user?.username)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {user?.username || 'User'}
            </h2>
            <p className="text-sm text-gray-500">Welcome back!</p>
          </div>
        </div>

        {/* Logout Button (icon + text) */}
        <button
          onClick={handleLogoutClick}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-gray-700 bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md transition-all"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={18} className="text-white" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Logout from this device?"
        message="You’ll need to sign in again to access your dashboard."
        confirmText="Logout"
        cancelText="Cancel"
        busy={busy}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default Header;