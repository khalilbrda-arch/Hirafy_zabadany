import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot, or } from 'firebase/firestore'

const Inbox = ({ onOpenRequest }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.currentUser) return

    const q1 = query(
      collection(db, 'requests'),
      where('customerId', '==', auth.currentUser.uid),
      where('status', 'in', ['قيد التنفيذ', 'تم الإنجاز'])
    )
    const q2 = query(
      collection(db, 'requests'),
      where('craftsmanId', '==', auth.currentUser.uid),
      where('status', 'in', ['قيد التنفيذ', 'تم الإنجاز'])
    )

    let list1 = []
    let list2 = []

    const merge = () => {
      const combined = [...list1, ...list2]
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values())
      unique.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setConversations(unique)
      setLoading(false)
    }

    const unsub1 = onSnapshot(q1, (snapshot) => {
      list1 = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      merge()
    })
    const unsub2 = onSnapshot(q2, (snapshot) => {
      list2 = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      merge()
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  if (loading) {
    return <div className="p-6 text-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4">المحادثات</h2>

      {conversations.length === 0 ? (
        <div className="bg-card-bg rounded-2xl shadow-sm p-6 text-center">
          <p className="text-dark-text/60">لا توجد محادثات نشطة حالياً</p>
          <p className="text-dark-text/40 text-xs mt-1">تظهر المحادثات هنا بعد اختيار حرفي لأحد طلباتك</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((r) => {
            const isOwner = r.customerId === auth.currentUser.uid
            return (
              <div
                key={r.id}
                onClick={() => onOpenRequest(r.id)}
                className="bg-card-bg rounded-2xl shadow-sm p-4 cursor-pointer active:opacity-80 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center text-lg flex-shrink-0">
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-text truncate">{r.specialization}</p>
                  <p className="text-xs text-dark-text/60">
                    {isOwner ? 'محادثة مع الحرفي' : 'محادثة مع الزبون'} · {r.status}
                  </p>
                </div>
                <span className="text-warm-gray">←</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Inbox
