import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore'

const AdminPanel = ({ onBack }) => {
  const [tab, setTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    const unsubRequests = onSnapshot(collection(db, 'requests'), (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubUsers = onSnapshot(collection(db, 'profiles'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => {
      unsubRequests()
      unsubUsers()
      unsubReports()
    }
  }, [])

  const handleDeleteRequest = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    await deleteDoc(doc(db, 'requests', id))
  }

  const handleToggleBan = async (userId, currentlyBanned) => {
    await updateDoc(doc(db, 'profiles', userId), { banned: !currentlyBanned })
  }

  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>
      <h1 className="text-xl font-medium text-center mb-4">لوحة التحكم الإدارية</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('requests')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'requests' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'}`}>الطلبات</button>
        <button onClick={() => setTab('users')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'users' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'}`}>المستخدمون</button>
        <button onClick={() => setTab('reports')} className={`flex-1 py-2 rounded-xl text-sm font-medium ${tab === 'reports' ? 'bg-copper text-white' : 'bg-white text-dark-text border border-warm-gray'}`}>البلاغات</button>
      </div>

      {tab === 'requests' && (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="bg-card-bg rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{r.specialization}</p>
                <p className="text-xs text-dark-text/60">{r.status} · {r.area}</p>
              </div>
              <button onClick={() => handleDeleteRequest(r.id)} className="text-red-600 text-xs border border-red-300 px-3 py-1.5 rounded-lg">حذف</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-card-bg rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{u.fullName}</p>
                <p className="text-xs text-dark-text/60">{u.accountType === 'craftsman' ? 'حرفي' : 'زبون'} {u.banned && '· محظور'}</p>
              </div>
              <button
                onClick={() => handleToggleBan(u.id, u.banned)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${u.banned ? 'border-green-300 text-green-700' : 'border-red-300 text-red-600'}`}
              >
                {u.banned ? 'إلغاء الحظر' : 'حظر'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-2">
          {reports.length === 0 && <p className="text-dark-text/60 text-sm text-center">لا توجد بلاغات</p>}
          {reports.map((r) => (
            <div key={r.id} className="bg-card-bg rounded-xl p-3">
              <p className="font-medium text-sm">{r.reason}</p>
              {r.description && <p className="text-xs text-dark-text/60 mt-1">{r.description}</p>}
              <p className="text-xs text-dark-text/50 mt-1">حالة: {r.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPanel
