import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, addDoc, serverTimestamp, collection, query, where, onSnapshot, updateDoc, deleteDoc, writeBatch, getDocs, getDoc, Timestamp } from 'firebase/firestore'
import Timeline from '../components/Timeline'
import Chat from '../components/Chat'
import RatingModal from '../components/RatingModal'
import ReportButton from '../components/ReportButton'
import ImageLightbox from '../components/ImageLightbox'
import LoadingSpinner from '../components/LoadingSpinner'

const Stars = ({ rating }) => {
  const rounded = Math.round(rating || 0)
  return (
    <span className="text-copper text-sm">
      {'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}
      <span className="text-dark-text/50 text-xs mr-1">({(rating || 0).toFixed(1)})</span>
    </span>
  )
}

const OffersList = ({ requestId, isOwner, requestStatus, offers, onOpenCraftsmanProfile }) => {
  const [accepting, setAccepting] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

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

  const handleWithdraw = async (offerId) => {
    setWithdrawing(true)
    try {
      await deleteDoc(doc(db, 'offers', offerId))
    } catch (err) {
      console.error(err)
    } finally {
      setWithdrawing(false)
    }
  }

  const myOffer = offers.find((o) => o.craftsmanId === auth.currentUser.uid)

  return (
    <div className="mt-4 space-y-3">
      {isOwner && offers.length > 0 && (
        <h3 className="font-medium text-dark-text">العروض المقدّمة ({offers.length})</h3>
      )}
      {isOwner && offers.length === 0 && <p className="text-dark-text/60 text-sm">لا توجد عروض بعد</p>}

      {isOwner && offers.map((offer) => (
        <div key={offer.id} className="border border-warm-gray rounded-xl p-4 bg-white">
          <div className="flex justify-between items-start mb-1">
            <button
              onClick={() => onOpenCraftsmanProfile(offer.craftsmanId)}
              className="text-right"
            >
              <span className="font-medium text-dark-text block underline">{offer.craftsmanName}</span>
              <Stars rating={offer.craftsmanRating} />
            </button>
            <span className="text-copper font-medium">{offer.price} ل.س</span>
          </div>
          {offer.message && <p className="text-sm text-dark-text/70 mb-2 mt-2">{offer.message}</p>}
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

      {!isOwner && myOffer && myOffer.status === 'قيد الانتظار' && requestStatus === 'منشور' && (
        <div className="border border-warm-gray rounded-xl p-4 bg-white">
          <p className="text-sm text-dark-text/70 mb-2">عرضك: {myOffer.price} ل.س</p>
          <button
            onClick={() => handleWithdraw(myOffer.id)}
            disabled={withdrawing}
            className="w-full py-2 rounded-xl font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {withdrawing ? 'جاري السحب...' : 'سحب العرض'}
          </button>
        </div>
      )}
    </div>
  )
}

const OfferForm = ({ requestId, profile }) => {
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const checkRateLimit = async () => {
    const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000)
    const q = query(
      collection(db, 'offers'),
      where('craftsmanId', '==', auth.currentUser.uid),
      where('createdAt', '>', oneHourAgo)
    )
    const snap = await getDocs(q)
    return snap.size
  }

  const handleSubmitOffer = async (e) => {
    e.preventDefault()
    setError('')
    if (!price.trim()) {
      setError('يرجى إدخال السعر المقترح')
      return
    }
    setSubmitting(true)
    try {
      const recentCount = await checkRateLimit()
      if (recentCount >= 10) {
        setError('لقد وصلت للحد الأقصى (10 عروض بالساعة)، حاول لاحقاً')
        setSubmitting(false)
        return
      }

      const profileSnap = await getDoc(doc(db, 'profiles', auth.currentUser.uid))
      const craftsmanRating = profileSnap.exists() ? (profileSnap.data().rating || 0) : 0

      await addDoc(collection(db, 'offers'), {
        requestId,
        craftsmanId: auth.currentUser.uid,
        craftsmanName: profile.fullName,
        craftsmanRating,
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

const RequestDetails = ({ requestId, onBack, profile, onOpenCraftsmanProfile }) => {
  const [request, setRequest] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)

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

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await updateDoc(doc(db, 'requests', requestId), { status: 'ملغى' })
    } catch (err) {
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="جاري تحميل تفاصيل الطلب..." />
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
  const canCancel = isOwner && request.status === 'منشور'

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-medium">{request.specialization}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{request.status}</span>
        </div>

        {request.status === 'منتهي الصلاحية' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-3 text-sm">
            انتهت صلاحية هذا الطلب. يمكنك إعادة نشره من صفحة "طلباتي".
          </div>
        )}

        <p className="text-dark-text/80 mb-3">{request.description}</p>
        <p className="text-sm text-dark-text/60 mb-1">📍 {request.area}</p>
        <p className="text-sm text-dark-text/60 mb-3">{request.urgency === 'طارئ' ? '🔴 طارئ' : '🟢 عادي'}</p>

        {request.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {request.images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                onClick={() => setLightboxIndex(i)}
                className="w-full h-24 object-cover rounded-xl cursor-pointer"
              />
            ))}
          </div>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full mb-3 py-2.5 rounded-xl font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            {cancelling ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
          </button>
        )}

        {showTimeline && (
          <Timeline
            currentStage={request.stage || 'تم الاختيار'}
            isCraftsman={isAcceptedCraftsman}
            onAdvance={handleAdvanceStage}
          />
        )}

        {canOffer && <OfferForm requestId={requestId} profile={profile} />}

        <OffersList
          requestId={requestId}
          isOwner={isOwner}
          requestStatus={request.status}
          offers={offers}
          onOpenCraftsmanProfile={onOpenCraftsmanProfile}
        />

        {showChat && <Chat requestId={requestId} />}

        {(isOwner || isAcceptedCraftsman) && showTimeline && (
          <ReportButton requestId={requestId} />
        )}
      </div>

      {needsRating && (
        <RatingModal
          requestId={requestId}
          ratedUserId={ratedUserId}
          ratedUserRole={ratedUserRole}
          onDone={() => setAlreadyRated(true)}
        />
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={request.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

export default RequestDetails
