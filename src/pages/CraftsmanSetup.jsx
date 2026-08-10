import { useState } from 'react'
import { db, auth } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { specializations } from '../data/specializations'
import { areas } from '../data/areas'

const CraftsmanSetup = ({ onSetupComplete }) => {
  const [selectedSpecs, setSelectedSpecs] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSpec = (spec) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
  }

  const toggleArea = (area) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (selectedSpecs.length === 0 || selectedAreas.length === 0) {
      setError('يرجى اختيار تخصص واحد على الأقل ومنطقة واحدة على الأقل')
      return
    }

    setLoading(true)
    try {
      const updatedData = {
        specializations: selectedSpecs,
        areas: selectedAreas,
        rating: 0,
        completedJobs: 0,
      }
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), updatedData)
      onSetupComplete(updatedData)
    } catch (err) {
      setError('حدث خطأ ما، حاول مرة أخرى')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg p-4">
      <div className="max-w-md mx-auto bg-card-bg rounded-2xl shadow-sm p-6 mt-6">
        <h1 className="text-xl font-medium text-center mb-2 text-dark-text">إعداد ملفك كحرفي</h1>
        <p className="text-sm text-dark-text/60 text-center mb-6">اختر تخصصاتك والمناطق التي تعمل بها</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-dark-text">التخصصات (يمكن اختيار أكثر من واحد)</label>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <button
                  type="button"
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-2 rounded-xl border-2 text-sm transition-colors ${
                    selectedSpecs.includes(spec)
                      ? 'border-copper bg-copper/10 text-copper font-medium'
                      : 'border-warm-gray bg-white text-dark-text'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-dark-text">مناطق العمل (يمكن اختيار أكثر من واحدة)</label>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <button
                  type="button"
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-2 rounded-xl border-2 text-sm transition-colors ${
                    selectedAreas.includes(area)
                      ? 'border-copper bg-copper/10 text-copper font-medium'
                      : 'border-warm-gray bg-white text-dark-text'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-copper text-white py-3 rounded-xl font-medium hover:bg-copper/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CraftsmanSetup
