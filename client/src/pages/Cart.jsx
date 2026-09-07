import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/common/Container'
import Button from '../components/common/Button'
import { useCart } from '../context/CartContext.jsx'
import { useBakery } from '../context/BakeryContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useError } from '../context/ErrorContext.jsx'
import { getFreeQuantity, getOfferTotal, isBuyGetOffer } from '../components/menu/offerPricing.js'
import { WHATSAPP_NUMBER } from '../config/siteConfig.js'

function Cart() {
  const { user } = useAuth()
  const { showError } = useError()
  const { items, count, total, updateQuantity, removeItem, clearCart, whatsappMessage } = useCart()
  const { isClosed, refresh: refreshBakery } = useBakery()
  const savedAddress = user?.deliveryAddress ?? user?.delivery_address ?? ''
  const savedPincode = user?.deliveryPincode ?? user?.delivery_pincode ?? ''
  const [useSavedAddress, setUseSavedAddress] = useState(Boolean(savedAddress && savedPincode))
  const [address, setAddress] = useState(savedAddress)
  const [pincode, setPincode] = useState(savedPincode)

  useEffect(() => {
    setAddress(savedAddress)
    setPincode(savedPincode)
    setUseSavedAddress(Boolean(savedAddress && savedPincode))
  }, [savedAddress, savedPincode])

  const savings = items.reduce((sum, item) => {
    if (isBuyGetOffer(item)) return sum + getFreeQuantity(item.quantity, item.buyQuantity, item.freeQuantity) * Number(item.price || 0)
    return sum + Math.max(0, Number(item.originalPrice || item.price) - Number(item.price)) * item.quantity
  }, 0)

  async function send() {
    if (!items.length) return
    try {
      const latest = await refreshBakery()
      if (latest?.closure?.isClosed) return
    } catch (error) {
      showError(error)
      return
    }
    if (!WHATSAPP_NUMBER) {
      showError(new Error('WhatsApp ordering is currently unavailable. Please contact the bakery directly.'))
      return
    }
    const selectedAddress = useSavedAddress ? savedAddress : address.trim()
    const selectedPincode = useSavedAddress ? savedPincode : pincode.trim()

    if (!selectedAddress || !selectedPincode) {
      showError(new Error('Please provide your complete delivery address and 6-digit pincode before placing the WhatsApp order.'))
      return
    }

    if (!/^\d{6}$/.test(selectedPincode)) {
      showError(new Error('Pincode must be exactly 6 digits.'))
      return
    }

    const message = whatsappMessage(items, { address: selectedAddress, pincode: selectedPincode })
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-5xl">
          <Link to="/menu" className="text-sm font-semibold text-[var(--color-primary)]">← Continue browsing</Link>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Your Sweet Order</p><h1 className="mt-2 text-5xl">Cart</h1></div>
            {count > 0 && <button onClick={clearCart} className="text-sm opacity-60 hover:opacity-100">Clear cart</button>}
          </div>

          {items.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center"><span className="text-5xl">🧁</span><h2 className="mt-4 font-serif text-3xl">Your cart is waiting for something sweet.</h2><Link to="/menu"><Button className="mt-7">Explore Menu</Button></Link></div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-3">
                {items.map((item) => (
                  <article key={item.key} className="bakery-card rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div><h3 className="font-serif text-2xl">{item.productName}</h3><p className="mt-1 text-sm opacity-60">{item.variantLabel}{item.weight ? ` · ${item.weight}` : ''}{item.serves ? ` · Serves ${item.serves}` : ''}</p><div className="mt-2 flex flex-wrap items-center gap-2"><p className="font-semibold text-[var(--color-primary)]">₹{Number(item.price).toFixed(0)}</p>{item.originalPrice > item.price && <span className="text-xs line-through opacity-45">₹{Number(item.originalPrice).toFixed(0)}</span>}{item.offerLabel && <span className="rounded-full bg-[var(--color-accent)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-secondary)]">{item.offerLabel}</span>}{isBuyGetOffer(item) && <span className="basis-full text-xs font-medium text-[var(--color-secondary)]">{getFreeQuantity(item.quantity, item.buyQuantity, item.freeQuantity)} free · Payable total ₹{getOfferTotal(item).toFixed(0)}</span>}</div></div>
                      <div className="flex items-center gap-3"><button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="h-9 w-9 rounded-full border">−</button><span className="w-6 text-center font-semibold">{item.quantity}</span><button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="h-9 w-9 rounded-full border">+</button><button onClick={() => removeItem(item.key)} className="ml-2 text-sm opacity-50 hover:opacity-100">Remove</button></div>
                    </div>
                  </article>
                ))}

                <section className="bakery-card rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
                  <div className="rounded-2xl border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">Delivery Information</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Delivery is available within our serviceable areas. Delivery charges may be applied and may vary depending on the delivery area and distance. Please provide your complete address and pincode; our team will confirm delivery availability, charges, and details with you on WhatsApp.</p>
                  </div>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">Delivery Address</p><h2 className="mt-1 font-serif text-2xl">Where should we deliver?</h2></div>
                    {savedAddress && savedPincode && <button type="button" onClick={() => setUseSavedAddress((current) => !current)} className="text-sm font-semibold text-[var(--color-primary)]">{useSavedAddress ? 'Use another address' : 'Use saved address'}</button>}
                  </div>

                  {useSavedAddress && savedAddress && savedPincode ? (
                    <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 text-sm leading-6"><p>{savedAddress}</p><p className="mt-1 font-semibold text-[var(--color-primary)]">Pincode: {savedPincode}</p><p className="mt-3 text-xs opacity-60">Using the address saved in your account.</p></div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={4} maxLength={500} placeholder="Enter your complete delivery address" className="w-full resize-y rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]" />
                      <input type="text" inputMode="numeric" value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="6-digit pincode" className="w-full max-w-xs rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 outline-none transition focus:border-[var(--color-primary)]" />
                      <p className="text-xs leading-5 text-[var(--color-text-muted)]">💡 Save your address in your Account for faster ordering next time. You can still enter a different address here for this order.</p>
                    </div>
                  )}
                </section>
              </div>

              <aside className="h-fit rounded-[var(--radius-card)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)] p-6 text-white shadow-[var(--shadow-soft)]"><p className="text-xs uppercase tracking-widest text-white/60">Order summary</p><div className="mt-6 flex justify-between text-sm"><span>{count} item{count === 1 ? '' : 's'}</span><span>₹{total.toFixed(0)}</span></div>{savings > 0 && <div className="mt-3 flex justify-between text-sm text-white/80"><span>You save</span><span>₹{savings.toFixed(0)}</span></div>}<div className="mt-5 border-t border-white/20 pt-5"><p className="text-sm leading-6 text-white/75">We'll prepare a ready-to-send WhatsApp message with every product, variant, quantity and delivery address.</p><p className="mt-3 text-xs leading-5 text-white/70">Please note: sending the WhatsApp message is an order request, not a confirmed order. Our team will confirm availability and delivery details with you on WhatsApp.</p>{isClosed && <div className="mb-4 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 p-3 text-xs leading-5 text-white/85">Online ordering is currently unavailable while the bakery is closed. WhatsApp and Contact remain available.</div>}<Button variant="accent" className="mt-5 w-full" disabled={isClosed} onClick={send}>{isClosed ? 'Ordering Currently Unavailable' : 'Order on WhatsApp'}</Button></div></aside>
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}

export default Cart