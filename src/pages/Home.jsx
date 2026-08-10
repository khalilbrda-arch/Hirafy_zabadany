import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore'
import { specializations } from '../data/specializations'
import { areas } from '../data/areas'
import { uploadImage } from '../uploadImage'

const CustomerHome = () => {
  const [showForm, setShowForm] = useState(false)
  const [specialization, setSpecialization] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [area, setArea] = useState('')
  const [urgency, setUrgency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
  }

  const resetForm = () => {
    setSpecialization('')
    setDescription('')
    setImages([])
    setArea('')
    setUrgency('')
    setError('')
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
      const imageUrls = []
      for (const file of images) {
        const url = await uploadImage(file)
        imageUrls.push(url)
      }

      await addDoc(collection(db, 'requests'), {
        specialization,
        description,
        images: imageUrls,
        area,
        urgency,
        status: 'منشور',
        customerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      })

      setSuccess(true)
      resetForm()
      setTimeout(() => {
        setSuccess(false)
        setShowForm(false)
      }, 2000)
    } catch (err) {
      setError('حدث خطأ أثناء نشر الطلب، حاول مرة أخرى')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-2xl font-medium mb-8 text-center">مرحباً بك في حرفي الزبداني</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-copper text-white text-xl font-medium py-6 px-10 rounded-2xl shadow-sm hover:bg-copper/90 transition-colors"
        >
          اطلب خدمة الآن
        </button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <button
        onClick={() => setShowForm(false)}
        className="text-copper mb-4 font-medium"
      >
        ← رجوع
      </button>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-medium mb-4 text-center">نشر طلب خدمة</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
            تم نشر طلبك بنجاح!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-dark-text">التخصص</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
            >
              <option value="">اختر التخصص</option>
              {specializations.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-dark-text">وصف المشكلة</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
              placeholder="اشرح المشكلة بالتفصيل..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-dark-text">الصور (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full text-sm"
            />
            {images.length > 0 && (
              <p className="text-xs text-dark-text/60 mt-1">{images.length} صورة مختارة</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-dark-text">المنطقة</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
            >
              <option value="">اختر المنطقة</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-dark-text">درجة الاستعجال</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setUrgency('عادي')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                  urgency === 'عادي'
                    ? 'border-copper bg-copper/10'
                    : 'border-warm-gray bg-white hover:border-copper/50'
                }`}
              >
                <p className="font-medium">عادي</p>
              </div>
              <div
                onClick={() => setUrgency('طارئ')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                  urgency === 'طارئ'
                    ? 'border-copper bg-copper/10'
                    : 'border-warm-gray bg-white hover:border-copper/50'
                }`}
              >
                <p className="font-medium">طارئ</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-copper text-white py-3 rounded-xl font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'جاري النشر...' : 'نشر الطلب'}
          </button>
        </form>
      </div>
    </div>
  )
}

const CraftsmanHome = ({ profile, onOpenRequest }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'منشور')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((r) =>
          profile?.specializations?.includes(r.specialization) &&
          profile?.areas?.includes(r.area)
        )
      setRequests(data)
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [profile])

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-dark-text/60">جاري التحميل...</p>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-medium">الطلبات المتاحة</h2>
        <p className="text-dark-text/70 mt-2">لا توجد طلبات مطابقة لتخصصك ومنطقتك حالياً</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4 text-center">الطلبات المتاحة</h2>
      <div className="space-y-3">
        {requests.map((r) => (
          <div
            key={r.id}
            onClick={() => onOpenRequest(r.id)}
            className="bg-card-bg rounded-2xl shadow-sm p-4 cursor-pointer active:opacity-80"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-dark-text">{r.specialization}</h3>
              <span>{r.urgency === 'طارئ' ? '🔴 طارئ' : '🟢 عادي'}</span>
            </div>
            <p className="text-sm text-dark-text/70 line-clamp-2">{r.description}</p>
            {r.images?.[0] && (
              <img src={r.images[0]} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />
            )}
            <div className="text-xs text-dark-text/60 mt-2">📍 {r.area}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = ({ profile, onOpenRequest }) => {
  if (profile?.accountType === 'craftsman') {
    return <CraftsmanHome profile={profile} onOpenRequest={onOpenRequest} />
  }
  return <CustomerHome />
}

export default Home
