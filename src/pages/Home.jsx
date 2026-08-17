import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore'
import { specializations } from '../data/specializations'
import { areas } from '../data/areas'
import { uploadImage } from '../uploadImage'

const RequestForm = ({ onClose, onPublished }) => {
  const [specialization, setSpecialization] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [area, setArea] = useState('')
  const [urgency, setUrgency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

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
      setTimeout(() => {
        onPublished()
      }, 1500)
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

        {!success && (
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
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full text-sm" />
              {images.length > 0 && <p className="text-xs text-dark-text/60 mt-1">{images.length} صورة مختارة (سيتم ضغطها تلقائياً)</p>}
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
                    urgency === 'عادي' ? 'border-copper bg-copper/10' : 'border-warm-gray bg-white hover:border-copper/50'
                  }`}
                >
                  <p className="font-medium">عادي</p>
                </div>
                <div
                  onClick={() => setUrgency('طارئ')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                    urgency === 'طارئ' ? 'border-copper bg-copper/10' : 'border-warm-gray bg-white hover:border-copper/50'
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

const CustomerHomeExtra = ({ profile }) => {
  const [craftsmenCount, setCraftsmenCount] = useState(0)
  const [myActiveCount, setMyActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const craftsmenQuery = query(
          collection(db, 'profiles'),
          where('accountType', '==', 'craftsman')
        )
        const craftsmenSnap = await getDocs(craftsmenQuery)
        const matching = craftsmenSnap.docs.filter((d) => {
          const data = d.data()
          return !data.banned && data.areas?.includes(profile?.residenceArea || '')
        })
        setCraftsmenCount(matching.length || craftsmenSnap.size)

        const myQuery = query(
          collection(db, 'requests'),
          where('customerId', '==', auth.currentUser.uid),
          where('status', 'in', ['منشور', 'قيد التنفيذ'])
        )
        const mySnap = await getDocs(myQuery)
        setMyActiveCount(mySnap.size)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [profile])

  if (loading) return null

  return (
    <div className="flex gap-3 mb-6">
      <StatCard number={craftsmenCount} label="حرفي متاح" />
      <StatCard number={myActiveCount} label="طلب نشط لك" />
    </div>
  )
}

const CraftsmanHomeExtra = ({ profile }) => {
  const [availableCount, setAvailableCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'requests'), where('status', '==', 'منشور'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matching = snapshot.docs.filter((d) => {
        const data = d.data()
        return profile?.specializations?.includes(data.specialization) &&
               profile?.areas?.includes(data.area)
      })
      setAvailableCount(matching.length)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [profile])

  if (loading) return null

  return (
    <div className="flex gap-3 mb-6">
      <StatCard number={availableCount} label="طلب متاح لك الآن" />
      <StatCard number={profile?.completedJobs || 0} label="عمل أنجزته" />
      <StatCard number={(profile?.rating || 0).toFixed(1)} label="تقييمك" />
    </div>
  )
}

const AvailableRequestsList = ({ profile, onOpenRequest }) => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'requests'), where('status', '==', 'منشور'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((r) =>
          r.customerId !== auth.currentUser.uid &&
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
    return <p className="text-dark-text/60 text-center p-4">جاري تحميل الطلبات المتاحة...</p>
  }

  if (requests.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 text-center">
        <p className="text-dark-text/60">لا توجد طلبات مطابقة لتخصصك ومنطقتك حالياً</p>
        <p className="text-dark-text/40 text-xs mt-1">سنعرض لك أي طلب جديد فور نشره</p>
      </div>
    )
  }

  return (
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
          {r.images?.[0] && <img src={r.images[0]} alt="" className="w-full h-32 object-cover rounded-xl mt-2" />}
          <div className="text-xs text-dark-text/60 mt-2">📍 {r.area}</div>
        </div>
      ))}
    </div>
  )
}

const RecentActivity = () => {
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'منشور'),
      orderBy('createdAt', 'desc'),
      limit(5)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecent(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading || recent.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-dark-text/70 mb-2">آخر الطلبات المنشورة بالمنطقة</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {recent.map((r) => (
          <div key={r.id} className="bg-card-bg rounded-xl shadow-sm p-3 flex-shrink-0 w-40">
            <p className="text-xs font-medium text-dark-text truncate">{r.specialization}</p>
            <p className="text-xs text-dark-text/50 mt-1">📍 {r.area}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = ({ profile, onOpenRequest }) => {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return <RequestForm onClose={() => setShowForm(false)} onPublished={() => setShowForm(false)} />
  }

  const isCraftsman = profile?.accountType === 'craftsman'

  return (
    <div className="p-4">
      <div className="flex flex-col items-center mb-6 pt-4">
        <h2 className="text-xl font-medium mb-1 text-center">مرحباً {profile?.fullName?.split(' ')[0] || ''} 👋</h2>
        <p className="text-sm text-dark-text/60 mb-4 text-center">أهلاً بك في حرفي الزبداني</p>
        {!isCraftsman && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-copper text-white text-lg font-medium py-4 px-8 rounded-2xl shadow-sm hover:bg-copper/90 transition-colors"
          >
            اطلب خدمة الآن
          </button>
        )}
      </div>

      {isCraftsman ? (
        <>
          <CraftsmanHomeExtra profile={profile} />
          <h2 className="text-lg font-medium mb-3 text-center">الطلبات المتاحة لك</h2>
          <AvailableRequestsList profile={profile} onOpenRequest={onOpenRequest} />
        </>
      ) : (
        <>
          <CustomerHomeExtra profile={profile} />
          <RecentActivity />
        </>
      )}
    </div>
  )
}

export default Home
