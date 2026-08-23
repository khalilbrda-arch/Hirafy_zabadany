import { useState } from 'react'

const faqs = [
  {
    q: 'كيف أنشر طلب خدمة؟',
    a: 'من الصفحة الرئيسية، اضغط "اطلب خدمة الآن"، واملأ التخصص والوصف والمنطقة ودرجة الاستعجال.',
  },
  {
    q: 'كيف أختار حرفياً من بين العروض؟',
    a: 'افتح طلبك من صفحة "طلباتي"، وستجد كل العروض المقدّمة. اضغط "اختيار هذا الحرفي" على العرض المناسب.',
  },
  {
    q: 'ماذا يحدث إذا لم يصلني أي عرض؟',
    a: 'إذا لم يصل أي عرض خلال 48 ساعة، تنتهي صلاحية الطلب تلقائياً، ويمكنك إعادة نشره بضغطة زر من صفحة "طلباتي".',
  },
  {
    q: 'كيف أصبح حرفياً على المنصة؟',
    a: 'عند التسجيل اختر نوع الحساب "حرفي"، ثم حدد تخصصاتك ومناطق عملك عند أول دخول.',
  },
  {
    q: 'هل يمكنني إلغاء طلب بعد نشره؟',
    a: 'نعم، طالما لم يتم اختيار حرفي بعد، يمكنك إلغاء الطلب من صفحة تفاصيله.',
  },
  {
    q: 'كيف أبلغ عن مشكلة مع حرفي أو زبون؟',
    a: 'من صفحة تفاصيل الطلب أثناء التنفيذ، ستجد زر "الإبلاغ عن مشكلة" أسفل الصفحة.',
  },
]

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-warm-gray py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-right"
      >
        <span className="font-medium text-dark-text text-sm">{q}</span>
        <span className="text-copper text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="text-sm text-dark-text/70 mt-2">{a}</p>}
    </div>
  )
}

const Help = ({ onBack }) => {
  return (
    <div className="p-4">
      <button onClick={onBack} className="text-copper mb-4 font-medium">← رجوع</button>
      <h2 className="text-xl font-medium text-center mb-4">المساعدة والأسئلة الشائعة</h2>
      <div className="bg-card-bg rounded-2xl shadow-sm p-6">
        {faqs.map((f, i) => (
          <FaqItem key={i} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  )
}

export default Help
