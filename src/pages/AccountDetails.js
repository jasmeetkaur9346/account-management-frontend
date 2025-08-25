import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
} from "lucide-react";
import SummaryApi from "../common/index";
import Header from "../components/Header";
import AddEntryModal from "../components/AddEntryModal";
import EntryCard from "../components/EntryCard";
import EntryDetailsModal from "../pages/EntryDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDialog from "../components/ConfirmDialog";

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState("given"); // 'given' or 'receive'
  const [error, setError] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // --- helpers (same pattern you use in Dashboard) ---
  const getToken = () => localStorage.getItem("authToken");
  const withAuthFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data; // { success, data, message }
  };

  useEffect(() => {
    fetchAccountDetails();
    fetchEntries();
  }, [accountId]);

  // --- fetch account details (GET /api/get-single-account/:accountId) ---
  const fetchAccountDetails = async () => {
    try {
      const url = `${SummaryApi.getAccountById.url}/${accountId}`;
      const response = await withAuthFetch(url, {
        method: SummaryApi.getAccountById.method,
      });
      if (response?.success) setAccount(response.data);
      else setError(response?.message || "Failed to fetch account details");
    } catch {
      setError("Failed to fetch account details");
    }
  };

  // --- fetch entries list (GET /api/get-entry-by-accounts/:accountId) ---
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const url = `${SummaryApi.getEntriesByAccount.url}/${accountId}`;
      const response = await withAuthFetch(url, {
        method: SummaryApi.getEntriesByAccount.method,
      });
      if (response?.success) {
        const sorted = (response.data || []).sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date) ||
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        setEntries(sorted);
      } else {
        setError(response?.message || "Failed to fetch entries");
      }
    } catch {
      setError("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

  // --- create entry (POST /api/create-entry) ---
  const handleAddEntry = async (entryData) => {
    try {
      const payload = { ...entryData, accountId }; // merge required accountId
      const response = await withAuthFetch(SummaryApi.createEntry.url, {
        method: SummaryApi.createEntry.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response?.success) {
        await fetchEntries(); // refresh list
        await fetchAccountDetails(); // refresh balance
        setShowAddModal(false);
        return { success: true };
      }
      return {
        success: false,
        message: response?.message || "Failed to add entry",
      };
    } catch (err) {
      return { success: false, message: err.message || "Failed to add entry" };
    }
  };

  // Open confirm dialog
  const openDeleteAccount = () => setShowDeleteConfirm(true);
  const closeDeleteAccount = () => setShowDeleteConfirm(false);

  // Call DELETE /api/delete-account/:accountId
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      const url = `${SummaryApi.deleteAccount.url}/${accountId}`;
      const res = await withAuthFetch(url, {
        method: SummaryApi.deleteAccount.method,
      });
      if (res?.success) {
        // After soft-delete, go back to Home/Dashboard
        navigate("/");
      } else {
        setError(res?.message || "Failed to delete account");
      }
    } catch (err) {
      setError(err.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
      closeDeleteAccount();
    }
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const openEntry = (entryId) => {
    setSelectedEntryId(entryId);
    setShowEntryModal(true);
  };

  const closeEntry = () => {
    setShowEntryModal(false);
    setSelectedEntryId(null);
  };

  // Called when modal saved/deleted
  const onEntryChanged = async () => {
    await fetchEntries();
    await fetchAccountDetails(); // refresh balance too
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-pink-500",
      "bg-cyan-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatAmount = (amount) => {
    if (amount === 0) return "₹0";
    return amount > 0
      ? `₹${amount.toLocaleString("en-IN")}`
      : `₹${Math.abs(amount).toLocaleString("en-IN")}`;
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getBalanceStatus = (balance) => {
    if (balance > 0) return "Advance";
    if (balance < 0) return "Due";
    return "Clear";
  };

  if (loading && !account) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Account Details
          </h1>
        </div>
      </div>

      {/* Account Summary Card */}
      {account && (
        <div className="bg-white mx-4 mt-4 p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl ${getAvatarColor(
                  account.accountName
                )}`}
              >
                {getInitial(account.accountName)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {account.accountName}
                </h2>
                {account.phoneNumber && (
                  <p className="text-gray-500">{account.phoneNumber}</p>
                )}
              </div>
            </div>
            <button
              onClick={openDeleteAccount}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
              title="Delete account"
              aria-label="Delete account"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          <div className="text-center py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Current Balance</p>
            <p
              className={`text-3xl font-bold ${getBalanceColor(
                account.balance || 0
              )}`}
            >
              {formatAmount(account.balance || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {getBalanceStatus(account.balance || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Given/Receive Buttons */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-4">
        <button
          onClick={() => openAddModal("given")}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <TrendingUp size={20} />
          <span>Given</span>
        </button>
        <button
          onClick={() => openAddModal("receive")}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <TrendingDown size={20} />
          <span>Receive</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Entries List */}
      <div className="mx-4 mt-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar size={18} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar size={48} className="mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Transactions Yet
            </h4>
            <p className="text-gray-500 mb-4">
              Start by adding your first transaction
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => openAddModal("given")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Add Given
              </button>
              <button
                onClick={() => openAddModal("receive")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Add Receive
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onClick={() => openEntry(entry._id)}
              />
            ))}

            {showEntryModal && selectedEntryId && (
              <EntryDetailsModal
                entryId={selectedEntryId}
                accountName={account?.accountName}
                onClose={closeEntry}
                onSuccess={onEntryChanged}
              />
            )}
          </div>
        )}
      </div>

<ConfirmDialog
  open={showDeleteConfirm}
  title="Delete this account?"
  message="This will remove the account from your list (soft delete). You can no longer add or view entries for it."
  confirmText="Delete"
  cancelText="Cancel"
  busy={deletingAccount}
  onConfirm={handleDeleteAccount}
  onCancel={closeDeleteAccount}
/>

      {/* Add Entry Modal */}
      {showAddModal && (
        <AddEntryModal
          type={modalType}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEntry}
          accountName={account?.accountName}
        />
      )}
    </div>
  );
};

export default AccountDetails;
