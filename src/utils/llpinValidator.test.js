import { describe, expect, it } from 'vitest'
import { STATUS } from './constants'
import { validateLLPIN } from './llpinValidator'

describe('validateLLPIN', () => {
  it('accepts a real-world LLPIN shape', () => {
    const result = validateLLPIN('AAB-4321')

    expect(result.type).toBe('LLPIN')
    expect(result.identifierKind).toBe('llpin')
    expect(result.entityType).toBe('LLP')
    expect(result.status).toBe(STATUS.valid)
    expect(result.errors).toEqual([])
    expect(result.fields.llpinPrefix).toBe('AAB')
    expect(result.fields.llpinSerial).toBe('4321')
    expect(result.fields.stateName).toBeNull()
    expect(result.fields.year).toBeNull()
    expect(result.fields.categoryLabel).toBeNull()
  })

  it('normalises lowercase and surrounding whitespace', () => {
    const result = validateLLPIN('  aam-2052 ')
    expect(result.normalized).toBe('AAM-2052')
    expect(result.status).toBe(STATUS.valid)
    expect(result.normalization.wasTrimmed).toBe(true)
    expect(result.normalization.wasLowercased).toBe(true)
  })

  it('explains a missing hyphen clearly', () => {
    const result = validateLLPIN('AAA1234')

    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_SEPARATOR')
    expect(result.errors.map((error) => error.code)).toContain('INVALID_LENGTH')
    expect(result.errors[0].message.toLowerCase()).toContain('hyphen')
    expect(result.fields.llpinPrefix).toBe('AAA')
    expect(result.fields.llpinSerial).toBe('1234')
  })

  it('rejects a short serial', () => {
    const result = validateLLPIN('AAA-123')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_SERIAL')
  })

  it('rejects a long serial', () => {
    const result = validateLLPIN('AAA-12345')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_LENGTH')
  })

  it('rejects an underscore separator', () => {
    const result = validateLLPIN('AAA_1234')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_SEPARATOR')
  })

  it('rejects an en dash separator', () => {
    const result = validateLLPIN('AAA–1234')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_SEPARATOR')
  })

  it('rejects letters in the serial', () => {
    const result = validateLLPIN('AAA-12AB')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.errors.map((error) => error.code)).toContain('INVALID_SERIAL')
  })

  it('warns about serial 0000', () => {
    const result = validateLLPIN('AAA-0000')
    expect(result.status).toBe(STATUS.warning)
    expect(result.warnings.map((warning) => warning.code)).toContain('IMPLAUSIBLE_SERIAL')
  })

  it('never invents state, year or LLP type fields', () => {
    const result = validateLLPIN('AAB-4321')
    expect(result.fields.stateCode).toBeNull()
    expect(result.fields.year).toBeNull()
    expect(result.fields.categoryLabel).toBeNull()
    expect(result.notes.join(' ')).toContain('not encoded')
  })

  it('does not throw on empty input', () => {
    expect(() => validateLLPIN('')).not.toThrow()
    expect(validateLLPIN('').status).toBe(STATUS.invalid)
  })
})
