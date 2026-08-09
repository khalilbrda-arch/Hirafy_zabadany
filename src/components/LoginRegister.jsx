import { useState } from 'react'

const LoginRegister = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول')
      return
    }
    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('يرجى إدخال الاسم الكامل')
        return
      }
      if (!accountType) {
        setError('يرجى اختيار نوع الحساب')
        return
      }
    }

    onLoginSuccess()
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card-bg rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-medium text-center mb-6 text-dark-text">
          {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h1>

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
            className="w-full bg-copper text-white py-3 rounded-xl font-medium hover:bg-copper/90 transition-colors"
          >
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
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
  )
}

export default LoginRegister
