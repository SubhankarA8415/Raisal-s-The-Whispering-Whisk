export const API_ERROR_EVENT = 'raisals:api-error'

export function dispatchApiError(error) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(API_ERROR_EVENT, {
      detail: error,
    }),
  )
}
