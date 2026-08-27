import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const homeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const exploreIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const inboxIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const profileIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const tabs = [
  { key: 'home', label: 'الرئيسية', icon: homeIcon },
  { key: 'explore', label: 'تصفح', icon: exploreIcon },
  { key: 'inbox', label: 'الرسائل', icon: inboxIcon },
  { key: 'profile', label: 'حسابي', icon: profileIcon },
]

const useActiveConversationsCount = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!auth.currentUser) return
    const q1 = query(collection(db, 'requests'), where('customerId', '==', auth.currentUser.uid), where('status', '==', 'قيد التنفيذ'))
    const q2 = query(collection(db, 'requests'), where('craftsmanId', '==', auth.currentUser.uid), where('status', '==', 'قيد التنفيذ'))
    let c1 = 0, c2 = 0
    const update = () => setCount(c1 + c2)
    const unsub1 = onSnapshot(q1, (snap) => { c1 = snap.size; update() })
    const unsub2 = onSnapshot(q2, (snap) => { c2 = snap.size; update() })
    return () => { unsub1(); unsub2() }
  }, [])
  return count
}

const BottomNav = ({ currentPage, setCurrentPage }) => {
  const activeCount = useActiveConversationsCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-gray shadow-sm z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setCurrentPage(tab.key)}
              className="relative flex flex-col items-center justify-center px-4 py-1 transition-transform active:scale-90"
            >
              <span className={`relative ${isActive ? 'text-copper' : 'text-warm-gray'}`}>
                {tab.icon}
                {tab.key === 'inbox' && activeCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </span>
              <span className={`text-xs mt-1 ${isActive ? 'text-copper font-medium' : 'text-warm-gray'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
