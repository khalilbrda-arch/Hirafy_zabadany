import { useState } from 'react'

const ShareButton = ({ title, text }) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        console.error(err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-copper text-sm border border-copper/30 px-3 py-1.5 rounded-full flex items-center gap-1"
    >
      📤 {copied ? 'تم النسخ' : 'مشاركة'}
    </button>
  )
}

export default ShareButton
