import { useState } from 'react'

const ImageLightbox = ({ images, initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState(initialIndex)

  if (!images || images.length === 0) return null

  const next = (e) => {
    e.stopPropagation()
    setIndex((i) => (i + 1) % images.length)
  }

  const prev = (e) => {
    e.stopPropagation()
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white text-2xl w-10 h-10 flex items-center justify-center bg-white/10 rounded-full"
      >
        ✕
      </button>

      {images.length > 1 && (
        <span className="absolute top-4 right-4 text-white text-sm bg-white/10 px-3 py-1 rounded-full">
          {index + 1} / {images.length}
        </span>
      )}

      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl w-10 h-10 flex items-center justify-center bg-white/10 rounded-full"
          >
            →
          </button>
          <button
            onClick={next}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl w-10 h-10 flex items-center justify-center bg-white/10 rounded-full"
          >
            ←
          </button>
        </>
      )}
    </div>
  )
}

export default ImageLightbox
