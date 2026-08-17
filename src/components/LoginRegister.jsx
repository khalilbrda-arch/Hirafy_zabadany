import { useState } from 'react'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const translateError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجّل مسبقاً'
    case 'auth/weak-password':
      return 'كلمة المرور قصيرة جداً (6 أحرف على الأقل)'
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    default:
      return 'حدث خطأ ما، حاول مرة أخرى'
  }
}

const LoginRegister = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول')
      return
    }
    if (mode === 'register' && (!fullName.trim() || !accountType)) {
      setError('يرجى إدخال الاسم واختيار نوع الحساب')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'profiles', userCredential.user.uid), {
          fullName,
          accountType,
          email,
        })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onLoginSuccess()
    } catch (err) {
      setError(translateError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-copper rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl">
            🛠️
          </div>
          <h1 className="text-2xl font-medium text-dark-text">حرفي الزبداني</h1>
          <p className="text-sm text-dark-text/60 mt-1">حرفيّون موثوقون، بضغطة زر</p>
        </div>

        <div className="bg-card-bg rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-medium text-center mb-6 text-dark-text">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-text">الاسم الكامل</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
                placeholder="example@domain.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-dark-text">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
                placeholder="********"
                dir="ltr"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-text">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setAccountType('customer')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                      accountType === 'customer'
                        ? 'border-copper bg-copper/10'
                        : 'border-warm-gray bg-white hover:border-copper/50'
                    }`}
                  >
                    <span className="text-lg">🧑</span>
                    <p className="font-medium mt-1">زبون</p>
                  </div>
                  <div
                    onClick={() => setAccountType('craftsman')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                      accountType === 'craftsman'
                        ? 'border-copper bg-copper/10'
                        : 'border-warm-gray bg-white hover:border-copper/50'
                    }`}
                  >
                    <span className="text-lg">🔧</span>
                    <p className="font-medium mt-1">حرفي</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper text-white py-3 rounded-xl font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'جاري التحميل...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-copper hover:underline font-medium text-sm"
            >
              {mode === 'login' ? 'إنشاء حساب جديد' : 'لديك حساب؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginRegister
