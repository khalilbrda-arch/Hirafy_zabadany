import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import LoginRegister from './components/LoginRegister'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import MyOrders from './pages/MyOrders'
import Profile from './pages/Profile'
import CraftsmanSetup from './pages/CraftsmanSetup'
import RequestDetails from './pages/RequestDetails'

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedRequestId, setSelectedRequestId] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'profiles', firebaseUser.uid))
        if (snap.exists()) {
          setProfile(snap.data())
        }
      } else {
        setProfile(null)
      }
      setLoadingProfile(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLoginSuccess = async () => {
    if (auth.currentUser) {
      const snap = await getDoc(doc(db, 'profiles', auth.currentUser.uid))
      if (snap.exists()) {
        setProfile(snap.data())
      }
    }
  }

  const handleSetupComplete = (updatedProfile) => {
    setProfile((prev) => ({ ...prev, ...updatedProfile }))
  }

  const openRequestDetails = (requestId) => {
    setSelectedRequestId(requestId)
  }

  const closeRequestDetails = () => {
    setSelectedRequestId(null)
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <p className="text-dark-text/60">جاري التحميل...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />
  }

  if (profile?.accountType === 'craftsman' && (!profile.specializations || profile.specializations.length === 0)) {
    return <CraftsmanSetup onSetupComplete={handleSetupComplete} />
  }

  if (selectedRequestId) {
    return (
      <div className="min-h-screen bg-primary-bg text-dark-text flex flex-col" dir="rtl">
        <main className="flex-1 pb-20">
          <RequestDetails requestId={selectedRequestId} onBack={closeRequestDetails} profile={profile} />
        </main>
        <BottomNav currentPage={currentPage} setCurrentPage={(p) => { setCurrentPage(p); closeRequestDetails() }} />
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home profile={profile} onOpenRequest={openRequestDetails} />
      case 'orders':
        return <MyOrders />
      case 'profile':
        return <Profile />
      default:
        return <Home profile={profile} onOpenRequest={openRequestDetails} />
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
