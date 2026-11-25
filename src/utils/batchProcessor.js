import { MAX_IDENTIFIERS, STATUS } from './constants'
import { normalizeIdentifier } from './validationUtils'
import { detectIdentifierType, validateIdentifier } from './validateIdentifier'

export class BatchLimitError extends Error {
  constructor(count) {
    super(
      `This batch has ${count} identifiers. The limit is ${MAX_IDENTIFIERS} per run; nothing was processed.`,
    )
    this.name = 'BatchLimitError'
    this.count = count
    this.limit = MAX_IDENTIFIERS
  }
}

/** Split into non-blank lines, preserving the original line number. */
export function getInputLines(text) {
  return String(text ?? '')
    .split(/\r?\n/)
    .map((raw, index) => ({ raw, lineNumber: index + 1 }))
    .filter((line) => line.raw.trim() !== '')
}

export function getInputStats(text) {
  const source = String(text ?? '')
  const totalLines = source.length ? source.split(/\r?\n/).length : 0
  const lines = getInputLines(source)
  const counts = new Map()
  let cinCount = 0
  let llpCount = 0
  let unknownCount = 0

  for (const line of lines) {
    const key = normalizeIdentifier(line.raw)
    counts.set(key, (counts.get(key) ?? 0) + 1)

    const type = detectIdentifierType(line.raw)
    if (type === 'CIN') cinCount += 1
    else if (type === 'LLP') llpCount += 1
    else unknownCount += 1
  }

  let duplicateGroups = 0
  for (const count of counts.values()) {
    if (count > 1) duplicateGroups += 1
  }

  return {
    totalLines,
    identifiers: lines.length,
    unique: counts.size,
    duplicates: lines.length - counts.size,
    duplicateGroups,
    cinCount,
    llpCount,
    unknownCount,
    overLimit: lines.length > MAX_IDENTIFIERS,
    remainingCapacity: Math.max(0, MAX_IDENTIFIERS - lines.length),
  }
}

/**
 * Validate a batch and annotate duplicates. Every non-blank line is kept in
 * the result set; duplicates are marked rather than silently removed, so the
 * summary counts always add up to what the user pasted.
 */
export function processBatch(text) {
  const lines = getInputLines(text)
  if (lines.length > MAX_IDENTIFIERS) {
    throw new BatchLimitError(lines.length)
  }

  const counts = new Map()
  const lineNumbersByKey = new Map()
  for (const line of lines) {
    const key = normalizeIdentifier(line.raw)
    counts.set(key, (counts.get(key) ?? 0) + 1)
    const lineNumbers = lineNumbersByKey.get(key) ?? []
    lineNumbers.push(line.lineNumber)
    lineNumbersByKey.set(key, lineNumbers)
  }

  const seen = new Map()
  const results = lines.map((line) => {
    const result = validateIdentifier(line.raw)
    const key = result.normalized
    const occurrence = (seen.get(key) ?? 0) + 1
    seen.set(key, occurrence)
    const occurrences = counts.get(key) ?? 1

    return {
      ...result,
      id: `row-${line.lineNumber}`,
      lineNumber: line.lineNumber,
      occurrence,
      occurrences,
      isDuplicate: occurrences > 1,
      duplicateLineNumbers: occurrences > 1 ? lineNumbersByKey.get(key) : [],
    }
  })

  const stats = {
    total: results.length,
    valid: results.filter((result) => result.status !== STATUS.invalid).length,
    validOnly: results.filter((result) => result.status === STATUS.valid).length,
    warnings: results.filter((result) => result.status === STATUS.warning).length,
    invalid: results.filter((result) => result.status === STATUS.invalid).length,
    companies: results.filter((result) => result.identifierKind === 'cin').length,
    llps: results.filter((result) => result.identifierKind === 'llpin').length,
    unknown: results.filter((result) => result.identifierKind === 'unknown').length,
    duplicateLines: results.filter((result) => result.isDuplicate).length,
    duplicateGroups: new Set(
      results.filter((result) => result.isDuplicate).map((result) => result.normalized),
    ).size,
    normalisedCount: results.filter((result) => result.normalization.changed).length,
  }

  return {
    results,
    stats,
    inputStats: getInputStats(text),
    processedAt: new Date(),
  }
}
