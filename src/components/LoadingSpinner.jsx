const LoadingSpinner = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-warm-gray border-t-copper rounded-full animate-spin mb-3"></div>
      <p className="text-dark-text/60 text-sm">{text}</p>
    </div>
  )
}

export default LoadingSpinner
