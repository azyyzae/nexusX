import { KEY_VALID, KEY_EXISTS, KEY_NOT_FOUND, KEY_INVALID, KEY_EXPIRED } from './wordlists'

export function generateKey() {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  return `NX-${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}`
}

export function generateToken() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 32)
}

export function pickRandomWord(words) {
  return words[Math.floor(Math.random() * words.length)]
}

export function getStatusWord(status) {
  switch (status) {
    case 'active': return pickRandomWord(KEY_VALID)
    case 'used': return pickRandomWord(KEY_EXISTS)
    case 'not_found': return pickRandomWord(KEY_NOT_FOUND)
    case 'invalid': return pickRandomWord(KEY_INVALID)
    case 'expired': return pickRandomWord(KEY_EXPIRED)
    default: return pickRandomWord(KEY_INVALID)
  }
}

export function isValidKeyFormat(key) {
  return /^NX-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}$/i.test(key)
}
