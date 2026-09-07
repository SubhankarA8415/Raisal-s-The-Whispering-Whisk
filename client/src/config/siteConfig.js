const normalizeUrl = (value) => String(value || '').trim()

const normalizeWhatsAppNumber = (value) =>
  String(value || '').replace(/\D/g, '')

export const WHATSAPP_NUMBER = normalizeWhatsAppNumber(
  import.meta.env.VITE_WHATSAPP_NUMBER,
)

export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}`
  : ''

export const SOCIAL_LINKS = {
  instagram: normalizeUrl(import.meta.env.VITE_INSTAGRAM_URL),
  facebook: normalizeUrl(import.meta.env.VITE_FACEBOOK_URL),
  email: normalizeUrl(import.meta.env.VITE_EMAIL),
  swiggy: normalizeUrl(import.meta.env.VITE_SWIGGY_URL),
}