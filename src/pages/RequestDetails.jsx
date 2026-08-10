import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, addDoc, serverTimestamp, collection, query, where, onSnapshot, updateDoc, writeBatch, getDocs } from 'firebase/firestore'
import Timeline from '../components/Timeline'
import Chat from '../components/Chat'
import RatingModal from '../components/RatingModal'

const OffersList = ({ requestId, isOwner, requestStatus, offers }) => {
  const [accepting, setAccepting] = useState(false)

  const handleAccept = async (offer) => {
    setAccepting(true)
    try {
      const batch = writeBatch(db)
      const requestRef = doc(db, 'requests', requestId)
      batch.update(requestRef, {
        status: 'قيد التنفيذ',
        acceptedOfferId: offer.id,
        craftsmanId: offer.craftsmanId,
        stage: 'تم الاختيار',
      })
      offers.forEach((o) => {
        const offerRef = doc(db, 'offers', o.id)
        batch.update(offerRef, { status: o.id === offer.id ? 'مقبول' : 'مرفوض' })
      })
      await batch.commit()
    } catch (err) {
      console.error(err)
    } finally {
      setAccepting(false)
    }
  }

  if (!isOwner) return null
  if (offers.length === 0) return <p className="text-dark-text/60 text-sm mt-4">لا توجد عروض بعد</p>

  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-medium text-dark-text">العروض المقدّمة ({offers.length})</h3>
      {offers.map((offer) => (
        <div key={offer.id} className="border border-warm-gray rounded-xl p-4 bg-white">
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium text-dark-text">{offer.craftsmanName}</span>
            <span className="text-copper font-medium">{offer.price} ل.س</span>
          </div>
          {offer.message && <p className="text-sm text-dark-text/70 mb-2">{offer.message}</p>}
          <span className={`text-xs px-2 py-1 rounded-full ${
            offer.status === 'مقبول' ? 'bg-green-50 text-green-700' :
            offer.status === 'مرفوض' ? 'bg-gray-50 text-gray-500' : 'bg-blue-50 text-blue-700'
          }`}>
            {offer.status}
          </span>
          {requestStatus === 'منشور' && offer.status === 'قيد الانتظار' && (
            <button
              onClick={() => handleAccept(offer)}
              disabled={accepting}
              className="w-full mt-3 bg-copper text-white py-2 rounded-xl font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
            >
              {accepting ? 'جاري الاختيار...' : 'اختيار هذا الحرفي'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

const OfferForm = ({ requestId, profile }) => {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  if (success) {
    return <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm text-center mt-4">تم تقديم عرضك بنجاح!</div>
  }

  return (
    <form onSubmit={handleSubmitOffer} className="space-y-3 border-t border-warm-gray pt-4 mt-4">
      <h3 className="font-medium text-dark-text">تقديم عرض سعر</h3>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
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
  )
}

const RequestDetails = ({ requestId, onBack, profile }) => {
  const [request, setRequest] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'requests', requestId), (snap) => {
      if (snap.exists()) setRequest({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    return () => unsubscribe()
  }, [requestId])

  useEffect(() => {
    const q = query(collection(db, 'offers'), where('requestId', '==', requestId))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOffers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [requestId])

  useEffect(() => {
    const checkRated = async () => {
      if (!request || request.status !== 'تم الإنجاز') return
      const q = query(
        collection(db, 'ratings'),
        where('requestId', '==', requestId),
        where('raterUserId', '==', auth.currentUser.uid)
      )
      const snap = await getDocs(q)
      if (!snap.empty) setAlreadyRated(true)
    }
    checkRated()
  }, [request, requestId])

  const handleAdvanceStage = async (nextStage) => {
    try {
      const updates = { stage: nextStage }
      if (nextStage === 'تم الإنجاز') updates.status = 'تم الإنجاز'
      await updateDoc(doc(db, 'requests', requestId), updates)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <div className="p-6 text-center"><p className="text-dark-text/60">جاري التحميل...</p></div>
  }

  if (!request) {
    return <div className="p-6 text-center"><p className="text-dark-text/70">لم يتم العثور على الطلب</p></div>
  }

  const isOwner = request.customerId === auth.currentUser.uid
  const isAcceptedCraftsman = request.craftsmanId === auth.currentUser.uid
  const isCraftsman = profile?.accountType === 'craftsman'
  const canOffer = isCraftsman && !isOwner && request.status === 'منشور'
  const showTimeline = request.status === 'قيد التنفيذ' || request.status === 'تم الإنجاز'
  const showChat = (isOwner || isAcceptedCraftsman) && showTimeline
  const needsRating = request.status === 'تم الإنجاز' && !alreadyRated && (isOwner || isAcceptedCraftsman)
  const ratedUserId = isOwner ? request.craftsmanId : request.customerId
  const ratedUserRole = isOwner ? 'craftsman' : 'customer'

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-medium">{request.specialization}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{request.status}</span>
        </div>
        <p className="text-dark-text/80 mb-3">{request.description}</p>
        <p className="text-sm text-dark-text/60 mb-1">📍 {request.area}</p>
        <p className="text-sm text-dark-text/60 mb-3">{request.urgency === 'طارئ' ? '🔴 طارئ' : '🟢 عادي'}</p>

        {request.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {request.images.map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-xl" />
            ))}
          </div>
        )}

        {showTimeline && (
          <Timeline
            currentStage={request.stage || 'تم الاختيار'}
            isCraftsman={isAcceptedCraftsman}
            onAdvance={handleAdvanceStage}
          />
        )}

        {canOffer && <OfferForm requestId={requestId} profile={profile} />}

        <OffersList requestId={requestId} isOwner={isOwner} requestStatus={request.status} offers={offers} />

        {showChat && <Chat requestId={requestId} />}
      </div>

      {needsRating && (
        <RatingModal
          requestId={requestId}
          ratedUserId={ratedUserId}
          ratedUserRole={ratedUserRole}
          onDone={() => setAlreadyRated(true)}
        />
      )}
    </div>
  )
}

export default RequestDetails
