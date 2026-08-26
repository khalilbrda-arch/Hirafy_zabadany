const SegmentedTabs = ({ tabs, active, onChange }) => (
  <div className="flex bg-warm-gray/20 rounded-xl p-1 mb-4">
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
          active === t.key ? 'bg-white text-copper shadow-sm' : 'text-dark-text/60'
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
)

export default SegmentedTabs
