import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const ConversationPreview = ({ requestId }) => {
  const [lastMessage, setLastMessage] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'requests', requestId, 'messages'), orderBy('createdAt', 'desc'), limit(1))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setLastMessage(snapshot.docs[0].data())
    })
    return () => unsubscribe()
  }, [requestId])

  if (!lastMessage) return <p className="text-xs text-dark-text/50">لا توجد رسائل بعد</p>
  const isMine = lastMessage.senderId === auth.currentUser.uid
  return <p className="text-xs text-dark-text/60 truncate">{isMine ? 'أنت: ' : ''}{lastMessage.text}</p>
}

const Inbox = ({ onOpenRequest }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.currentUser) return
    const q1 = query(collection(db, 'requests'), where('customerId', '==', auth.currentUser.uid), where('status', 'in', ['قيد التنفيذ', 'تم الإنجاز']))
    const q2 = query(collection(db, 'requests'), where('craftsmanId', '==', auth.currentUser.uid), where('status', 'in', ['قيد التنفيذ', 'تم الإنجاز']))
    let list1 = [], list2 = []
    const merge = () => {
      const combined = [...list1, ...list2]
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values())
      unique.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setConversations(unique)
      setLoading(false)
    }
    const unsub1 = onSnapshot(q1, (snap) => { list1 = snap.docs.map((d) => ({ id: d.id, ...d.data() })); merge() })
    const unsub2 = onSnapshot(q2, (snap) => { list2 = snap.docs.map((d) => ({ id: d.id, ...d.data() })); merge() })
    return () => { unsub1(); unsub2() }
  }, [])

  if (loading) return <LoadingSpinner text="جاري تحميل الرسائل..." />

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-center mb-4 pt-2">الرسائل</h2>
      {conversations.length === 0 ? (
        <EmptyState icon="💬" title="لا توجد محادثات نشطة" subtitle="تظهر هنا بعد اختيار حرفي لأحد طلباتك" />
      ) : (
        <div className="space-y-3">
          {conversations.map((r) => {
            const isOwner = r.customerId === auth.currentUser.uid
            return (
              <div key={r.id} onClick={() => onOpenRequest(r.id)} className="bg-card-bg rounded-2xl shadow-sm p-4 cursor-pointer active:opacity-80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center text-lg flex-shrink-0">💬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-dark-text truncate">{r.specialization}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${r.status === 'تم الإنجاز' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-dark-text/50 mb-0.5">{isOwner ? 'محادثة مع الحرفي' : 'محادثة مع الزبون'}</p>
                  <ConversationPreview requestId={r.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Inbox
