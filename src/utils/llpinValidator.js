import {
  ENTITY_TYPE,
  STATUS,
  VERIFICATION_DETAIL,
  VERIFICATION_LABEL,
} from './constants'
import {
  buildNormalization,
  describeCharacterList,
  getUnexpectedCharacters,
  makeCheck,
  normalizeIdentifier,
} from './validationUtils'

const LLPIN_LENGTH = 8

export function normalizeLLPIN(raw) {
  return normalizeIdentifier(raw)
}

/**
 * Extract the three visible LLPIN blocks. The prefix is a series marker, not a
 * state or year code; this decoder deliberately does not invent a meaning for
 * it beyond "the first three letters".
 */
export function decodeLLPIN(raw) {
  const original = String(raw ?? '')
  const normalized = normalizeLLPIN(raw)
  const hasExpectedSeparator = normalized[3] === '-'
  const serialStart = hasExpectedSeparator ? 4 : 3
  const serial = normalized.slice(serialStart, serialStart + 4)
  const extraSuffix =
    normalized.length > serialStart + 4 ? normalized.slice(serialStart + 4) : ''

  const segments = [
    {
      key: 'prefix',
      label: 'Series prefix',
      positions: '1–3',
      value: normalized.slice(0, 3),
    },
    {
      key: 'separator',
      label: 'Separator',
      positions: '4',
      value: normalized.slice(3, 4),
    },
    {
      key: 'serial',
      label: 'Serial number',
      positions: `${serialStart + 1}–${serialStart + 4}`,
      value: serial,
    },
  ]

  if (extraSuffix) {
    segments.push({
      key: 'extra',
      label: 'Extra characters',
      positions: `${serialStart + 5}+`,
      value: extraSuffix,
    })
  }

  return {
    original,
    normalized,
    prefix: normalized.slice(0, 3),
    separator: normalized.slice(3, 4),
    serial,
    extraSuffix,
    segments,
  }
}

/**
 * Validate the real-world LLPIN shape: three letters, one hyphen, four digits
 * (AAB-4321). There is no check digit in an LLPIN, so this can only confirm
 * syntax. Existence and status require the MCA register.
 */
