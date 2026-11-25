/**
 * Small, shared helpers used by both validators. Keeping normalisation in one
 * place ensures the CIN and LLPIN paths treat whitespace and case identically.
 */

export function normalizeIdentifier(value) {
  return String(value ?? '').trim().toUpperCase()
}

const CHARACTER_NAMES = {
  ' ': 'space',
  '\t': 'tab',
  '\n': 'newline',
  '\r': 'carriage return',
  '-': 'hyphen',
  '–': 'en dash',
  '—': 'em dash',
  '_': 'underscore',
  '.': 'full stop',
  ',': 'comma',
  '/': 'slash',
  '\\': 'backslash',
  "'": 'apostrophe',
  '"': 'double quote',
  '’': 'curly apostrophe',
  '‘': 'left curly quote',
  '“': 'left curly quote',
  '”': 'right curly quote',
}

export function describeCharacter(character) {
  if (CHARACTER_NAMES[character]) return CHARACTER_NAMES[character]
  if (/\s/.test(character)) return 'whitespace'
  const codePoint = character.codePointAt(0)
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
}

/** Returns unique unexpected characters, preserving their first-seen order. */
export function getUnexpectedCharacters(value, allowed = /[A-Z0-9]/) {
  const seen = new Set()
  const unexpected = []
  for (const character of String(value)) {
    if (!allowed.test(character) && !seen.has(character)) {
      seen.add(character)
      unexpected.push(character)
    }
  }
  return unexpected
}

export function describeCharacterList(characters) {
  const names = characters.map(describeCharacter)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

export function buildNormalization(raw, normalized) {
  const original = String(raw ?? '')
  const trimmed = original.trim()
  return {
    original,
    normalized,
    wasTrimmed: original !== trimmed,
    wasLowercased: /[a-z]/.test(trimmed),
    changed: original !== normalized,
  }
}

export function makeCheck(id, label, status, detail) {
  return { id, label, status, detail }
}

export function isAllDigits(value) {
  return /^[0-9]+$/.test(value)
}

export function isAllLetters(value) {
  return /^[A-Z]+$/.test(value)
}

export function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function displayOrDash(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value)
}
