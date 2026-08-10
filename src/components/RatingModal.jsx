import { useState } from 'react'
import { db, auth } from '../firebase'
import { doc, addDoc, collection, serverTimestamp, updateDoc, getDoc, increment } from 'firebase/firestore'

const RatingModal = ({ requestId, ratedUserId, ratedUserRole, onDone }) => {
  const [stars, setStars] = useState(0)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (stars === 0) {
      setError('يرجى اختيار عدد النجوم')
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'ratings'), {
        requestId,
        ratedUserId,
        raterUserId: auth.currentUser.uid,
        stars,
        note,
        createdAt: serverTimestamp(),
      })

      if (ratedUserRole === 'craftsman') {
        const profileRef = doc(db, 'profiles', ratedUserId)
        const snap = await getDoc(profileRef)
        const data = snap.data()
        const oldRating = data.rating || 0
        const oldCount = data.completedJobs || 0
        const newCount = oldCount + 1
        const newRating = ((oldRating * oldCount) + stars) / newCount

        await updateDoc(profileRef, {
          rating: newRating,
          completedJobs: increment(1),
        })
      }

      onDone()
    } catch (err) {
      setError('حدث خطأ أثناء إرسال التقييم')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 w-full max-w-sm">
        <h2 className="text-lg font-medium text-center mb-4 text-dark-text">قيّم تجربتك</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              className={`text-3xl ${n <= stars ? 'text-copper' : 'text-warm-gray'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="ملاحظة (اختياري)"
          className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-copper text-white py-3 rounded-xl font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
        >
          {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </div>
    </div>
  )
}

export default RatingModal
