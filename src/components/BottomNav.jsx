const homeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ordersIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const emptyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const profileIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const tabs = [
  { key: 'home', label: 'الرئيسية', icon: homeIcon },
  { key: 'orders', label: 'طلباتي', icon: ordersIcon },
  { key: 'empty1', label: '', icon: emptyIcon },
  { key: 'empty2', label: '', icon: emptyIcon },
  { key: 'profile', label: 'حسابي', icon: profileIcon },
]

const BottomNav = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-gray shadow-sm z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.key
          const isDisabled = tab.key.startsWith('empty')
          return (
            <button
              key={tab.key}
              onClick={() => !isDisabled && setCurrentPage(tab.key)}
              disabled={isDisabled}
              className={`flex flex-col items-center justify-center px-2 py-1 transition-colors ${
                isDisabled ? 'opacity-40 cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className={`${isActive ? 'text-copper' : 'text-warm-gray'}`}>
                {tab.icon}
              </span>
              {tab.label && (
                <span className={`text-xs mt-1 ${isActive ? 'text-copper font-medium' : 'text-warm-gray'}`}>
                  {tab.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
