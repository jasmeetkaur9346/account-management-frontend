import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
}) => {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 id="confirm-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p id="confirm-desc" className="text-sm text-gray-600 mt-1">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
            autoFocus
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy && <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>

      {/* Tiny animations */}
      <style>{`
        .animate-fade-in { animation: fade-in .15s ease-out both; }
        .animate-scale-in { animation: scale-in .15s ease-out both; }
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scale-in { from { opacity: 0; transform: scale(.98) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
