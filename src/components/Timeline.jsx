const stages = ['تم النشر', 'تم الاختيار', 'الحرفي بالطريق', 'تم الإنجاز']

const Timeline = ({ currentStage, isCraftsman, onAdvance }) => {
  const currentIndex = stages.indexOf(currentStage)
  const nextStage = stages[currentIndex + 1]

  return (
    <div className="my-4">
      <div className="flex items-center justify-between">
        {stages.map((stage, i) => (
          <div key={stage} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 ${
                i <= currentIndex ? 'bg-copper text-white' : 'bg-warm-gray text-white'
              }`}
            >
              {i <= currentIndex ? '✓' : ''}
            </div>
            <span className="text-[10px] text-center mt-1 text-dark-text/70">{stage}</span>
            {i < stages.length - 1 && (
              <div
                className={`absolute top-3 right-1/2 w-full h-0.5 ${
                  i < currentIndex ? 'bg-copper' : 'bg-warm-gray'
                }`}
                style={{ left: '50%', right: 'auto' }}
              />
            )}
          </div>
        ))}
      </div>

      {isCraftsman && nextStage && (
        <button
          onClick={() => onAdvance(nextStage)}
          className="w-full mt-4 bg-copper text-white py-2.5 rounded-xl font-medium hover:bg-copper/90 transition-colors"
        >
          الانتقال إلى: {nextStage}
        </button>
      )}
    </div>
  )
}

export default Timeline
