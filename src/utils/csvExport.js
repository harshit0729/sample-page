import { STATUS } from './constants'

const CSV_COLUMNS = [
  'Line',
  'Original identifier',
  'Normalised identifier',
  'Entity type',
  'Validation status',
  'Listing status',
  'State code',
  'State',
  'Incorporation year',
  'Company type',
  'Category code',
  'Industry code',
  'ROC registration number',
  'Verification',
  'Errors',
  'Warnings',
  'Occurrences',
  'Decode summary',
]

function statusText(status) {
  if (status === STATUS.valid) return 'Valid format'
  if (status === STATUS.warning) return 'Valid format - review notes'
  return 'Invalid'
}

function notEncoded(result, value) {
  if (value !== null && value !== undefined && value !== '') return value
  return result.identifierKind === 'llpin' ? 'Not encoded in LLPIN' : ''
}

/**
 * Escape a CSV cell, including spreadsheet-formula injection protection.
 * Values beginning with =, +, -, @, tab or carriage return are prefixed with
 * an apostrophe so Excel/Sheets do not execute them as formulas.
 */
export function escapeCsvValue(value) {
  if (value === null || value === undefined) return ''
  let string = String(value)
  const isFormula = /^[=+\-@\t\r]/.test(string)

  if (isFormula) {
    string = `'${string}`
  }

  const needsQuotes =
    isFormula ||
    /[",\r\n]/.test(string) ||
    /^\s|\s$/.test(string) ||
    string.includes('\u0000')

  if (!needsQuotes) return string
  return `"${string.replace(/"/g, '""')}"`
}

export function buildCsv(results) {
  const rows = results.map((result) => {
    const fields = result.fields
    const state = fields.stateName
      ? `${fields.stateName} (${fields.stateCode})`
      : notEncoded(result, '')

    return [
      result.lineNumber,
      result.original.trim() || result.normalized,
      result.normalized,
      result.entityType,
      statusText(result.status),
      result.identifierKind === 'llpin'
        ? 'Not encoded in LLPIN'
        : (fields.listingLabel ?? ''),
      fields.stateCode ?? '',
      state,
      fields.year ?? (result.identifierKind === 'llpin' ? 'Not encoded in LLPIN' : ''),
      notEncoded(result, fields.categoryLabel),
      fields.categoryCode ?? '',
      fields.industryCode ?? '',
      fields.registrationNumber ?? '',
      result.verification,
      result.errors.map((error) => error.message).join(' | '),
      result.warnings.map((warning) => warning.message).join(' | '),
      result.occurrences ?? 1,
      result.decodeSummary,
    ]
  })

  return [CSV_COLUMNS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n')
}

export function csvFilename(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
  return `filesure-cin-llpin-check-${stamp}.csv`
}

export function downloadResultsCsv(results, filename = csvFilename()) {
  if (typeof document === 'undefined') return
  const csv = buildCsv(results)
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
