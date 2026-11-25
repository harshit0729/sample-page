import { describe, expect, it } from 'vitest'
import { validateCIN } from './cinValidator'
import { STATUS } from './constants'

const VALID_LISTED = 'L17110MH1973PLC019786'
const VALID_UNLISTED = 'U72200KA2015PTC082236'

describe('validateCIN', () => {
  it('decodes a structurally valid listed public company', () => {
    const result = validateCIN(VALID_LISTED)

    expect(result.type).toBe('CIN')
    expect(result.identifierKind).toBe('cin')
    expect(result.entityType).toBe('Company')
    expect(result.status).toBe(STATUS.valid)
    expect(result.errors).toEqual([])
    expect(result.fields.listingLabel).toBe('Listed')
    expect(result.fields.stateCode).toBe('MH')
    expect(result.fields.stateName).toBe('Maharashtra')
    expect(result.fields.year).toBe(1973)
    expect(result.fields.categoryCode).toBe('PLC')
    expect(result.fields.categoryLabel).toBe('Public limited company')
    expect(result.fields.industryCode).toBe('17110')
    expect(result.fields.registrationNumber).toBe('019786')
    expect(result.segments).toHaveLength(6)
  })

  it('accepts a valid unlisted private company', () => {
    const result = validateCIN(VALID_UNLISTED)
    expect(result.status).toBe(STATUS.valid)
    expect(result.fields.listingLabel).toBe('Unlisted')
    expect(result.fields.categoryCode).toBe('PTC')
    expect(result.fields.stateCode).toBe('KA')
  })

  it('normalises surrounding whitespace and lowercase without losing the original', () => {
    const result = validateCIN('  l17110mh1973plc019786  ')

    expect(result.normalized).toBe(VALID_LISTED)
    expect(result.original).toBe('  l17110mh1973plc019786  ')
    expect(result.status).toBe(STATUS.valid)
    expect(result.normalization.wasTrimmed).toBe(true)
    expect(result.normalization.wasLowercased).toBe(true)
  })

  it('rejects a 20-character CIN with a precise length error', () => {
    const result = validateCIN('L17110MH1973PLC01978')

    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_LENGTH')
    expect(result.checks.find((check) => check.id === 'length').detail).toContain('20')
  })

  it('rejects a 22-character CIN and identifies the extra character', () => {
    const result = validateCIN('L17110MH1973PLC0197861')

    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_LENGTH')
    expect(result.errors.map((error) => error.code)).toContain('INVALID_REGISTRATION')
    expect(result.fields.extraSuffix).toBe('1')
  })

  it('rejects an unknown state code', () => {
    const result = validateCIN('L17110ZZ1973PLC019786')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_STATE')
  })

  it('suggests the MCA state code when an ISO code is used', () => {
    const result = validateCIN('L17110OD1973PLC019786')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('STATE_ALIAS')
    expect(result.errors[0].message).toContain('OR')
  })

  it('rejects a future incorporation year', () => {
    const result = validateCIN('L17110MH2099PLC019786')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('FUTURE_YEAR')
  })

  it('rejects a year before 1850', () => {
    const result = validateCIN('L17110MH1849PLC019786')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('IMPLAUSIBLE_YEAR')
  })

  it('supports an 1850 incorporation year as the plausible lower bound', () => {
    const result = validateCIN('L17110MH1850PLC000001')
    expect(result.status).toBe(STATUS.valid)
    expect(result.fields.year).toBe(1850)
  })

  it('marks an unsupported but structurally plausible category as a warning', () => {
    const result = validateCIN('L17110MH1973XYZ019786')

    expect(result.status).toBe(STATUS.warning)
    expect(result.errors).toEqual([])
    expect(result.warnings.map((warning) => warning.code)).toContain('UNKNOWN_CATEGORY')
    expect(result.warnings[0].message).toContain('Unknown / unsupported')
    expect(result.fields.categoryLabel).toBeNull()
  })

  it('rejects a non-numeric registration number', () => {
    const result = validateCIN('L17110MH1973PLC01978A')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_REGISTRATION')
  })

  it('rejects the implausible registration number 000000', () => {
    const result = validateCIN('L17110MH1973PLC000000')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('IMPLAUSIBLE_REGISTRATION')
  })

  it('warns about an all-zero industry code without inventing a sector', () => {
    const result = validateCIN('L00000MH1973PLC019786')
    expect(result.status).toBe(STATUS.warning)
    expect(result.warnings.map((warning) => warning.code)).toContain('IMPLAUSIBLE_INDUSTRY')
    expect(result.fields.industryCode).toBe('00000')
  })

  it('accepts the legacy Telangana TS code and records why', () => {
    const result = validateCIN('L17110TS1973PLC019786')
    expect(result.status).toBe(STATUS.valid)
    expect(result.fields.stateName).toBe('Telangana')
    expect(result.notes.join(' ')).toContain('TS to TG')
  })

  it('accepts the Ladakh LH code observed in MCA CINs', () => {
    const result = validateCIN('U74999LH2021GOI011282')
    expect(result.status).toBe(STATUS.valid)
    expect(result.fields.stateName).toBe('Ladakh')
    expect(result.fields.categoryCode).toBe('GOI')
  })

  it('accepts the observed PLN Nidhi category', () => {
    const result = validateCIN('U65929MH2020PLN350399')
    expect(result.status).toBe(STATUS.valid)
    expect(result.fields.categoryCode).toBe('PLN')
    expect(result.fields.categoryLabel).toContain('Nidhi')
  })

  it('rejects characters that do not belong in a CIN', () => {
    const result = validateCIN('L17110MH1973PLC01978-')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_CHARACTERS')
  })

  it('does not throw on empty input', () => {
    expect(() => validateCIN('')).not.toThrow()
    const result = validateCIN('')
    expect(result.status).toBe(STATUS.invalid)
  })
})
