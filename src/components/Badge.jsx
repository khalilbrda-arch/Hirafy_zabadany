const variants = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-500 border-gray-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
}

const Badge = ({ text, variant = 'neutral' }) => (
  <span className={`text-xs px-2 py-1 rounded-full border ${variants[variant] || variants.neutral}`}>
    {text}
  </span>
)

export default Badge
