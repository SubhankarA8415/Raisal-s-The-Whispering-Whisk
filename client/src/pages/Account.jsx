import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'
import Container from '../components/common/Container'
import { useAuth } from '../context/AuthContext'
import { getAvatarCatalog, updateCurrentUser } from '../services/authService'

function Account() {
  const navigate = useNavigate()

  const {
    user,
    logout,
    setUser,
  } = useAuth()

  const [editingName, setEditingName] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [name, setName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState(user.deliveryAddress ?? user.delivery_address ?? '')
  const [deliveryPincode, setDeliveryPincode] = useState(user.deliveryPincode ?? user.delivery_pincode ?? '')
  const [saving, setSaving] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [avatars, setAvatars] = useState([])
  const [avatarLoading, setAvatarLoading] = useState(true)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [avatarImageError, setAvatarImageError] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAvatars() {
      try {
        setAvatarLoading(true)
        const response = await getAvatarCatalog()

        if (active) {
          setAvatars(response.data.avatars ?? [])
        }
      } catch (nextError) {
        if (active) {
          setError(nextError.message || 'Unable to load profile avatars.')
        }
      } finally {
        if (active) {
          setAvatarLoading(false)
        }
      }
    }

    loadAvatars()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setAvatarImageError(false)
  }, [user.avatarUrl])

  useEffect(() => {
    if (!avatarPickerOpen) {
      return undefined
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setAvatarPickerOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [avatarPickerOpen])

  if (!user) {
    return null
  }

  const isAdmin =
    user.user_type === 'admin'

  const isAuthorizedAdmin =
    isAdmin &&
    user.is_authorized === true

  function startEditing() {
    setName(user.name)
    setError('')
    setEditingName(true)
  }

  function startEditingAddress() {
    setDeliveryAddress(user.deliveryAddress ?? user.delivery_address ?? '')
    setDeliveryPincode(user.deliveryPincode ?? user.delivery_pincode ?? '')
    setError('')
    setEditingAddress(true)
  }

  function cancelEditingAddress() {
    setDeliveryAddress(user.deliveryAddress ?? user.delivery_address ?? '')
    setDeliveryPincode(user.deliveryPincode ?? user.delivery_pincode ?? '')
    setError('')
    setEditingAddress(false)
  }

  function cancelEditing() {
    setName(user.name)
    setError('')
    setEditingName(false)
  }

  async function handleSaveName(event) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Name is required.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await updateCurrentUser({
        name: trimmedName,
        deliveryAddress: user.deliveryAddress ?? user.delivery_address ?? '',
        deliveryPincode: user.deliveryPincode ?? user.delivery_pincode ?? '',
      })

      setUser(response.data.user)

      setEditingName(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAddress(event) {
    event.preventDefault()

    const trimmedAddress = deliveryAddress.trim()
    const trimmedPincode = deliveryPincode.trim()

    if (trimmedAddress && (trimmedAddress.length < 5 || trimmedAddress.length > 500)) {
      setError('Delivery address must be between 5 and 500 characters long.')
      return
    }

    if (trimmedPincode && !/^\d{6}$/.test(trimmedPincode)) {
      setError('Pincode must be exactly 6 digits.')
      return
    }

    if (trimmedPincode && !trimmedAddress) {
      setError('Please add your complete delivery address along with the pincode.')
      return
    }

    try {
      setSaving(true)
      setError('')
      const response = await updateCurrentUser({
        name: user.name,
        deliveryAddress: trimmedAddress,
        deliveryPincode: trimmedPincode,
      })
      setUser(response.data.user)
      setEditingAddress(false)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSelectAvatar(avatarId) {
    const currentAvatarId = user.avatarId ?? user.avatar_id ?? null

    if (savingAvatar || avatarId === currentAvatarId) {
      return
    }

    try {
      setSavingAvatar(true)
      setError('')

      const response = await updateCurrentUser({
        name: user.name,
        deliveryAddress: user.deliveryAddress ?? user.delivery_address ?? '',
        deliveryPincode: user.deliveryPincode ?? user.delivery_pincode ?? '',
        avatarId,
      })

      setUser(response.data.user)
      setAvatarPickerOpen(false)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handleLogout() {
    try {
      await logout()

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <main className="min-h-screen py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              className="group mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-background)] p-1 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[0_12px_30px_rgba(61,41,35,0.14)] sm:h-36 sm:w-36"
              aria-label="Choose your profile avatar"
            >
              {user.avatarUrl && !avatarImageError ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.name}'s profile avatar`}
                  className="h-full w-full rounded-full object-contain"
                  onError={() => setAvatarImageError(true)}
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-12 w-12 text-[var(--color-primary)] opacity-70 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.5 20c.9-3.5 3.5-5.5 7.5-5.5s6.6 2 7.5 5.5" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              className="mt-3 text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-75"
            >
              {user.avatarUrl ? 'Change your avatar' : 'Choose your avatar'}
            </button>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                My Account
              </p>

              <h1 className="text-4xl sm:text-5xl">
                Welcome, {user.name}
              </h1>

              <p className="mt-4 text-sm leading-6 opacity-70">
                Manage your Raisal's The Whispering Whisk account.
              </p>
            </div>
          </div>

          {/* Avatar Picker */}
          {avatarPickerOpen && (
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setAvatarPickerOpen(false)
                }
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="avatar-picker-title"
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      Profile Avatar
                    </p>
                    <h2 id="avatar-picker-title" className="mt-2 text-2xl sm:text-3xl">
                      Choose your avatar
                    </h2>
                    <p className="mt-2 text-sm opacity-65">
                      Pick one of the bakery's fixed avatars for your profile.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAvatarPickerOpen(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-lg opacity-70 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    aria-label="Close avatar picker"
                  >
                    ×
                  </button>
                </div>

                {avatarLoading ? (
                  <p className="mt-8 text-center text-sm opacity-60">Loading avatars...</p>
                ) : avatars.length > 0 ? (
                  <>
                    <div className="mt-7 grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-7">
                      {avatars.map((avatar) => {
                        const selected = avatar.id === (user.avatarId ?? user.avatar_id)

                        return (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => handleSelectAvatar(avatar.id)}
                            disabled={savingAvatar}
                            aria-label={selected ? `${avatar.id}, selected` : `Choose ${avatar.id}`}
                            aria-pressed={selected}
                            className={`group relative aspect-square overflow-hidden rounded-full border bg-[var(--color-background)] p-1 transition-all duration-300 ${
                              selected
                                ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30'
                                : 'border-[var(--color-border)] hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-soft)]'
                            } ${savingAvatar ? 'cursor-wait opacity-70' : ''}`}
                          >
                            <img
                              src={avatar.url}
                              alt=""
                              loading="lazy"
                              className="h-full w-full rounded-full object-contain"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none'
                              }}
                            />

                            {selected && (
                              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-surface)] bg-[var(--color-primary)] text-[10px] font-bold text-white">
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-7 flex flex-col items-center gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:justify-between">
                      <p className="text-xs opacity-55">
                        Your avatar is optional and can be removed anytime.
                      </p>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleSelectAvatar(null)}
                        disabled={savingAvatar || !(user.avatarId ?? user.avatar_id)}
                      >
                        Remove Avatar
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-8 text-center text-sm opacity-60">
                    Profile avatars are temporarily unavailable. You can try again later.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Account Card */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">

            <div className="grid gap-6 sm:grid-cols-2">

              {/* Name */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                    Name
                  </p>

                  {!editingName && (
                    <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-[var(--radius-button)] border border-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-soft)] active:translate-y-0 active:scale-[0.98]"
                    >
                    Edit
                    </button>
                  )}
                </div>

                {editingName ? (
                  <form
                    onSubmit={handleSaveName}
                    className="mt-2"
                  >
                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      autoFocus
                      maxLength={100}
                      className="w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]"
                    />

                    <div className="mt-3 flex gap-2">
                      <Button
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        disabled={saving}
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-2 font-medium">
                    {user.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                  Email
                </p>

                <p className="mt-2 break-all font-medium">
                  {user.email}
                </p>
              </div>

              {/* Account Type */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                  Account Type
                </p>

                <p className="mt-2 font-medium capitalize">
                  {user.user_type}
                </p>
              </div>

              {/* Email Status */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                  Email Status
                </p>

                <p className="mt-2 font-medium">
                  {user.email_verified
                    ? 'Verified'
                    : 'Not verified'}
                </p>
              </div>

              {/* Admin Authorization */}
              {isAdmin && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                    Admin Authorization
                  </p>

                  <p className="mt-2 font-medium">
                    {isAuthorizedAdmin
                      ? 'Authorized'
                      : 'Pending authorization'}
                  </p>
                </div>
              )}

              {/* Auth Provider */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                  Sign-in Method
                </p>

                <p className="mt-2 font-medium capitalize">
                  {user.auth_provider}
                </p>
              </div>

            </div>

            {/* Delivery Address */}
            <div className="mt-8 border-t border-[var(--color-border)] pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-50">Delivery Address</p>
                  <p className="mt-1 text-xs opacity-60">Optional. Save your complete address and pincode for faster delivery ordering.</p>
                </div>
                {!editingAddress && (
                  <button type="button" onClick={startEditingAddress} className="shrink-0 rounded-[var(--radius-button)] border border-[var(--color-primary)] px-4 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-all duration-300 hover:bg-[var(--color-primary)] hover:text-white">{(user.deliveryAddress ?? user.delivery_address) ? 'Edit' : 'Add Address'}</button>
                )}
              </div>

              {editingAddress ? (
                <form onSubmit={handleSaveAddress} className="mt-4 min-w-0 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Complete Address</label>
                    <textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} maxLength={500} rows={4} placeholder="House/Flat, Street, Area, City, State" className="mt-2 box-border block min-w-0 w-full max-w-full resize-y rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="max-w-xs">
                    <label className="text-xs font-semibold uppercase tracking-wider opacity-50">Pincode</label>
                    <input type="text" inputMode="numeric" value={deliveryPincode} onChange={(event) => setDeliveryPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="6-digit pincode" className="mt-2 w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</Button>
                    <Button type="button" variant="secondary" disabled={saving} onClick={cancelEditingAddress}>Cancel</Button>
                  </div>
                </form>
              ) : (user.deliveryAddress ?? user.delivery_address) ? (
                <div className="mt-4 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm leading-6">
                  <p>{user.deliveryAddress ?? user.delivery_address}</p>
                  <p className="mt-1 font-semibold text-[var(--color-primary)]">Pincode: {user.deliveryPincode ?? user.delivery_pincode}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm opacity-60">No delivery address saved yet. You can add one anytime for quicker WhatsApp ordering.</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-6 rounded-[var(--radius-button)] border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row">

              {isAuthorizedAdmin && (
                <Button
                  type="button"
                  onClick={() => navigate('/admin')}
                >
                  Admin Dashboard
                </Button>
              )}

              <Button
                type="button"
                variant="secondary"
                onClick={handleLogout}
                disabled={saving}
              >
                Logout
              </Button>

            </div>

          </div>

        </div>
      </Container>
    </main>
  )
}

export default Account