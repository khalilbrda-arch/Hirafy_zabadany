import { useState } from 'react'
import { auth, db } from '../firebase'
import { updatePassword, deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import ConfirmDialog from '../components/ConfirmDialog'

const AccountSettings = ({ onBack }) => {
  const [newPassword, setNewPassword] = useState('')
  const [changing, setChanging] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg('')
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    setChanging(true)
    try {
      await updatePassword(auth.currentUser, newPassword)
      setPasswordMsg('تم تغيير كلمة المرور بنجاح')
      setNewPassword('')
    } catch (err) {
      setPasswordError('حدث خطأ، قد تحتاج لتسجيل الدخول من جديد قبل تغيير كلمة المرور')
    } finally {
      setChanging(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteDoc(doc(db, 'profiles', auth.currentUser.uid))
      await deleteUser(auth.currentUser)
    } catch (err) {
      setDeleteError('حدث خطأ، قد تحتاج لتسجيل الدخول من جديد قبل حذف الحساب')
      setDeleting(false)
    }
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>
      <h2 className="text-xl font-medium text-center mb-4">إعدادات الحساب</h2>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6 mb-4">
        <h3 className="font-medium text-dark-text mb-3">تغيير كلمة المرور</h3>
        {passwordMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-3">{passwordMsg}</div>}
        {passwordError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3">{passwordError}</div>}
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            dir="ltr"
            className="w-full px-4 py-2.5 border border-warm-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-copper bg-white"
          />
          <button
            type="submit"
            disabled={changing}
            className="w-full bg-copper text-white py-2.5 rounded-xl font-medium disabled:opacity-60"
          >
            {changing ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>

      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        <h3 className="font-medium text-red-600 mb-2">حذف الحساب</h3>
        <p className="text-sm text-dark-text/60 mb-3">سيتم حذف حسابك وبياناتك الشخصية نهائياً. لا يمكن التراجع عن هذا الإجراء.</p>
        {deleteError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-3">{deleteError}</div>}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full border border-red-300 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors"
        >
          حذف حسابي نهائياً
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="حذف الحساب"
          message="هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel="حذف نهائياً"
          danger
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

export default AccountSettings
