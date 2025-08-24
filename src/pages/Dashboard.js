import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SummaryApi from '../common/index'; // ✅ default export (no named { accountAPI })
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FloatingButton from '../components/FloatingButton';
import AccountCard from '../components/AccountCard';
import AddAccountModal from '../components/AddAccountModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  // --- helpers ---
  const getToken = () => localStorage.getItem('authToken');

  const withAuthFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = data?.message || 'Request failed';
      throw new Error(msg);
    }
    return data; // expect { success, data, message }
  };

  // --- API wrappers using your SummaryApi definitions ---
  const getAccounts = async () => {
    return withAuthFetch(SummaryApi.getAllAccounts.url, {
      method: SummaryApi.getAllAccounts.method,
    });
  };

  const createAccount = async (payload) => {
    return withAuthFetch(SummaryApi.createAccount.url, {
      method: SummaryApi.createAccount.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAccounts(accounts);
    } else {
      const q = searchTerm.toLowerCase();
      const filtered = accounts.filter((a) =>
        (a.accountName || '').toLowerCase().includes(q) ||
        (a.phoneNumber || '').includes(searchTerm)
      );
      setFilteredAccounts(filtered);
    }
  }, [accounts, searchTerm]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await getAccounts();
      if (response?.success) {
        // backend likely returns { data: [...] }
        setAccounts(response.data || []);
        setError('');
      } else {
        setError(response?.message || 'Failed to fetch accounts');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = (account) => {
    // TODO: navigate(`/account/${account._id}`)
    console.log('Account clicked:', account);
  };

  const handleAddAccount = async (accountData) => {
    try {
      const response = await createAccount(accountData);
      if (response?.success) {
        const created = response.data;
        setAccounts((prev) => (created ? [created, ...prev] : prev));
        setShowAddModal(false);
        return { success: true };
      }
      return { success: false, message: response?.message || 'Failed to create account' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to create account' };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Accounts List */}
      <div className="pb-24">
        {filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500 text-center mb-6 max-w-sm">
              {searchTerm ? 'No accounts match your search' : 'Get started by adding your first account'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add 
              </button>
            )}
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <AccountCard
              key={account._id}
              account={account}
              onClick={handleAccountClick}
            />
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <FloatingButton onClick={() => setShowAddModal(true)} />

      {/* Add Account Modal */}
      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAccount}
        />
      )}
    </div>
  );
};

export default Dashboard;
