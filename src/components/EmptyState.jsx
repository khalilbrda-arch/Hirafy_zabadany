const EmptyState = ({ icon = '📭', title, subtitle }) => {
  return (
    <div className="bg-card-bg rounded-2xl shadow-sm p-8 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-dark-text/70 font-medium">{title}</p>
      {subtitle && <p className="text-dark-text/40 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}

export default EmptyState
