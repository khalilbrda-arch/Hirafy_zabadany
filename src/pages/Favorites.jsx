import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const Favorites = ({ onOpenCraftsmanProfile }) => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      const profileSnap = await getDoc(doc(db, 'profiles', auth.currentUser.uid))
      const favIds = profileSnap.exists() ? (profileSnap.data().favorites || []) : []

      const profiles = []
      for (const id of favIds) {
        const snap = await getDoc(doc(db, 'profiles', id))
        if (snap.exists()) profiles.push({ id, ...snap.data() })
      }
      setFavorites(profiles)
      setLoading(false)
    }
    fetchFavorites()
  }, [])

  if (loading) {
    return <div className="p-6 text-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4">المفضلة</h2>

      {favorites.length === 0 ? (
        <div className="bg-card-bg rounded-2xl shadow-sm p-6 text-center">
          <p className="text-dark-text/60">لم تضف أي حرفي للمفضلة بعد</p>
          <p className="text-dark-text/40 text-xs mt-1">اضغط ⭐ بجانب أي حرفي بصفحة "تصفح" لإضافته هنا</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((c) => (
            <div
              key={c.id}
              onClick={() => onOpenCraftsmanProfile(c.id)}
              className="bg-card-bg rounded-2xl shadow-sm p-4 flex items-center gap-3 cursor-pointer active:opacity-80"
            >
              <div className="w-14 h-14 rounded-full bg-warm-gray overflow-hidden flex items-center justify-center flex-shrink-0">
                {c.photoURL ? (
                  <img src={c.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-white">{c.fullName?.charAt(0) || '؟'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-text truncate">{c.fullName}</p>
                <span className="text-copper text-sm">
                  {'★'.repeat(Math.round(c.rating || 0))}{'☆'.repeat(5 - Math.round(c.rating || 0))}
                </span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.specializations?.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-copper/10 text-copper rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
