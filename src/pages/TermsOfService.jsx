const TermsOfService = ({ onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>
      <div className="bg-card-bg rounded-2xl shadow-sm p-6 space-y-3 text-sm text-dark-text/80">
        <h1 className="text-xl font-medium text-dark-text mb-2">شروط الاستخدام</h1>
        <p>باستخدامك تطبيق "حرفي الزبداني"، أنت توافق على تقديم معلومات صحيحة عند التسجيل ونشر الطلبات.</p>
        <p>التطبيق منصة وسيطة تربط الزبائن بالحرفيين، ولا يتحمل مسؤولية جودة العمل المنفذ أو الاتفاقات المالية بين الطرفين.</p>
        <p>يُمنع نشر طلبات وهمية أو مسيئة، ويحق لإدارة التطبيق حذف أي محتوى مخالف أو تعليق أي حساب مسيء.</p>
      </div>
    </div>
  )
}

export default TermsOfService
