import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const CraftsmanProfile = ({ craftsmanId, onBack }) => {
  const [profile, setProfile] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, 'profiles', craftsmanId))
      if (snap.exists()) setProfile(snap.data())
      setLoading(false)
    }
    fetchProfile()
  }, [craftsmanId])

  useEffect(() => {
    const q = query(collection(db, 'ratings'), where('ratedUserId', '==', craftsmanId))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRatings(snapshot.docs.map((d) => d.data()))
    })
    return () => unsubscribe()
  }, [craftsmanId])

  if (loading) {
    return <div className="p-6 text-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  }

  if (!profile) {
    return <div className="p-6 text-center"><p className="text-dark-text/70">لم يتم العثور على الملف</p></div>
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-medium text-center mb-1">{profile.fullName}</h2>
        <p className="text-center text-copper mb-3">
          {'★'.repeat(Math.round(profile.rating || 0))}{'☆'.repeat(5 - Math.round(profile.rating || 0))}
          <span className="text-dark-text/60 text-sm mr-2">({(profile.rating || 0).toFixed(1)})</span>
        </p>
        <p className="text-center text-sm text-dark-text/60 mb-4">{profile.completedJobs || 0} عمل منجز</p>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-dark-text mb-2">التخصصات</h3>
          <div className="flex flex-wrap gap-2">
            {profile.specializations?.map((s) => (
              <span key={s} className="text-xs px-2 py-1 bg-copper/10 text-copper rounded-full">{s}</span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-dark-text mb-2">مناطق العمل</h3>
          <div className="flex flex-wrap gap-2">
            {profile.areas?.map((a) => (
              <span key={a} className="text-xs px-2 py-1 bg-warm-gray/30 text-dark-text rounded-full">{a}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-warm-gray pt-4">
          <h3 className="text-sm font-medium text-dark-text mb-2">آخر التقييمات</h3>
          {ratings.length === 0 ? (
            <p className="text-sm text-dark-text/60">لا توجد تقييمات بعد</p>
          ) : (
            <div className="space-y-2">
              {ratings.map((r, i) => (
                <div key={i} className="bg-white border border-warm-gray rounded-xl p-3">
                  <span className="text-copper">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                  {r.note && <p className="text-sm text-dark-text/70 mt-1">{r.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CraftsmanProfile
