import { useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'

const NotificationSetup = () => {
  useEffect(() => {
    const registerNotifications = async () => {
      if (!window.OneSignalDeferred) return

      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          const permission = await OneSignal.Notifications.permission
          if (!permission) {
            await OneSignal.Notifications.requestPermission()
          }

          const subscriptionId = OneSignal.User.PushSubscription.id
          if (subscriptionId && auth.currentUser) {
            await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
              oneSignalId: subscriptionId,
            })
          }
        } catch (err) {
          console.error('OneSignal setup error:', err)
        }
      })
    }

    const timer = setTimeout(registerNotifications, 3000)
    return () => clearTimeout(timer)
  }, [])

  return null
}

export default NotificationSetup
