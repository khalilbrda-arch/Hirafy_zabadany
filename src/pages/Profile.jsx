import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import AdminPanel from './AdminPanel'
import PrivacyPolicy from './PrivacyPolicy'
import TermsOfService from './TermsOfService'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [view, setView] = useState('main')

  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'profiles', auth.currentUser.uid))
      if (snap.exists()) setProfile(snap.data())
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (view === 'admin') return <AdminPanel onBack={() => setView('main')} />
  if (view === 'privacy') return <PrivacyPolicy onBack={() => setView('main')} />
  if (view === 'terms') return <TermsOfService onBack={() => setView('main')} />

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4">حسابي</h2>
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 space-y-3">
        {profile && (
          <div className="text-center mb-4">
            <p className="font-medium text-dark-text">{profile.fullName}</p>
            <p className="text-sm text-dark-text/60">{profile.accountType === 'craftsman' ? 'حرفي' : 'زبون'}</p>
          </div>
        )}

        {profile?.isAdmin && (
          <button onClick={() => setView('admin')} className="w-full text-right py-2.5 border-b border-warm-gray text-dark-text">لوحة التحكم الإدارية</button>
        )}
        <button onClick={() => setView('privacy')} className="w-full text-right py-2.5 border-b border-warm-gray text-dark-text">سياسة الخصوصية</button>
        <button onClick={() => setView('terms')} className="w-full text-right py-2.5 border-b border-warm-gray text-dark-text">شروط الاستخدام</button>
        <button onClick={handleLogout} className="w-full text-right py-2.5 text-red-600">تسجيل الخروج</button>
      </div>
    </div>
  )
}

export default Profile
