import { useState, useRef } from 'react'

const PullToRefresh = ({ children, onRefresh }) => {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && e.touches[0].clientY - startY.current > 60) {
      setPulling(true)
    }
  }

  const handleTouchEnd = async () => {
    if (pulling && !refreshing) {
      setRefreshing(true)
      if (onRefresh) await onRefresh()
      setTimeout(() => {
        setRefreshing(false)
        setPulling(false)
      }, 600)
    }
    setPulling(false)
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {refreshing && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-warm-gray border-t-copper rounded-full animate-spin"></div>
        </div>
      )}
      {children}
    </div>
  )
}

export default PullToRefresh
