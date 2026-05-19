import { KEY_VALID, KEY_EXPIRED } from './wordlists'

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

export function isValidKeyFormat(key) {
  return /^NX-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}$/i.test(key)
}
