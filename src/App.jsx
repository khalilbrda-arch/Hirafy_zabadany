import { useState } from 'react'
import LoginRegister from './components/LoginRegister'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import MyOrders from './pages/MyOrders'
import Profile from './pages/Profile'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  if (!isLoggedIn) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />
      case 'orders':
        return <MyOrders />
      case 'profile':
        return <Profile />
      default:
        return <Home />
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg text-dark-text flex flex-col" dir="rtl">
      <main className="flex-1 pb-20">
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default App
