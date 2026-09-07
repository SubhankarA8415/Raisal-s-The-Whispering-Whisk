const AVATAR_IDS = Array.from(
  { length: 20 },
  (_, index) => `whisk${String(index).padStart(2, '0')}`,
)

export const AVATAR_IDS_LIST = Object.freeze(AVATAR_IDS)

export function isValidAvatarId(avatarId) {
  return typeof avatarId === 'string' && AVATAR_IDS.includes(avatarId)
}

export function getRandomAvatarId() {
  return AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)]
}
