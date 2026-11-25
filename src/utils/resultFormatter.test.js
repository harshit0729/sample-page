import { describe, expect, it } from 'vitest'
import { validateCIN } from './cinValidator'
import { validateLLPIN } from './llpinValidator'
import { formatAllResultsText, formatResultText } from './resultFormatter'

describe('formatResultText', () => {
  it('renders a readable CIN summary with the verification caveat', () => {
    const text = formatResultText(validateCIN('L17110MH1973PLC019786'))
    expect(text).toContain('L17110MH1973PLC019786')
    expect(text).toContain('Status: Valid format')
    expect(text).toContain('State: Maharashtra (MH)')
    expect(text).toContain('Company type: Public limited company')
    expect(text).toContain('Verification: Format only')
    expect(text).toContain('Not checked against MCA records')
  })

  it('does not fabricate state or year for an LLPIN', () => {
    const text = formatResultText(validateLLPIN('AAB-4321'))
    expect(text).toContain('State: Not encoded in LLPIN')
    expect(text).toContain('Incorporation year: Not encoded in LLPIN')
    expect(text).toContain('Company type: Not encoded in LLPIN')
    expect(text).not.toContain('Maharashtra')
  })
})

describe('formatAllResultsText', () => {
  it('produces tab-separated rows for pasting into a spreadsheet', () => {
    const text = formatAllResultsText([
      validateCIN('L17110MH1973PLC019786'),
      validateLLPIN('AAB-4321'),
    ])
    const lines = text.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('Identifier\tEntity\tStatus')
    expect(lines[1]).toContain('Maharashtra (MH)')
    expect(lines[2]).toContain('Not encoded')
  })
})
