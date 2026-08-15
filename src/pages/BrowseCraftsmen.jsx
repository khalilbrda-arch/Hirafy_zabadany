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

  useEffect(() => {
    const q = query(collection(db, 'profiles'), where('accountType', '==', 'craftsman'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCraftsmen(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filtered = craftsmen.filter((c) => {
    if (c.banned) return false
    if (filterSpec && !c.specializations?.includes(filterSpec)) return false
    if (filterArea && !c.areas?.includes(filterArea)) return false
    return true
  })

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4">تصفح الحرفيين</h2>

      <div className="flex gap-2 mb-4">
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

      {loading ? (
        <p className="text-dark-text/60 text-center">جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-dark-text/60 text-center mt-6">لا يوجد حرفيون مطابقون</p>
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
              <div className="flex-1">
                <p className="font-medium text-dark-text">{c.fullName}</p>
                <p className="text-copper text-sm">
                  {'★'.repeat(Math.round(c.rating || 0))}{'☆'.repeat(5 - Math.round(c.rating || 0))}
                  <span className="text-dark-text/50 text-xs mr-1">({(c.rating || 0).toFixed(1)})</span>
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
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

export default BrowseCraftsmen
