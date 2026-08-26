import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { specializations } from '../data/specializations'
import { areas } from '../data/areas'
import { uploadImage } from '../uploadImage'
import SegmentedTabs from '../components/SegmentedTabs'
import RequestButton from '../components/RequestButton'
import MyOrders from './MyOrders'
import BrowseCraftsmen from './BrowseCraftsmen'

const RequestForm = ({ onClose, onPublished }) => {
  const [specialization, setSpecialization] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [area, setArea] = useState('')
  const [urgency, setUrgency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleImageChange = (e) => setImages(Array.from(e.target.files))

  const checkRateLimit = async () => {
    const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000)
    const q = query(
      collection(db, 'requests'),
      where('customerId', '==', auth.currentUser.uid),
      where('createdAt', '>', oneHourAgo)
    )
    const snap = await getDocs(q)
    return snap.size
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!specialization || !description.trim() || !area || !urgency) {
      setError('يرجى تعبئة جميع الحقول المطلوبة')
      return
    }
    setLoading(true)
    try {
      const recentCount = await checkRateLimit()
      if (recentCount >= 5) {
        setError('لقد وصلت للحد الأقصى (5 طلبات بالساعة)، حاول لاحقاً')
        setLoading(false)
        return
      }
      const imageUrls = []
      for (const file of images) {
        const url = await uploadImage(file)
        imageUrls.push(url)
      }
      await addDoc(collection(db, 'requests'), {
        specialization, description, images: imageUrls, area, urgency,
        status: 'منشور', customerId: auth.currentUser.uid, createdAt: serverTimestamp(),
      })
      setSuccess(true)
      setTimeout(() => onPublished(), 1500)
    } catch (err) {
      setError('حدث خطأ أثناء نشر الطلب، حاول مرة أخرى')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <button onClick={onClose} className="text-copper mb-4 font-medium">← رجوع</button>
      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-medium mb-4 text-center">نشر طلب خدمة</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">تم نشر طلبك بنجاح!</div>}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">التخصص</label>
              <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full px-4 py-2.5 border border-warm-gray rounded-xl bg-white">
                <option value="">اختر التخصص</option>
                {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">وصف المشكلة</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2.5 border border-warm-gray rounded-xl bg-white" placeholder="اشرح المشكلة بالتفصيل..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">الصور (اختياري)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">المنطقة</label>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-4 py-2.5 border border-warm-gray rounded-xl bg-white">
                <option value="">اختر المنطقة</option>
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-dark-text">درجة الاستعجال</label>
              <div className="grid grid-cols-2 gap-3">
                <div onClick={() => setUrgency('عادي')} className={`p-4 rounded-xl border-2 cursor-pointer text-center ${urgency === 'عادي' ? 'border-copper bg-copper/10' : 'border-warm-gray bg-white'}`}><p className="font-medium">عادي</p></div>
                <div onClick={() => setUrgency('طارئ')} className={`p-4 rounded-xl border-2 cursor-pointer text-center ${urgency === 'طارئ' ? 'border-copper bg-copper/10' : 'border-warm-gray bg-white'}`}><p className="font-medium">طارئ</p></div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-copper text-white py-3 rounded-xl font-medium disabled:opacity-60">
              {loading ? 'جاري النشر...' : 'نشر الطلب'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ number, label }) => (
  <div className="bg-card-bg rounded-2xl shadow-sm p-4 text-center flex-1">
    <p className="text-2xl font-medium text-copper">{number}</p>
    <p className="text-xs text-dark-text/60 mt-1">{label}</p>
  </div>
)

const AvailabilityToggle = ({ profile, onToggle }) => {
  const [updating, setUpdating] = useState(false)
  const available = profile?.available !== false

  const handleToggle = async () => {
    setUpdating(true)
    try {
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), { available: !available })
      onToggle(!available)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={updating}
      className={`w-full mb-4 py-2.5 rounded-xl text-sm font-medium border flex items-center justify-center gap-2 ${
        available ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      {available ? 'متاح لاستقبال الطلبات الآن' : 'غير متاح حالياً (اضغط للتفعيل)'}
    </button>
  )
}

const AvailableRequestsList = ({ profile, onOpenRequest }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'requests'), where('status', '==', 'منشور'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => r.customerId !== auth.currentUser.uid && profile?.specializations?.includes(r.specialization) && profile?.areas?.includes(r.area))
        .sort((a, b) => (a.urgency === 'طارئ' ? -1 : 0) - (b.urgency === 'طارئ' ? -1 : 0))
      setRequests(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [profile])

  if (loading) return <p className="text-dark-text/60 text-center p-4">جاري التحميل...</p>
  if (requests.length === 0) return <div className="bg-card-bg rounded-2xl shadow-sm p-6 text-center"><p className="text-dark-text/60">لا توجد طلبات مطابقة حالياً</p></div>

  return (
    <div className="space-y-3">
      {requests.map((r) => (
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
  )
}

const Home = ({ profile, onOpenRequest, onOpenCraftsmanProfile }) => {
  const [showForm, setShowForm] = useState(false)
  const [localProfile, setLocalProfile] = useState(profile)
  const isCraftsman = localProfile?.accountType === 'craftsman'
  const [tab, setTab] = useState(isCraftsman ? 'available' : 'myrequests')

  useEffect(() => { setLocalProfile(profile) }, [profile])

  if (showForm) {
    return <RequestForm onClose={() => setShowForm(false)} onPublished={() => setShowForm(false)} />
  }

  const customerTabs = [
    { key: 'myrequests', label: 'طلباتي' },
    { key: 'browse', label: 'تصفح الحرفيين' },
  ]
  const craftsmanTabs = [
    { key: 'available', label: 'الطلبات المتاحة' },
    { key: 'myrequests', label: 'طلباتي' },
  ]

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4 text-center pt-2">مرحباً {localProfile?.fullName?.split(' ')[0] || ''} 👋</h2>

      <RequestButton onClick={() => setShowForm(true)} />

      {isCraftsman && (
        <AvailabilityToggle profile={localProfile} onToggle={(v) => setLocalProfile((p) => ({ ...p, available: v }))} />
      )}

      <SegmentedTabs tabs={isCraftsman ? craftsmanTabs : customerTabs} active={tab} onChange={setTab} />

      {isCraftsman ? (
        tab === 'available'
          ? <AvailableRequestsList profile={localProfile} onOpenRequest={onOpenRequest} />
          : <MyOrders onOpenRequest={onOpenRequest} />
      ) : (
        tab === 'myrequests'
          ? <MyOrders onOpenRequest={onOpenRequest} />
          : <BrowseCraftsmen onOpenCraftsmanProfile={onOpenCraftsmanProfile} />
      )}
    </div>
  )
}

export default Home
