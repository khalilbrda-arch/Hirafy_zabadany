import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { specializations } from '../data/specializations'
import { areas } from '../data/areas'
import { SkeletonList } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const AllRequests = ({ onOpenRequest }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSpec, setFilterSpec] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'requests'), where('status', '==', 'منشور'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filtered = requests.filter((r) => {
    if (filterSpec && r.specialization !== filterSpec) return false
    if (filterArea && r.area !== filterArea) return false
    if (filterUrgency && r.urgency !== filterUrgency) return false
    return true
  })

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <select value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)} className="flex-1 px-3 py-2 border border-warm-gray rounded-xl bg-white text-sm">
          <option value="">كل التخصصات</option>
          {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterArea} onChange={(e) => setFilterArea(e.target.value)} className="flex-1 px-3 py-2 border border-warm-gray rounded-xl bg-white text-sm">
          <option value="">كل المناطق</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterUrgency('')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${filterUrgency === '' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'}`}>الكل</button>
        <button onClick={() => setFilterUrgency('طارئ')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${filterUrgency === 'طارئ' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'}`}>طارئ فقط</button>
        <button onClick={() => setFilterUrgency('عادي')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${filterUrgency === 'عادي' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'}`}>عادي فقط</button>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="📭" title="لا توجد طلبات مطابقة" />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} onClick={() => onOpenRequest(r.id)} className="bg-card-bg rounded-2xl shadow-sm p-4 cursor-pointer active:opacity-80">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-dark-text">{r.specialization}</h3>
                <span>{r.urgency === 'طارئ' ? '🔴 طارئ' : '🟢 عادي'}</span>
              </div>
              <p className="text-sm text-dark-text/70 line-clamp-2">{r.description}</p>
              {r.images?.[0] && <img src={r.images[0]} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />}
              <div className="text-xs text-dark-text/60 mt-2">📍 {r.area}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllRequests
