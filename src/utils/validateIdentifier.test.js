import { describe, expect, it } from 'vitest'
import { detectIdentifierType, validateIdentifier } from './validateIdentifier'
import { STATUS } from './constants'

describe('detectIdentifierType', () => {
  it('recognises a CIN', () => {
    expect(detectIdentifierType('L17110MH1973PLC019786')).toBe('CIN')
  })

  it('recognises a CIN near-miss', () => {
    expect(detectIdentifierType('L17110MH1973PLC01978')).toBe('CIN')
    expect(detectIdentifierType('L17110MH1973PLC0197861')).toBe('CIN')
  })

  it('recognises an LLPIN', () => {
    expect(detectIdentifierType('AAB-4321')).toBe('LLP')
  })

  it('recognises a missing-hyphen LLPIN attempt', () => {
    expect(detectIdentifierType('AAB4321')).toBe('LLP')
  })

  it('recognises a wrong-separator LLPIN attempt', () => {
    expect(detectIdentifierType('AAB_4321')).toBe('LLP')
    expect(detectIdentifierType('AAB 4321')).toBe('LLP')
  })

  it('leaves random prose unrecognised', () => {
    expect(detectIdentifierType('this is not an identifier')).toBe('unknown')
    expect(detectIdentifierType('HELLO-WORLD')).toBe('unknown')
  })
})

describe('validateIdentifier', () => {
  it('routes CINs, LLPINs and unknown values', () => {
    expect(validateIdentifier('L17110MH1973PLC019786').identifierKind).toBe('cin')
    expect(validateIdentifier('AAB-4321').identifierKind).toBe('llpin')
    expect(validateIdentifier('random garbage').identifierKind).toBe('unknown')
  })

  it('returns a useful invalid result for unknown input', () => {
    const result = validateIdentifier('random garbage')
    expect(result.status).toBe(STATUS.invalid)
    expect(result.entityType).toBe('Unknown')
    expect(result.errors[0].code).toBe('UNRECOGNISED_IDENTIFIER')
    expect(result.decodeSummary).toContain('No CIN or LLPIN')
  })
})
