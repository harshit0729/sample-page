import { describe, expect, it } from 'vitest'
import {
  BatchLimitError,
  getInputLines,
  getInputStats,
  processBatch,
} from './batchProcessor'
import { MAX_IDENTIFIERS } from './constants'

const CIN_A = 'L17110MH1973PLC019786'
const CIN_B = 'U72200KA2015PTC082236'

describe('getInputLines', () => {
  it('ignores blank lines but preserves original line numbers', () => {
    const lines = getInputLines(`\n${CIN_A}\n   \n${CIN_B}\n`)
    expect(lines).toEqual([
      { raw: CIN_A, lineNumber: 2 },
      { raw: CIN_B, lineNumber: 4 },
    ])
  })

  it('handles empty input', () => {
    expect(getInputLines('')).toEqual([])
    expect(getInputLines('   \n\t\n')).toEqual([])
  })
})

describe('getInputStats', () => {
  it('counts lines, identifiers, unique values and families', () => {
    const stats = getInputStats(`${CIN_A}\n\n${CIN_A}\nAAB-4321\nrandom garbage`)
    expect(stats.totalLines).toBe(5)
    expect(stats.identifiers).toBe(4)
    expect(stats.unique).toBe(3)
    expect(stats.duplicates).toBe(1)
    expect(stats.duplicateGroups).toBe(1)
    expect(stats.cinCount).toBe(2)
    expect(stats.llpCount).toBe(1)
    expect(stats.unknownCount).toBe(1)
    expect(stats.overLimit).toBe(false)
  })
})

describe('processBatch', () => {
  it('processes mixed CINs, LLPINs and garbage without crashing', () => {
    const batch = processBatch(`${CIN_A}\nAAB-4321\nrandom garbage\n${CIN_B}`)
    expect(batch.results).toHaveLength(4)
    expect(batch.results[0].identifierKind).toBe('cin')
    expect(batch.results[1].identifierKind).toBe('llpin')
    expect(batch.results[2].identifierKind).toBe('unknown')
    expect(batch.results[2].status).toBe('invalid')
    expect(batch.stats.companies).toBe(2)
    expect(batch.stats.llps).toBe(1)
    expect(batch.stats.invalid).toBe(1)
  })

  it('annotates duplicates, including case-insensitive repeats', () => {
    const batch = processBatch(`${CIN_A}\n\nl17110mh1973plc019786\nAAB-4321`)
    const first = batch.results[0]
    const duplicate = batch.results[1]

    expect(first.isDuplicate).toBe(true)
    expect(first.occurrences).toBe(2)
    expect(first.occurrence).toBe(1)
    expect(duplicate.occurrence).toBe(2)
    expect(duplicate.duplicateLineNumbers).toEqual([1, 3])
    expect(batch.stats.duplicateGroups).toBe(1)
    expect(batch.stats.duplicateLines).toBe(2)
  })

  it('handles 500 identifiers', () => {
    const lines = Array.from(
      { length: MAX_IDENTIFIERS },
      (_, index) => `AAA-${String(index + 1).padStart(4, '0')}`,
    ).join('\n')

    const batch = processBatch(lines)
    expect(batch.results).toHaveLength(MAX_IDENTIFIERS)
    expect(batch.stats.llps).toBe(MAX_IDENTIFIERS)
    expect(batch.stats.invalid).toBe(0)
  })

  it('throws a clear error above 500 instead of truncating', () => {
    const lines = Array.from(
      { length: MAX_IDENTIFIERS + 1 },
      (_, index) => `AAA-${String(index + 1).padStart(4, '0')}`,
    ).join('\n')

    expect(() => processBatch(lines)).toThrow(BatchLimitError)
    try {
      processBatch(lines)
    } catch (error) {
      expect(error.count).toBe(501)
      expect(error.limit).toBe(500)
      expect(error.message).toContain('nothing was processed')
    }
  })

  it('treats whitespace-only input as an empty batch', () => {
    const batch = processBatch('   \n\t\n')
    expect(batch.results).toEqual([])
    expect(batch.stats.total).toBe(0)
  })
})
