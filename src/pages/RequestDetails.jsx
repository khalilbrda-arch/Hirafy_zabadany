import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const RequestDetails = ({ requestId, onBack, profile }) => {
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      const snap = await getDoc(doc(db, 'requests', requestId))
      if (snap.exists()) {
        setRequest({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    }
    fetchRequest()
  }, [requestId])

  const handleSubmitOffer = async (e) => {
    e.preventDefault()
    setError('')

    if (!price.trim()) {
      setError('يرجى إدخال السعر المقترح')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'offers'), {
        requestId,
        craftsmanId: auth.currentUser.uid,
        craftsmanName: profile.fullName,
        price,
        message,
        status: 'قيد الانتظار',
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch (err) {
      setError('حدث خطأ أثناء تقديم العرض')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-dark-text/60">جاري التحميل...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-6 text-center">
        <p className="text-dark-text/70">لم يتم العثور على الطلب</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-medium">{request.specialization}</h2>
          <span>{request.urgency === 'طارئ' ? '🔴 طارئ' : '🟢 عادي'}</span>
        </div>
        <p className="text-dark-text/80 mb-3">{request.description}</p>
        <p className="text-sm text-dark-text/60 mb-3">📍 {request.area}</p>

        {request.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {request.images.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-xl" />
            ))}
          </div>
        )}

        {profile?.accountType === 'craftsman' && (
          <div className="border-t border-warm-gray pt-4 mt-4">
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
                تم تقديم عرضك بنجاح!
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-3">
                <h3 className="font-medium text-dark-text">تقديم عرض سعر</h3>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1 text-dark-text">السعر المقترح</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
                    placeholder="مثال: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-dark-text">رسالة قصيرة (اختياري)</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-copper text-white py-3 rounded-xl font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'جاري الإرسال...' : 'تقديم العرض'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RequestDetails
