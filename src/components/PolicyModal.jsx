const PolicyModal = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-medium text-center mb-4 text-dark-text">{title}</h2>
        <p className="text-sm text-dark-text/80 whitespace-pre-line leading-relaxed mb-4">{content}</p>
        <button
          onClick={onClose}
          className="w-full bg-copper text-white py-2.5 rounded-xl font-medium hover:bg-copper/90 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  )
}

export default PolicyModal
