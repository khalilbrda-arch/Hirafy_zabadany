import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function sendNotification(playerId, title, message) {
  if (!playerId) return
  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: [playerId],
        headings: { ar: title },
        contents: { ar: message },
      }),
    })
  } catch (err) {
    console.error('فشل إرسال إشعار:', err)
  }
}

async function getPlayerId(userId) {
  const snap = await db.collection('profiles').doc(userId).get()
  return snap.exists ? snap.data().oneSignalId : null
}

async function checkNewOffers(sinceTime) {
  const snapshot = await db
    .collection('offers')
    .where('createdAt', '>', sinceTime)
    .get()

  for (const docSnap of snapshot.docs) {
    const offer = docSnap.data()
    const requestSnap = await db.collection('requests').doc(offer.requestId).get()
    if (!requestSnap.exists) continue
    const request = requestSnap.data()
    const playerId = await getPlayerId(request.customerId)
    await sendNotification(playerId, 'عرض جديد', `وصلك عرض جديد بسعر ${offer.price} ل.س`)
  }
}

async function main() {
  const tenMinutesAgo = Timestamp.fromMillis(Date.now() - 10 * 60 * 1000)
  await checkNewOffers(tenMinutesAgo)
  console.log('تم فحص وإرسال الإشعارات')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
