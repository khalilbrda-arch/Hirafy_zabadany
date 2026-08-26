const RequestButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-copper text-white text-lg font-medium py-4 rounded-2xl shadow-sm hover:bg-copper/90 transition-colors mb-6 flex items-center justify-center gap-2"
  >
    <span className="text-xl">+</span> اطلب خدمة الآن
  </button>
)

export default RequestButton
