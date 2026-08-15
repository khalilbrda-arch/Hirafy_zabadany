import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { uploadImage } from '../uploadImage'
import AdminPanel from './AdminPanel'
import PolicyModal from '../components/PolicyModal'
import { privacyText } from '../data/privacyText'
import { termsText } from '../data/termsText'

const Stars = ({ rating }) => {
  const rounded = Math.round(rating || 0)
  return (
    <span className="text-copper text-lg">
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
    </span>
  )
}

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('main')
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)

  const fetchProfile = async () => {
    const snap = await getDoc(doc(db, 'profiles', auth.currentUser.uid))
    if (snap.exists()) {
      setProfile(snap.data())
      setBio(snap.data().bio || '')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const url = await uploadImage(file)
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), { photoURL: url })
      setProfile((prev) => ({ ...prev, photoURL: url }))
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSaveBio = async () => {
    setSavingBio(true)
    try {
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), { bio })
      setProfile((prev) => ({ ...prev, bio }))
      setEditingBio(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingBio(false)
    }
  }

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploadingPortfolio(true)
    try {
      for (const file of files) {
        const url = await uploadImage(file)
        await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
          portfolioImages: arrayUnion(url),
        })
      }
      await fetchProfile()
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingPortfolio(false)
    }
  }

  const handleRemovePortfolioImage = async (url) => {
    try {
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
        portfolioImages: arrayRemove(url),
      })
      setProfile((prev) => ({
        ...prev,
        portfolioImages: (prev.portfolioImages || []).filter((img) => img !== url),
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (view === 'admin') return <AdminPanel onBack={() => setView('main')} />

  if (loading) {
    return <div className="p-6 text-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  }

  const isCraftsman = profile?.accountType === 'craftsman'

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4">حسابي</h2>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        {/* الصورة الشخصية */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-warm-gray overflow-hidden flex items-center justify-center">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-white">{profile?.fullName?.charAt(0) || '؟'}</span>
              )}
            </div>
            <label className="absolute bottom-0 left-0 bg-copper text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-sm">
              📷
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          {uploadingPhoto && <p className="text-xs text-dark-text/60 mt-2">جاري الرفع...</p>}

          <p className="font-medium text-dark-text text-lg mt-3">{profile?.fullName}</p>
          <p className="text-sm text-dark-text/60">{isCraftsman ? 'حرفي' : 'زبون'}</p>

          {isCraftsman && (
            <div className="flex items-center gap-4 mt-2">
              <div className="text-center">
                <Stars rating={profile?.rating} />
                <p className="text-xs text-dark-text/60">{(profile?.rating || 0).toFixed(1)} تقييم</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-copper">{profile?.completedJobs || 0}</p>
                <p className="text-xs text-dark-text/60">عمل منجز</p>
              </div>
            </div>
          )}
        </div>

        {/* التخصصات والمناطق للحرفي */}
        {isCraftsman && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5 justify-center mb-2">
              {profile?.specializations?.map((s) => (
                <span key={s} className="text-xs px-2 py-1 bg-copper/10 text-copper rounded-full">{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {profile?.areas?.map((a) => (
                <span key={a} className="text-xs px-2 py-1 bg-warm-gray/30 text-dark-text rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* النبذة التعريفية */}
        <div className="border-t border-warm-gray pt-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-dark-text">نبذة عني</h3>
            {!editingBio && (
              <button onClick={() => setEditingBio(true)} className="text-copper text-xs underline">تعديل</button>
            )}
          </div>
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="اكتب نبذة بسيطة عن نفسك أو خبرتك..."
                className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="flex-1 bg-copper text-white py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {savingBio ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  onClick={() => { setEditingBio(false); setBio(profile?.bio || '') }}
                  className="flex-1 border border-warm-gray text-dark-text py-2 rounded-xl text-sm font-medium"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-dark-text/70">{profile?.bio || 'لا توجد نبذة بعد'}</p>
          )}
        </div>

        {/* معرض الأعمال المنجزة للحرفي */}
        {isCraftsman && (
          <div className="border-t border-warm-gray pt-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-dark-text">معرض الأعمال</h3>
              <label className="text-copper text-xs underline cursor-pointer">
                إضافة صور
                <input type="file" accept="image/*" multiple onChange={handlePortfolioUpload} className="hidden" />
              </label>
            </div>
            {uploadingPortfolio && <p className="text-xs text-dark-text/60 mb-2">جاري رفع الصور...</p>}
            {(!profile?.portfolioImages || profile.portfolioImages.length === 0) ? (
              <p className="text-sm text-dark-text/60">لا توجد صور أعمال بعد</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {profile.portfolioImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => handleRemovePortfolioImage(url)}
                      className="absolute top-0.5 left-0.5 bg-black/50 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* الروابط */}
        <div className="border-t border-warm-gray pt-2">
          {profile?.isAdmin && (
            <button onClick={() => setView('admin')} className="w-full text-right py-2.5 border-b border-warm-gray text-dark-text">لوحة التحكم الإدارية</button>
          )}
          <button onClick={() => setView('privacy')} className="w-full text-right py-2.5 border-b border-warm-gray text-dark-text">سياسة الخصوصية</button>
          <button onClick={() => setView('terms')} className="w-full text-right py-2.5 border-b border-warm-gray text-dark-text">شروط الاستخدام</button>
          <button onClick={handleLogout} className="w-full text-right py-2.5 text-red-600">تسجيل الخروج</button>
        </div>
      </div>

      {view === 'privacy' && (
        <PolicyModal title="سياسة الخصوصية" content={privacyText} onClose={() => setView('main')} />
      )}
      {view === 'terms' && (
        <PolicyModal title="شروط الاستخدام" content={termsText} onClose={() => setView('main')} />
      )}
    </div>
  )
}

export default Profile
