import api from './api.js'

export async function getHome() {
  return api('/home', { suppressError: true })
}

export async function getAdminHomeMedia() {
  return api('/admin/home')
}

export async function assignHomeMedia(placement, mediaId) {
  return api(`/admin/home/media/${encodeURIComponent(placement)}`, {
    method: 'PUT',
    body: JSON.stringify({ mediaId }),
  })
}

export async function deleteHomeMedia(placement) {
  return api(`/admin/home/media/${encodeURIComponent(placement)}`, {
    method: 'DELETE',
  })
}

export async function getUploadSignature(resourceType) {
  return api('/admin/media/signature', {
    method: 'POST',
    body: JSON.stringify({ resourceType }),
  })
}

export async function registerMedia(upload) {
  return api('/admin/media', {
    method: 'POST',
    body: JSON.stringify(upload),
  })
}

export async function deleteRegisteredMedia(mediaId) {
  return api('/admin/media', {
    method: 'DELETE',
    body: JSON.stringify({ mediaId }),
  })
}

export async function uploadAndRegisterMedia(file) {
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
  const signatureResponse = await getUploadSignature(resourceType)
  const uploadData = signatureResponse.data

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', uploadData.apiKey)
  formData.append('timestamp', String(uploadData.timestamp))
  formData.append('signature', uploadData.signature)
  formData.append('folder', uploadData.folder)

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${uploadData.cloudName}/${resourceType}/upload`,
    { method: 'POST', body: formData },
  )
  const cloudinaryData = await cloudinaryResponse.json()

  if (!cloudinaryResponse.ok || !cloudinaryData.public_id) {
    throw new Error(cloudinaryData?.error?.message || 'Cloudinary upload failed.')
  }

  try {
    const registered = await registerMedia({
      publicId: cloudinaryData.public_id,
      secureUrl: cloudinaryData.secure_url,
      resourceType: cloudinaryData.resource_type || resourceType,
      folder: uploadData.folder,
      originalFilename: cloudinaryData.original_filename,
      format: cloudinaryData.format,
      bytes: cloudinaryData.bytes,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      duration: cloudinaryData.duration,
    })

    return registered.data.media
  } catch (error) {
    // If DB registration fails, remove the just-uploaded Cloudinary asset so
    // an unsuccessful Home upload does not leave an orphaned asset.
    try {
      await fetch(
        `https://api.cloudinary.com/v1_1/${uploadData.cloudName}/${resourceType}/destroy`,
        { method: 'POST' },
      )
    } catch {
      // Server-side cleanup remains available through the media manager.
    }
    throw error
  }
}
