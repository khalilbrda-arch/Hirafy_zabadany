import imageCompression from 'browser-image-compression'

export async function uploadImage(file) {
  let fileToUpload = file

  try {
    fileToUpload = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    })
  } catch (err) {
    console.error('فشل ضغط الصورة، سيتم رفعها بحجمها الأصلي', err)
  }

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
  return data.secure_url
}
