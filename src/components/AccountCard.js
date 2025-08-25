import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountCard = ({ account }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/account/${account._id}`);
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'A');

  const getAvatarColor = (name) => {
    const colors = [
      'bg-pink-500','bg-cyan-500','bg-purple-500','bg-orange-500',
      'bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatAmount = (amount) => {
    const n = Number(amount || 0);
    const abs = Math.abs(n).toLocaleString('en-IN');
    return `₹${abs}`;
  };

  const getAmountColor = (amount) => {
    const n = Number(amount || 0);
    if (n > 0) return 'text-green-600'; // Advance
    if (n < 0) return 'text-red-600';   // Due
    return 'text-gray-600';              // Clear
  };

  const getStatusText = (amount) => {
    const n = Number(amount || 0);
    if (n > 0) return 'Advance';
    if (n < 0) return 'Due';
    return 'Clear';
  };

  const isSameDay = (a, b) => {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  };

  const formatDateLabel = (dateLike) => {
    if (!dateLike) return '';
    const d = new Date(dateLike);
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);

    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yest)) return 'Yesterday';
    return `on ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  // 👉 This decides the subtitle line under account name
  const formatMetaLine = () => {
    const last = account?.lastEntry; // { amount, type, date }
    if (last && (last.amount !== undefined && last.amount !== null)) {
      const when = formatDateLabel(last.date || last.createdAt);
      return `${formatAmount(last.amount)} Payment Added ${when}`;
    }
    // No entries yet → show account creation date
    if (account?.createdAt) {
      const created = new Date(account.createdAt);
      return `Added on ${created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    return 'Added recently';
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        {/* Left - avatar + info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${getAvatarColor(account.accountName)}`}>
            {getInitial(account.accountName)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {account.accountName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-sm text-gray-500 truncate">
                {formatMetaLine()}
              </p>
            </div>
          </div>
        </div>

        {/* Right - balance */}
        <div className="text-right ml-4">
          <p className={`text-xl font-bold ${getAmountColor(account.balance)}`}>
            {formatAmount(account.balance)}
          </p>
          <p className="text-sm text-gray-500">
            {getStatusText(account.balance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;