const ConfirmDialog = ({ title, message, confirmLabel = 'تأكيد', danger = false, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 w-full max-w-sm">
        <h2 className="text-lg font-medium text-center mb-2 text-dark-text">{title}</h2>
        <p className="text-sm text-dark-text/70 text-center mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-warm-gray text-dark-text py-2.5 rounded-xl font-medium"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-medium text-white ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-copper hover:bg-copper/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