export function validateLLPIN(raw) {
  const decoded = decodeLLPIN(raw)
  const errors = []
  const warnings = []
  const notes = []
  const checks = []

  const addError = (code, message) => errors.push({ code, message })
  const addWarning = (code, message) => warnings.push({ code, message })

  const lengthOk = decoded.normalized.length === LLPIN_LENGTH
  checks.push(
    makeCheck(
      'length',
      '8-character length',
      lengthOk ? 'pass' : 'fail',
      lengthOk
        ? 'Three letters, hyphen and four digits.'
        : `${decoded.normalized.length} characters found; ${LLPIN_LENGTH} expected including the hyphen.`,
    ),
  )

  const unexpectedCharacters = getUnexpectedCharacters(decoded.normalized, /[A-Z0-9-]/)
  const charactersOk = unexpectedCharacters.length === 0
  checks.push(
    makeCheck(
      'characters',
      'Allowed characters',
      charactersOk ? 'pass' : 'fail',
      charactersOk
        ? 'A–Z, 0–9 and a plain hyphen.'
        : `Unexpected: ${describeCharacterList(unexpectedCharacters)}.`,
    ),
  )
  if (!charactersOk) {
    addError(
      'INVALID_CHARACTERS',
      `Invalid character${unexpectedCharacters.length === 1 ? '' : 's'}: ${describeCharacterList(
        unexpectedCharacters,
      )}. Use uppercase letters, digits and a plain hyphen.`,
    )
  }

  const prefixOk = /^[A-Z]{3}$/.test(decoded.prefix)
  checks.push(
    makeCheck(
      'prefix',
      'Three-letter prefix',
      prefixOk ? 'pass' : 'fail',
      prefixOk
        ? `${decoded.prefix} (series prefix; not a state/year code).`
        : `Expected three letters; found "${decoded.prefix || 'nothing'}".`,
    ),
  )
  if (!prefixOk) {
    addError(
      'INVALID_PREFIX',
      `LLPIN must begin with three letters; found "${decoded.prefix || 'nothing'}".`,
    )
  }

  const separatorOk = decoded.separator === '-'
  let separatorDetail = 'Required hyphen after the first three letters.'
  if (!separatorOk) {
    if (!decoded.separator) {
      separatorDetail = 'Missing hyphen after the first three letters.'
    } else if (decoded.separator === '–' || decoded.separator === '—') {
      separatorDetail = 'Wrong dash character; use a plain hyphen (-).'
    } else {
      separatorDetail = `Expected a hyphen (-); found "${decoded.separator}".`
    }
  }
  checks.push(
    makeCheck('separator', 'Separator', separatorOk ? 'pass' : 'fail', separatorDetail),
  )
  if (!separatorOk) {
    addError(
      'INVALID_SEPARATOR',
      decoded.separator
        ? `The fourth character must be a plain hyphen (-); found "${decoded.separator}".`
        : 'Missing separator: write the LLPIN as three letters, a hyphen, then four digits (e.g. AAB-4321).',
    )
  }

  const serialOk = /^[0-9]{4}$/.test(decoded.serial)
  const serialAllZero = serialOk && decoded.serial === '0000'
  checks.push(
    makeCheck(
      'serial',
      'Four-digit serial',
      serialOk ? (serialAllZero ? 'warn' : 'pass') : 'fail',
      serialOk
        ? `${decoded.serial}${serialAllZero ? ' · 0000 is not a plausible assigned serial.' : '.'}`
        : `Expected four digits; found "${decoded.serial || 'nothing'}".`,
    ),
  )
  if (!serialOk) {
    addError(
      'INVALID_SERIAL',
      `LLPIN must end with four digits; found "${decoded.serial || 'nothing'}".`,
    )
  } else if (serialAllZero) {
    addWarning(
      'IMPLAUSIBLE_SERIAL',
      'Serial 0000 is structurally valid but is not a plausible assigned LLPIN serial.',
    )
  }

  if (!lengthOk) {
    addError(
      'INVALID_LENGTH',
      `Incorrect length: ${decoded.normalized.length} characters found; an LLPIN has 8 including the hyphen (three letters + hyphen + four digits).`,
    )
  }

  const status = errors.length
    ? STATUS.invalid
    : warnings.length
      ? STATUS.warning
      : STATUS.valid

  const segmentReadings = {
    prefix: prefixOk ? 'Series prefix; no state or year encoded' : 'Expected three letters',
    separator: separatorOk ? 'Required hyphen' : 'Missing or incorrect separator',
    serial: serialOk ? 'Four-digit serial; no check digit' : 'Expected four digits',
    extra: 'Not part of an LLPIN',
  }
  const segmentStatuses = {
    prefix: prefixOk ? 'pass' : 'fail',
    separator: separatorOk ? 'pass' : 'fail',
    serial: serialOk ? (serialAllZero ? 'warn' : 'pass') : 'fail',
    extra: 'fail',
  }
  const segments = decoded.segments.map((segment) => ({
    ...segment,
    reading: segmentReadings[segment.key],
    status: segmentStatuses[segment.key],
  }))

  notes.push(
    'An LLPIN encodes only a three-letter series prefix and a four-digit serial. State, year of incorporation and LLP class are not encoded.',
  )
  notes.push(
    'LLPINs have no check digit or checksum. A clean format result does not prove that the LLP exists or is active.',
  )

  const summary = errors.length
    ? `Partial LLPIN decode${decoded.prefix || decoded.serial ? ` — ${decoded.prefix || '—'} / ${decoded.serial || '—'}` : ''}.`
    : 'LLP · prefix and serial only'

  const decodeSummary = errors.length
    ? `This LLPIN does not match the required three-letters + hyphen + four-digits shape. ${errors.length} structural ${
        errors.length === 1 ? 'check' : 'checks'
      } failed.`
    : 'A structurally valid LLPIN: three letters, a hyphen and four digits. The identifier encodes a series prefix and serial only; state, year and LLP class are not encoded.'

  return {
    type: 'LLPIN',
    identifierKind: 'llpin',
    entityType: ENTITY_TYPE.llp,
    original: decoded.original,
    normalized: decoded.normalized,
    status,
    errors,
    warnings,
    notes,
    checks,
    segments,
    fields: {
      listingCode: null,
      listingLabel: null,
      industryCode: null,
      stateCode: null,
      stateName: null,
      stateKind: null,
      stateStatus: null,
      year: null,
      yearCode: null,
      categoryCode: null,
      categoryLabel: null,
      categoryShortLabel: 'Not encoded in LLPIN',
      registrationNumber: null,
      llpinPrefix: prefixOk ? decoded.prefix : null,
      llpinSerial: serialOk ? decoded.serial : null,
      extraSuffix: decoded.extraSuffix || null,
    },
    summary,
    decodeSummary,
    verification: VERIFICATION_LABEL,
    verificationDetail: VERIFICATION_DETAIL,
    normalization: buildNormalization(decoded.original, decoded.normalized),
  }
}
