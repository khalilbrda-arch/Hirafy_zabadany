import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import LoginRegister from './components/LoginRegister'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Profile from './pages/Profile'
import CraftsmanSetup from './pages/CraftsmanSetup'
import RequestDetails from './pages/RequestDetails'
import CraftsmanProfile from './pages/CraftsmanProfile'
import Inbox from './pages/Inbox'
import Explore from './pages/Explore'
import NotificationSetup from './components/NotificationSetup'
import PageTransition from './components/PageTransition'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [viewingCraftsmanId, setViewingCraftsmanId] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        let snap = await getDoc(doc(db, 'profiles', firebaseUser.uid))
        let attempts = 0
        while (!snap.exists() && attempts < 5) {
          await wait(500)
          snap = await getDoc(doc(db, 'profiles', firebaseUser.uid))
          attempts++
        }
        if (snap.exists()) setProfile(snap.data())
      } else {
        setProfile(null)
      }
      setLoadingProfile(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSetupComplete = (updatedProfile) => setProfile((prev) => ({ ...prev, ...updatedProfile }))
  const openRequestDetails = (id) => { setSelectedRequestId(id); setViewingCraftsmanId(null) }
  const closeRequestDetails = () => setSelectedRequestId(null)
  const openCraftsmanProfile = (id) => setViewingCraftsmanId(id)
  const closeCraftsmanProfile = () => setViewingCraftsmanId(null)

  if (loadingProfile) {
    return <div className="min-h-screen bg-primary-bg flex items-center justify-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  }

  if (!user) return <LoginRegister onLoginSuccess={() => {}} />

  if (profile?.accountType === 'craftsman' && (!profile.specializations || profile.specializations.length === 0)) {
    return <CraftsmanSetup onSetupComplete={handleSetupComplete} />
  }

  if (viewingCraftsmanId) {
    return (
      <div className="min-h-screen bg-primary-bg text-dark-text flex flex-col" dir="rtl">
        <NotificationSetup />
        <main className="flex-1 pb-20">
          <PageTransition pageKey={viewingCraftsmanId}>
            <CraftsmanProfile craftsmanId={viewingCraftsmanId} onBack={closeCraftsmanProfile} />
          </PageTransition>
        </main>
        <BottomNav currentPage={currentPage} setCurrentPage={(p) => { setCurrentPage(p); closeCraftsmanProfile() }} />
      </div>
    )
  }

  if (selectedRequestId) {
    return (
      <div className="min-h-screen bg-primary-bg text-dark-text flex flex-col" dir="rtl">
        <NotificationSetup />
        <main className="flex-1 pb-20">
          <PageTransition pageKey={selectedRequestId}>
            <RequestDetails requestId={selectedRequestId} onBack={closeRequestDetails} profile={profile} onOpenCraftsmanProfile={openCraftsmanProfile} />
          </PageTransition>
        </main>
        <BottomNav currentPage={currentPage} setCurrentPage={(p) => { setCurrentPage(p); closeRequestDetails() }} />
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home profile={profile} onOpenRequest={openRequestDetails} onOpenCraftsmanProfile={openCraftsmanProfile} />
      case 'explore':
        return <Explore onOpenRequest={openRequestDetails} onOpenCraftsmanProfile={openCraftsmanProfile} />
      case 'inbox':
        return <Inbox onOpenRequest={openRequestDetails} />
      case 'profile':
        return <Profile onOpenInbox={() => setCurrentPage('inbox')} onOpenCraftsmanProfile={openCraftsmanProfile} />
      default:
        return <Home profile={profile} onOpenRequest={openRequestDetails} onOpenCraftsmanProfile={openCraftsmanProfile} />
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg text-dark-text flex flex-col" dir="rtl">
      <NotificationSetup />
      <main className="flex-1 pb-20">
        <PageTransition pageKey={currentPage}>{renderPage()}</PageTransition>
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default App
