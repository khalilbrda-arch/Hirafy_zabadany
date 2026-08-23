import { useState } from 'react'
import { auth } from '../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('يرجى إدخال بريدك الإلكتروني')
      return
    }
    setLoading(true)
    setError('')
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err) {
      setError('تعذر إرسال رابط الاستعادة، تأكد من صحة البريد')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 w-full max-w-sm">
        <h2 className="text-lg font-medium text-center mb-4 text-dark-text">استعادة كلمة المرور</h2>

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني
            </p>
            <button onClick={onClose} className="w-full bg-copper text-white py-2.5 rounded-xl font-medium">
              إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              dir="ltr"
              className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper text-white py-2.5 rounded-xl font-medium disabled:opacity-60"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </button>
            <button type="button" onClick={onClose} className="w-full text-dark-text/60 text-sm">
              إلغاء
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal
