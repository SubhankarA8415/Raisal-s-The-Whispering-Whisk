export function isBuyGetOffer(productOrVariant) {
  return productOrVariant?.offerType === 'buy_get' || productOrVariant?.offerKind === 'buy_get'
}

export function getFreeQuantity(quantity, buyQuantity, freeQuantity) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0))
  const buy = Math.max(1, Math.floor(Number(buyQuantity) || 1))
  const free = Math.max(0, Math.floor(Number(freeQuantity) || 0))
  if (!free || qty < buy + free) return 0
  return Math.floor(qty / (buy + free)) * free
}

export function getPayableQuantity(quantity, buyQuantity, freeQuantity) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0))
  return qty - getFreeQuantity(qty, buyQuantity, freeQuantity)
}

export function getBuyGetLabel(buyQuantity, freeQuantity) {
  const buy = Math.max(1, Math.floor(Number(buyQuantity) || 1))
  const free = Math.max(1, Math.floor(Number(freeQuantity) || 1))
  return `BUY ${buy} GET ${free} FREE`
}

export function getOfferTotal(item) {
  const unitPrice = Number(item?.price) || 0
  if (!isBuyGetOffer(item)) return unitPrice * Math.max(0, Number(item?.quantity) || 0)
  return unitPrice * getPayableQuantity(item.quantity, item.buyQuantity, item.freeQuantity)
}
