import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

async function checkExpiredRequests() {
  const now = Timestamp.now()
  const fortyEightHoursAgo = new Timestamp(now.seconds - 48 * 60 * 60, now.nanoseconds)

  const snapshot = await db
    .collection('requests')
    .where('status', '==', 'منشور')
    .where('createdAt', '<=', fortyEightHoursAgo)
    .get()

  if (snapshot.empty) {
    console.log('لا توجد طلبات منتهية الصلاحية')
    return
  }

  const batch = db.batch()
  let count = 0

  for (const docSnap of snapshot.docs) {
    const offersSnapshot = await db
      .collection('offers')
      .where('requestId', '==', docSnap.id)
      .limit(1)
      .get()

    if (offersSnapshot.empty) {
      batch.update(docSnap.ref, { status: 'منتهي الصلاحية' })
      count++
    }
  }

  await batch.commit()
  console.log(`تم تحديث ${count} طلب إلى حالة "منتهي الصلاحية"`)
}

checkExpiredRequests().catch((err) => {
  console.error(err)
  process.exit(1)
})
