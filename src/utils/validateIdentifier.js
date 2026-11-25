import { validateCIN } from './cinValidator'
import { validateLLPIN } from './llpinValidator'
import {
  ENTITY_TYPE,
  STATUS,
  VERIFICATION_DETAIL,
  VERIFICATION_LABEL,
} from './constants'
import { buildNormalization, makeCheck, normalizeIdentifier } from './validationUtils'

/**
 * Identify the family before validating. This is deliberately tolerant of
 * broken input so the UI can explain *why* something is broken rather than
 * dumping every malformed row into a generic error.
 */
export function detectIdentifierType(raw) {
  const normalized = normalizeIdentifier(raw)
  if (!normalized) return 'unknown'

  // Three letters then some kind of separator strongly suggests an LLPIN,
  // including wrong separators and missing/extra digits.
  if (/^[A-Z]{3}[-–—_]/.test(normalized)) return 'LLP'

  // A missing hyphen (AAA1234) still looks like an LLPIN attempt.
  if (/^[A-Z]{3}[0-9]{4,5}$/.test(normalized)) return 'LLP'

  // A wrong character in place of the hyphen (AAA_1234, AAA 1234).
  if (/^[A-Z]{3}.[0-9]{4}$/.test(normalized)) return 'LLP'

  if (/^[A-Z]{3}-[0-9]{4}$/.test(normalized)) return 'LLP'

  // CINs are 21 characters. Include near-misses so length errors are precise.
  if (normalized.length === 21) return 'CIN'
  if (/^[LU]/.test(normalized) && normalized.length >= 12 && normalized.length <= 24) {
    return 'CIN'
  }
  if (normalized.length >= 18 && normalized.length <= 23 && /^[A-Z0-9]/.test(normalized)) {
    return 'CIN'
  }

  return 'unknown'
}

const EMPTY_FIELDS = {
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
  categoryShortLabel: null,
  registrationNumber: null,
  llpinPrefix: null,
  llpinSerial: null,
  extraSuffix: null,
}

function validateUnknownIdentifier(raw) {
  const original = String(raw ?? '')
  const normalized = normalizeIdentifier(raw)

  return {
    type: 'UNKNOWN',
    identifierKind: 'unknown',
    entityType: ENTITY_TYPE.unknown,
    original,
    normalized,
    status: STATUS.invalid,
    errors: [
      {
        code: 'UNRECOGNISED_IDENTIFIER',
        message:
          'Unrecognised identifier. Expected a 21-character CIN or an LLPIN such as AAB-4321. Foreign companies use an FCRN, which is outside this checker.',
      },
    ],
    warnings: [],
    notes: [
      'A CIN belongs to a company; an LLPIN belongs to a limited liability partnership. Other MCA identifiers, such as an FCRN or FLLPIN, have different formats.',
    ],
    checks: [
      makeCheck(
        'family',
        'Identifier family',
        'fail',
        `Found ${normalized.length || 0} characters, not a recognisable CIN or LLPIN shape.`,
      ),
    ],
    segments: [],
    fields: { ...EMPTY_FIELDS },
    summary: 'Not a recognised CIN or LLPIN.',
    decodeSummary:
      'No CIN or LLPIN structure was recognised. Remove surrounding words or punctuation, or check whether this is a different MCA identifier.',
    verification: VERIFICATION_LABEL,
    verificationDetail: VERIFICATION_DETAIL,
    normalization: buildNormalization(original, normalized),
  }
}

export function validateIdentifier(raw) {
  const type = detectIdentifierType(raw)
  if (type === 'CIN') return validateCIN(raw)
  if (type === 'LLP') return validateLLPIN(raw)
  return validateUnknownIdentifier(raw)
}
