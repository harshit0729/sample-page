/**
 * Pure CIN slicing. This module does not decide whether a CIN is valid; it only
 * returns the six blocks at their fixed positions. Keeping extraction separate
 * means the UI can still show a useful partial trace for a 20- or 22-character
 * input.
 */

export const CIN_SEGMENTS = Object.freeze([
  { key: 'listing', label: 'Listing status', positions: '1', start: 0, end: 1 },
  { key: 'industry', label: 'Industry code', positions: '2–6', start: 1, end: 6 },
  { key: 'state', label: 'State / jurisdiction', positions: '7–8', start: 6, end: 8 },
  { key: 'year', label: 'Year of incorporation', positions: '9–12', start: 8, end: 12 },
  { key: 'category', label: 'Company category', positions: '13–15', start: 12, end: 15 },
  { key: 'registration', label: 'ROC registration no.', positions: '16–21', start: 15, end: 21 },
])

export function normalizeCIN(raw) {
  return String(raw ?? '').trim().toUpperCase()
}

export function decodeCIN(raw) {
  const original = String(raw ?? '')
  const normalized = normalizeCIN(raw)

  return {
    original,
    normalized,
    listingCode: normalized.slice(0, 1),
    industryCode: normalized.slice(1, 6),
    stateCode: normalized.slice(6, 8),
    yearCode: normalized.slice(8, 12),
    categoryCode: normalized.slice(12, 15),
    registrationNumber: normalized.slice(15, 21),
    extraSuffix: normalized.length > 21 ? normalized.slice(21) : '',
    segments: CIN_SEGMENTS.map((segment) => ({
      ...segment,
      value: normalized.slice(segment.start, segment.end),
    })),
  }
}
