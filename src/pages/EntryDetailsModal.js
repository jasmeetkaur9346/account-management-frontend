import React, { useEffect, useState } from 'react';
import { X, Trash2, Save, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import SummaryApi from '../common/index';
import ConfirmDialog from '../components/ConfirmDialog';

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
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data; // { success, data, message }
};

const EntryDetailsModal = ({ entryId, accountName, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    type: 'given',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // fetch entry details
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const url = `${SummaryApi.getEntryById.url}/${entryId}`;
        const res = await withAuthFetch(url, { method: SummaryApi.getEntryById.method });
        if (res?.success && res?.data) {
          const e = res.data;
          setForm({
            type: e.type || 'given',
            amount: e.amount ?? '',
            date: e.date ? new Date(e.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            reason: e.reason || ''
          });
        } else {
          setError(res?.message || 'Failed to load entry');
        }
      } catch (err) {
        setError(err.message || 'Failed to load entry');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entryId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'amount' ? value.replace(/[^\d.]/g,'') : value }));
    if (error) setError('');
  };

  const handleSave = async () => {
    if (!form.amount || isNaN(Number(form.amount))) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      setSaving(true);
      const url = `${SummaryApi.updateEntry.url}/${entryId}`;
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        reason: form.reason
      };
      const res = await withAuthFetch(url, {
        method: SummaryApi.updateEntry.method, // "post"
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res?.success) {
        onSuccess?.('updated'); // parent will refresh list + balance
        onClose();
      } else {
        setError(res?.message || 'Failed to update entry');
      }
    } catch (err) {
      setError(err.message || 'Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
    };

const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      const url = `${SummaryApi.deleteEntry.url}/${entryId}`;
      const res = await withAuthFetch(url, {
        method: SummaryApi.deleteEntry.method, // "delete"
      });
      if (res?.success) {
        onSuccess?.('deleted'); // parent refresh
        onClose();
      } else {
        setError(res?.message || 'Failed to delete entry');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete entry');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const isGiven = form.type === 'given';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {accountName ? `${accountName} — Entry` : 'Entry'}
            </h3>
            <p className="text-xs text-gray-500">Edit or delete this entry</p>
          </div>
          <div className="flex items-center gap-2">
            <button
             onClick={handleDeleteClick}
              disabled={loading || deleting}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50"
              title="Delete entry"
              aria-label="Delete entry"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={(e)=>{e.preventDefault(); handleSave();}}>
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((p)=>({ ...p, type: 'given' }))}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition
                      ${isGiven ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Given
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p)=>({ ...p, type: 'receive' }))}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition
                      ${!isGiven ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    Received
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    name="amount"
                    value={form.amount}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={onChange}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason / Note</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="reason"
                    value={form.reason}
                    onChange={onChange}
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional details"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {showConfirm && (
  <ConfirmDialog
    open={showConfirm}
    title="Delete this entry?"
    message="This will permanently remove the entry from this account. You won't be able to undo this."
    confirmText="Delete"
    cancelText="Cancel"
    busy={deleting}
    onConfirm={handleConfirmDelete}
    onCancel={() => setShowConfirm(false)}
  />
)}

      </div>
    </div>
  );
};

export default EntryDetailsModal;