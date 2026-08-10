import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const statusColors = {
  'منشور': 'bg-blue-50 text-blue-700 border-blue-200',
  'قيد التنفيذ': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'تم الإنجاز': 'bg-green-50 text-green-700 border-green-200',
  'ملغى': 'bg-gray-50 text-gray-500 border-gray-200',
  'منتهي الصلاحية': 'bg-gray-50 text-gray-500 border-gray-200',
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'requests'),
      where('customerId', '==', auth.currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setOrders(data)
      setLoading(false)
    }, (err) => {
      setError(err.message)
      console.error(err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-dark-text/60">جاري التحميل...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 text-sm">خطأ: {error}</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-medium">طلباتي</h2>
        <p className="text-dark-text/70 mt-2">لا توجد طلبات حالياً</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4 text-center">طلباتي</h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-card-bg rounded-2xl shadow-sm p-4">
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyOrders
