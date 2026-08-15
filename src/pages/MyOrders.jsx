import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore'

const statusColors = {
  'منشور': 'bg-blue-50 text-blue-700 border-blue-200',
  'قيد التنفيذ': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'تم الإنجاز': 'bg-green-50 text-green-700 border-green-200',
  'ملغى': 'bg-gray-50 text-gray-500 border-gray-200',
  'منتهي الصلاحية': 'bg-gray-50 text-gray-500 border-gray-200',
}

const activeStatuses = ['منشور', 'قيد التنفيذ']
const historyStatuses = ['تم الإنجاز', 'ملغى', 'منتهي الصلاحية']

const OrderCard = ({ order, onOpenRequest }) => {
  const [republishing, setRepublishing] = useState(false)

  const handleRepublish = async (e) => {
    e.stopPropagation()
    setRepublishing(true)
    try {
      await updateDoc(doc(db, 'requests', order.id), {
        status: 'منشور',
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setRepublishing(false)
    }
  }

  return (
    <div
      onClick={() => onOpenRequest(order.id)}
      className="bg-card-bg rounded-2xl shadow-sm p-4 cursor-pointer active:opacity-80"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-dark-text">{order.specialization}</h3>
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          {order.status}
        </span>
      </div>
      <p className="text-sm text-dark-text/70 line-clamp-2">{order.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-dark-text/60">
        <span>📍 {order.area}</span>
        <span>{order.urgency === 'طارئ' ? '🔴 طارئ' : '🟢 عادي'}</span>
      </div>

      {order.status === 'منتهي الصلاحية' && (
        <div className="mt-3 border-t border-warm-gray pt-3">
          <p className="text-xs text-dark-text/60 mb-2">انتهت صلاحية هذا الطلب لعدم وجود عروض خلال 48 ساعة</p>
          <button
            onClick={handleRepublish}
            disabled={republishing}
            className="w-full bg-copper text-white py-2 rounded-xl text-sm font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
          >
            {republishing ? 'جاري إعادة النشر...' : 'إعادة نشر الطلب'}
          </button>
        </div>
      )}
    </div>
  )
}

const MyOrders = ({ onOpenRequest }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('active')

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false)
      return
    }
    const q = query(collection(db, 'requests'), where('customerId', '==', auth.currentUser.uid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      setError(err.message)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="p-6 text-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  if (error) return <div className="p-6 text-center"><p className="text-red-600 text-sm">خطأ: {error}</p></div>

  const filteredOrders = orders.filter((o) =>
    tab === 'active' ? activeStatuses.includes(o.status) : historyStatuses.includes(o.status)
  )

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4 text-center">طلباتي</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'active' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'
          }`}
        >
          النشطة
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'
          }`}
        >
          السجل
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-dark-text/70 text-center mt-6">
          {tab === 'active' ? 'لا توجد طلبات نشطة حالياً' : 'لا يوجد سجل طلبات سابقة'}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onOpenRequest={onOpenRequest} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
