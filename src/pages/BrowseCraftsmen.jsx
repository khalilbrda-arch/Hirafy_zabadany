import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { specializations } from '../data/specializations'
import { areas } from '../data/areas'

const BrowseCraftsmen = ({ onOpenCraftsmanProfile }) => {
  const [craftsmen, setCraftsmen] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSpec, setFilterSpec] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    const q = query(collection(db, 'profiles'), where('accountType', '==', 'craftsman'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCraftsmen(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  let filtered = craftsmen.filter((c) => {
    if (c.banned) return false
    if (filterSpec && !c.specializations?.includes(filterSpec)) return false
    if (filterArea && !c.areas?.includes(filterArea)) return false
    return true
  })

  filtered = filtered.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'jobs') return (b.completedJobs || 0) - (a.completedJobs || 0)
    return 0
  })

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-1">تصفح الحرفيين</h2>
      <p className="text-sm text-dark-text/60 text-center mb-4">{craftsmen.length} حرفي مسجّل بالمنصة</p>

      <div className="flex gap-2 mb-2">
        <select
          value={filterSpec}
          onChange={(e) => setFilterSpec(e.target.value)}
          className="flex-1 px-3 py-2 border border-warm-gray rounded-xl bg-white text-sm"
        >
          <option value="">كل التخصصات</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="flex-1 px-3 py-2 border border-warm-gray rounded-xl bg-white text-sm"
        >
          <option value="">كل المناطق</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortBy('rating')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            sortBy === 'rating' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'
          }`}
        >
          الأعلى تقييماً
        </button>
        <button
          onClick={() => setSortBy('jobs')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            sortBy === 'jobs' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'
          }`}
        >
          الأكثر خبرة
        </button>
      </div>

      {loading ? (
        <p className="text-dark-text/60 text-center">جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-card-bg rounded-2xl shadow-sm p-6 text-center">
          <p className="text-dark-text/60">لا يوجد حرفيون مطابقون لهذا الفلتر</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
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
                <div className="flex items-center gap-2">
                  <span className="text-copper text-sm">
                    {'★'.repeat(Math.round(c.rating || 0))}{'☆'.repeat(5 - Math.round(c.rating || 0))}
                  </span>
                  <span className="text-dark-text/50 text-xs">({(c.rating || 0).toFixed(1)})</span>
                  <span className="text-dark-text/40 text-xs">· {c.completedJobs || 0} عمل</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {c.specializations?.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 bg-copper/10 text-copper rounded-full">{s}</span>
                  ))}
                  {c.specializations?.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-warm-gray/30 text-dark-text/60 rounded-full">
                      +{c.specializations.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-warm-gray text-lg">←</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowseCraftsmen
