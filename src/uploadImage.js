import imageCompression from 'browser-image-compression'

export async function uploadImage(file, onProgress) {
  let fileToUpload = file

  try {
    if (onProgress) onProgress('جاري ضغط الصورة...')
    fileToUpload = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    })
  } catch (err) {
    console.error('فشل ضغط الصورة، سيتم رفعها بحجمها الأصلي', err)
  }

  if (onProgress) onProgress('جاري الرفع...')

  const formData = new FormData()
  formData.append('file', fileToUpload)
  formData.append('upload_preset', 'harafi_unsigned')

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/ekmh639i/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('فشل رفع الصورة')
  }

  const data = await response.json()
  if (onProgress) onProgress('تم الرفع بنجاح')
  return data.secure_url
}
