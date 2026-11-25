import { getCompanyType } from '../data/companyTypes'
import { getState, STATE_CODE_ALIASES } from '../data/stateCodes'
import { decodeCIN } from './cinDecoder'
import {
  CURRENT_YEAR,
  ENTITY_TYPE,
  MIN_INCORPORATION_YEAR,
  STATUS,
  VERIFICATION_DETAIL,
  VERIFICATION_LABEL,
} from './constants'
import {
  buildNormalization,
  describeCharacterList,
  getUnexpectedCharacters,
  makeCheck,
} from './validationUtils'

const CIN_LENGTH = 21

/**
 * Validate and decode a CIN.
 *
 * Design rule: every part is checked independently so a 20-character CIN still
 * gets a useful partial trace, while the overall status remains invalid. No
 * external service is called and no company existence claim is made.
 */
export function validateCIN(raw) {
  const decoded = decodeCIN(raw)
  const errors = []
  const warnings = []
  const notes = []
  const checks = []

  const addError = (code, message) => errors.push({ code, message })
  const addWarning = (code, message) => warnings.push({ code, message })

  const lengthOk = decoded.normalized.length === CIN_LENGTH
  const lengthDifference = decoded.normalized.length - CIN_LENGTH
  checks.push(
    makeCheck(
      'length',
      '21-character length',
      lengthOk ? 'pass' : 'fail',
      lengthOk
        ? 'All six blocks are present.'
        : `${decoded.normalized.length} characters found; ${CIN_LENGTH} expected${
            lengthDifference > 0
              ? ` (${lengthDifference} extra).`
              : ` (${Math.abs(lengthDifference)} missing).`
          }`,
    ),
  )
  if (!lengthOk) {
    addError(
      'INVALID_LENGTH',
      `Incorrect length: ${decoded.normalized.length} characters found; a CIN has exactly ${CIN_LENGTH}.`,
    )
  }

  const unexpectedCharacters = getUnexpectedCharacters(decoded.normalized)
  const charactersOk = unexpectedCharacters.length === 0
  checks.push(
    makeCheck(
      'characters',
      'Allowed characters',
      charactersOk ? 'pass' : 'fail',
      charactersOk
        ? 'A–Z and 0–9 only.'
        : `Unexpected: ${describeCharacterList(unexpectedCharacters)}.`,
    ),
  )
  if (!charactersOk) {
    addError(
      'INVALID_CHARACTERS',
      `Invalid character${unexpectedCharacters.length === 1 ? '' : 's'}: ${describeCharacterList(
        unexpectedCharacters,
      )}. A CIN uses only A–Z and 0–9; hyphens belong to LLPINs.`,
    )
  }

  const listingLabel =
    decoded.listingCode === 'L' ? 'Listed' : decoded.listingCode === 'U' ? 'Unlisted' : null
  const listingOk = listingLabel !== null
  checks.push(
    makeCheck(
      'listing',
      'Listing status',
      listingOk ? 'pass' : 'fail',
      listingOk
        ? `${listingLabel} (${decoded.listingCode}).`
        : `Expected L or U; found "${decoded.listingCode || 'nothing'}".`,
    ),
  )
  if (!listingOk) {
    addError(
      'INVALID_LISTING',
      `First character must be L (listed) or U (unlisted); found "${decoded.listingCode || 'nothing'}".`,
    )
  }

  const industryFormatOk = /^[0-9]{5}$/.test(decoded.industryCode)
  const industryAllZero = industryFormatOk && decoded.industryCode === '00000'
  checks.push(
    makeCheck(
      'industry',
      'Industry code',
      industryFormatOk ? (industryAllZero ? 'warn' : 'pass') : 'fail',
      industryFormatOk
        ? `${decoded.industryCode} · NIC sub-class (name not resolved).${
            industryAllZero ? ' All-zero is not a recognised NIC sub-class.' : ''
          }`
        : `Expected five digits; found "${decoded.industryCode || 'nothing'}".`,
    ),
  )
  if (!industryFormatOk) {
    addError(
      'INVALID_INDUSTRY',
      `Industry code must be five digits; found "${decoded.industryCode || 'nothing'}".`,
    )
  } else if (industryAllZero) {
    addWarning(
      'IMPLAUSIBLE_INDUSTRY',
      'Industry code 00000 is structurally numeric but is not a recognised NIC sub-class.',
    )
  }

  const stateFormatOk = /^[A-Z]{2}$/.test(decoded.stateCode)
  const state = stateFormatOk ? getState(decoded.stateCode) : null
  const stateAlias = stateFormatOk && !state ? STATE_CODE_ALIASES[decoded.stateCode] : null
  let stateCheckStatus = 'fail'
  let stateCheckDetail = `Expected two letters; found "${decoded.stateCode || 'nothing'}".`

  if (stateFormatOk && state) {
    stateCheckStatus = 'pass'
    stateCheckDetail = `${state.name}${state.status === 'legacy' ? ' (legacy code)' : ''}.`
    if (state.status === 'legacy' && state.note) notes.push(state.note)
  } else if (stateAlias) {
    stateCheckDetail = `"${decoded.stateCode}" is not an MCA CIN code; ${stateAlias.name} uses ${stateAlias.code}.`
  } else if (stateFormatOk) {
    stateCheckDetail = `Unrecognised state/jurisdiction code "${decoded.stateCode}".`
  }

  checks.push(makeCheck('state', 'State / jurisdiction', stateCheckStatus, stateCheckDetail))
  if (stateCheckStatus === 'fail') {
    addError(
      stateAlias ? 'STATE_ALIAS' : 'INVALID_STATE',
      stateAlias
        ? `State code "${decoded.stateCode}" is not used in MCA CINs. ${stateAlias.name} is represented by ${stateAlias.code}.`
        : stateFormatOk
          ? `State/jurisdiction code "${decoded.stateCode}" is not in the documented MCA CIN list.`
          : `State/jurisdiction code must be two letters; found "${decoded.stateCode || 'nothing'}".`,
    )
  }

  const yearFormatOk = /^[0-9]{4}$/.test(decoded.yearCode)
  const year = yearFormatOk ? Number(decoded.yearCode) : null
  const yearInRange =
    year !== null && year >= MIN_INCORPORATION_YEAR && year <= CURRENT_YEAR
  let yearCheckDetail = `Expected a four-digit year; found "${decoded.yearCode || 'nothing'}".`

  if (yearFormatOk && year < MIN_INCORPORATION_YEAR) {
    yearCheckDetail = `${year} is earlier than ${MIN_INCORPORATION_YEAR}.`
  } else if (yearFormatOk && year > CURRENT_YEAR) {
    yearCheckDetail = `${year} is in the future; the current year is ${CURRENT_YEAR}.`
  } else if (yearInRange) {
    yearCheckDetail = `${year}.`
  }

  checks.push(
    makeCheck('year', 'Year of incorporation', yearInRange ? 'pass' : 'fail', yearCheckDetail),
  )
  if (!yearFormatOk) {
    addError(
      'INVALID_YEAR_FORMAT',
      `Year of incorporation must be four digits; found "${decoded.yearCode || 'nothing'}".`,
    )
  } else if (year < MIN_INCORPORATION_YEAR) {
    addError(
      'IMPLAUSIBLE_YEAR',
      `Year ${year} is earlier than ${MIN_INCORPORATION_YEAR}, the year of India's first companies Act.`,
    )
  } else if (year > CURRENT_YEAR) {
    addError(
      'FUTURE_YEAR',
      `Year ${year} is in the future; the current year is ${CURRENT_YEAR}.`,
    )
  }

  const categoryFormatOk = /^[A-Z]{3}$/.test(decoded.categoryCode)
  const category = categoryFormatOk ? getCompanyType(decoded.categoryCode) : null
  let categoryCheckStatus = 'fail'
  let categoryCheckDetail = `Expected three letters; found "${decoded.categoryCode || 'nothing'}".`

  if (categoryFormatOk && category) {
    categoryCheckStatus = 'pass'
    categoryCheckDetail = `${category.label} (${decoded.categoryCode}).`
    if (category.confidence === 'observed') {
      notes.push(
        `"${decoded.categoryCode}" is observed in MCA CINs but is absent from older published code lists; it is treated as an observed category.`,
      )
    }
    if (decoded.categoryCode === 'FLC' || decoded.categoryCode === 'FTC') {
      notes.push(
        'Some secondary sources describe FLC as a financial-leasing company. MCA/MoSPI material describes FLC/FTC as public/private subsidiaries of a foreign company; that official reading is used here.',
      )
    }
  } else if (categoryFormatOk) {
    categoryCheckStatus = 'warn'
    categoryCheckDetail = `Unknown / unsupported category code "${decoded.categoryCode}".`
  }

  checks.push(makeCheck('category', 'Company category', categoryCheckStatus, categoryCheckDetail))
  if (!categoryFormatOk) {
    addError(
      'INVALID_CATEGORY',
      `Company category must be three letters; found "${decoded.categoryCode || 'nothing'}".`,
    )
  } else if (!category) {
    addWarning(
      'UNKNOWN_CATEGORY',
      `Unknown / unsupported company category code "${decoded.categoryCode}". The three-letter shape is valid, but no reliable mapping is available.`,
    )
  }

  const registrationFormatOk =
    /^[0-9]{6}$/.test(decoded.registrationNumber) && decoded.extraSuffix === ''
  const registrationAllZero = registrationFormatOk && decoded.registrationNumber === '000000'
  let registrationCheckDetail = `Expected six digits; found "${decoded.registrationNumber || 'nothing'}".`

  if (registrationFormatOk) {
    registrationCheckDetail = `ROC serial ${decoded.registrationNumber}.`
    if (registrationAllZero) {
      registrationCheckDetail = '000000 is not a plausible ROC serial.'
    }
  } else if (decoded.extraSuffix) {
    registrationCheckDetail = `${decoded.extraSuffix.length} extra character${
      decoded.extraSuffix.length === 1 ? '' : 's'
    } after position 21.`
  }

  checks.push(
    makeCheck(
      'registration',
      'ROC registration number',
      registrationFormatOk && !registrationAllZero ? 'pass' : 'fail',
      registrationCheckDetail,
    ),
  )
  if (!registrationFormatOk) {
    addError(
      'INVALID_REGISTRATION',
      decoded.extraSuffix
        ? `Unexpected content after position 21: "${decoded.extraSuffix}". The registration number is the final six digits.`
        : `Registration number must be six digits; found "${decoded.registrationNumber || 'nothing'}".`,
    )
  } else if (registrationAllZero) {
    addError(
      'IMPLAUSIBLE_REGISTRATION',
      'Registration number 000000 is not a plausible ROC serial.',
    )
  }

  notes.push(
    'The industry code is shown as recorded. No NIC sector name is asserted because the applicable NIC edition varies by incorporation vintage.',
  )
  notes.push(
    'Format-only check. MCA master data remains the source of truth for the entity’s existence, status, directors and filings.',
  )

  const status = errors.length
    ? STATUS.invalid
    : warnings.length
      ? STATUS.warning
      : STATUS.valid

  const segmentReadings = {
    listing: listingLabel ?? 'Unrecognised listing code',
    industry: industryFormatOk
      ? `${decoded.industryCode} · NIC code (name not resolved)`
      : 'Expected five digits',
    state: state
      ? `${state.name}${state.status === 'legacy' ? ' · legacy code' : ''}`
      : stateAlias
        ? `Not an MCA code; use ${stateAlias.code}`
        : 'Unrecognised state code',
    year: yearInRange
      ? String(year)
      : yearFormatOk
        ? `${year} · implausible`
        : 'Expected a four-digit year',
    category: category ? category.label : 'Unknown / unsupported category',
    registration: registrationFormatOk
      ? `ROC serial ${decoded.registrationNumber}`
      : 'Expected six digits',
  }

  const segmentStatuses = {
    listing: listingOk ? 'pass' : 'fail',
    industry: industryFormatOk ? (industryAllZero ? 'warn' : 'pass') : 'fail',
    state: state ? 'pass' : 'fail',
    year: yearInRange ? 'pass' : 'fail',
    category: category ? 'pass' : categoryFormatOk ? 'warn' : 'fail',
    registration: registrationFormatOk && !registrationAllZero ? 'pass' : 'fail',
  }

  const segments = decoded.segments.map((segment) => ({
    ...segment,
    reading: segmentReadings[segment.key],
    status: segmentStatuses[segment.key],
  }))

  const summaryParts = [
    listingLabel,
    state?.name,
    yearInRange ? String(year) : null,
    category?.shortLabel,
  ].filter(Boolean)

  const summary = summaryParts.length
    ? summaryParts.join(' · ')
    : 'No CIN fields could be decoded.'

  const article = listingLabel === 'Unlisted' ? 'an' : 'a'
  const decodeSummary = errors.length
    ? `Partial decode${summaryParts.length ? ` — ${summaryParts.join(' · ')}` : ''}. ${errors.length} structural ${
        errors.length === 1 ? 'check' : 'checks'
      } failed.`
    : `This identifier encodes ${listingLabel ? `${article} ${listingLabel.toLowerCase()}` : 'a company of unrecognised listing status'} ${
        category ? category.label.toLowerCase() : 'company of an unsupported category'
      }, registered in ${state ? state.name : 'an unrecognised state'} and incorporated in ${
        yearInRange ? year : 'an unreadable year'
      }.`

  return {
    type: 'CIN',
    identifierKind: 'cin',
    entityType: ENTITY_TYPE.company,
    original: decoded.original,
    normalized: decoded.normalized,
    status,
    errors,
    warnings,
    notes,
    checks,
    segments,
    fields: {
      listingCode: listingLabel ? decoded.listingCode : null,
      listingLabel,
      industryCode: industryFormatOk ? decoded.industryCode : null,
      stateCode: state ? decoded.stateCode : null,
      stateName: state?.name ?? null,
      stateKind: state?.kind ?? null,
      stateStatus: state?.status ?? null,
      year: yearInRange ? year : null,
      yearCode: decoded.yearCode,
      categoryCode: category ? decoded.categoryCode : null,
      categoryLabel: category?.label ?? null,
      categoryShortLabel: category?.shortLabel ?? null,
      registrationNumber: registrationFormatOk ? decoded.registrationNumber : null,
      extraSuffix: decoded.extraSuffix || null,
    },
    summary,
    decodeSummary,
    verification: VERIFICATION_LABEL,
    verificationDetail: VERIFICATION_DETAIL,
    normalization: buildNormalization(decoded.original, decoded.normalized),
  }
}
