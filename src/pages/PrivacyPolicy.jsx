const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 space-y-3 text-sm text-dark-text/80">
        <h1 className="text-xl font-medium text-dark-text mb-2">سياسة الخصوصية</h1>
        <p>نجمع البيانات التالية عند استخدامك للتطبيق: البريد الإلكتروني، الاسم الكامل، الصور المرفوعة مع الطلبات، والمنطقة الجغرافية.</p>
        <p>تُستخدم هذه البيانات فقط لتشغيل خدمات التطبيق: عرض طلباتك، ربطك بالحرفيين المناسبين، وتمكين التواصل بين الأطراف.</p>
        <p>لا نشارك بياناتك مع أي جهة خارجية لأغراض تجارية.</p>
        <p>يحق لك طلب حذف حسابك وكل بياناتك المرتبطة به في أي وقت.</p>
      </div>
    </div>
  )
}

export default PrivacyPolicy
