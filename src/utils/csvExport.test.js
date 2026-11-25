import { describe, expect, it } from 'vitest'
import { escapeCsvValue, buildCsv, csvFilename } from './csvExport'
import { processBatch } from './batchProcessor'

describe('escapeCsvValue', () => {
  it('leaves a simple value alone', () => {
    expect(escapeCsvValue('L17110MH1973PLC019786')).toBe('L17110MH1973PLC019786')
  })

  it('quotes commas', () => {
    expect(escapeCsvValue('Mumbai, Maharashtra')).toBe('"Mumbai, Maharashtra"')
  })

  it('doubles embedded quotes', () => {
    expect(escapeCsvValue('He said "hello"')).toBe('"He said ""hello"""')
  })

  it('quotes newlines', () => {
    expect(escapeCsvValue('line one\nline two')).toBe('"line one\nline two"')
  })

  it('quotes leading and trailing whitespace', () => {
    expect(escapeCsvValue(' padded ')).toBe('" padded "')
  })

  it('neutralises spreadsheet formulas', () => {
    expect(escapeCsvValue('=1+1')).toBe(`"'=1+1"`)
    expect(escapeCsvValue('+SUM(A1:A2)')).toBe(`"'+SUM(A1:A2)"`)
  })

  it('handles null and undefined', () => {
    expect(escapeCsvValue(null)).toBe('')
    expect(escapeCsvValue(undefined)).toBe('')
  })
})

describe('buildCsv', () => {
  it('builds a header and one row per result', () => {
    const batch = processBatch('L17110MH1973PLC019786\nAAB-4321')
    const csv = buildCsv(batch.results)
    const lines = csv.split('\r\n')

    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('Original identifier')
    expect(lines[0]).toContain('Normalised identifier')
    expect(lines[1]).toContain('L17110MH1973PLC019786')
    expect(lines[1]).toContain('Maharashtra (MH)')
    expect(lines[2]).toContain('AAB-4321')
    expect(lines[2]).toContain('Not encoded in LLPIN')
    expect(csv.startsWith('\uFEFF')).toBe(false)
  })

  it('keeps commas and quotes valid inside a full row', () => {
    const result = processBatch('L17110MH1973PLC019786').results[0]
    result.decodeSummary = 'Decode, with "quotes" and a newline\ninside'
    const csv = buildCsv([result])

    expect(csv).toContain('"Decode, with ""quotes"" and a newline\ninside"')
  })
})

describe('csvFilename', () => {
  it('uses a stable date-stamped name', () => {
    expect(csvFilename(new Date(2026, 10, 24))).toBe('filesure-cin-llpin-check-2026-11-24.csv')
  })
})
