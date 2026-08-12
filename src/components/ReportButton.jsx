import { useState } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const ReportButton = ({ requestId }) => {
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reports'), {
        requestId,
        reporterId: auth.currentUser.uid,
        reason,
        description,
        status: 'قيد المراجعة',
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return <p className="text-sm text-green-700 text-center mt-4">تم إرسال بلاغك، شكراً لك</p>
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-red-600 text-sm mt-4 underline"
      >
        الإبلاغ عن مشكلة
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-warm-gray pt-4 space-y-3">
      <h3 className="font-medium text-dark-text text-sm">الإبلاغ عن مشكلة</h3>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="سبب البلاغ"
        className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white text-sm"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="تفاصيل إضافية (اختياري)"
        className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 rounded-xl font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors text-sm disabled:opacity-60"
      >
        {submitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
      </button>
    </form>
  )
}

export default ReportButton
