import { STATUS } from './constants'

export function resultStatusText(status) {
  if (status === STATUS.valid) return 'Valid format'
  if (status === STATUS.warning) return 'Valid format · review notes'
  return 'Invalid'
}

function valueOrFallback(result, value, fallback = 'Not decoded') {
  if (value !== null && value !== undefined && value !== '') return value
  return result.identifierKind === 'llpin' ? 'Not encoded in LLPIN' : fallback
}

/**
 * Human-readable text for the per-row copy action. Kept away from the React
 * components so the format can be unit-tested and reused.
 */
export function formatResultText(result) {
  const fields = result.fields
  const lines = [
    result.original.trim() || result.normalized,
    `Status: ${resultStatusText(result.status)}`,
    `Entity type: ${result.entityType}`,
    `Listing status: ${
      result.identifierKind === 'llpin'
        ? 'Not encoded in LLPIN'
        : valueOrFallback(result, fields.listingLabel)
    }`,
    `State: ${
      result.identifierKind === 'llpin'
        ? 'Not encoded in LLPIN'
        : fields.stateName
          ? `${fields.stateName} (${fields.stateCode})`
          : 'Not decoded'
    }`,
    `Incorporation year: ${
      result.identifierKind === 'llpin'
        ? 'Not encoded in LLPIN'
        : valueOrFallback(result, fields.year)
    }`,
    `Company type: ${valueOrFallback(result, fields.categoryLabel)}`,
    `Industry code: ${
      result.identifierKind === 'llpin'
        ? 'Not applicable to LLPIN'
        : fields.industryCode
          ? `${fields.industryCode} (NIC name not resolved)`
          : 'Not decoded'
    }`,
    `ROC registration number: ${
      result.identifierKind === 'llpin'
        ? 'Not applicable to LLPIN'
        : valueOrFallback(result, fields.registrationNumber)
    }`,
  ]

  if (result.identifierKind === 'llpin') {
    lines.push(`LLPIN prefix: ${valueOrFallback(result, fields.llpinPrefix)}`)
    lines.push(`LLPIN serial: ${valueOrFallback(result, fields.llpinSerial)}`)
  }

  if (result.normalization.changed) {
    lines.push(`Normalised identifier: ${result.normalized}`)
  }

  if (result.isDuplicate) {
    lines.push(
      `Duplicate: occurrence ${result.occurrence} of ${result.occurrences}${
        result.duplicateLineNumbers?.length
          ? ` (lines ${result.duplicateLineNumbers.join(', ')})`
          : ''
      }`,
    )
  }

  if (result.errors.length) {
    lines.push(`Errors: ${result.errors.map((error) => error.message).join(' | ')}`)
  }
  if (result.warnings.length) {
    lines.push(`Warnings: ${result.warnings.map((warning) => warning.message).join(' | ')}`)
  }

  lines.push(`Verification: ${result.verification} — ${result.verificationDetail}`)
  lines.push(`Decode: ${result.decodeSummary}`)

  return lines.join('\n')
}

function cleanTsvCell(value) {
  return String(value ?? '')
    .replace(/\t/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim()
}

/** Tab-separated output is friendlier than CSV when pasted into Excel/Sheets. */
export function formatAllResultsText(results) {
  const header = [
    'Identifier',
    'Entity',
    'Status',
    'Listing',
    'State',
    'Year',
    'Company type',
    'Details',
    'Verification',
  ]

  const rows = results.map((result) => {
    const fields = result.fields
    const detail =
      result.errors[0]?.message ||
      result.warnings[0]?.message ||
      (result.identifierKind === 'llpin'
        ? 'Valid shape; state and year not encoded'
        : 'Structure decoded')

    return [
      result.original.trim() || result.normalized,
      result.entityType,
      resultStatusText(result.status),
      result.identifierKind === 'llpin' ? 'Not encoded' : (fields.listingLabel ?? '—'),
      result.identifierKind === 'llpin'
        ? 'Not encoded'
        : fields.stateName
          ? `${fields.stateName} (${fields.stateCode})`
          : '—',
      result.identifierKind === 'llpin' ? 'Not encoded' : (fields.year ?? '—'),
      result.identifierKind === 'llpin' ? 'Not encoded' : (fields.categoryLabel ?? '—'),
      detail,
      result.verification,
    ]
  })

  return [header, ...rows]
    .map((row) => row.map(cleanTsvCell).join('\t'))
    .join('\n')
}
