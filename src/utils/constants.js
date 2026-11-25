export const APP_NAME = 'FileSure'
export const TOOL_NAME = 'CIN & LLPIN Checker'
export const MAX_IDENTIFIERS = 500
export const MIN_INCORPORATION_YEAR = 1850
export const CURRENT_YEAR = new Date().getFullYear()
export const VERIFICATION_LABEL = 'Format only'
export const VERIFICATION_DETAIL =
  'Checked against the published identifier structure in your browser. Not checked against MCA records.'

export const CIN_LENGTH = 21
export const CIN_PATTERN = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/
export const LLPIN_PATTERN = /^[A-Z]{3}-[0-9]{4}$/

/**
 * A deliberately mixed sample: listed/unlisted companies, a Nidhi, a
 * government company in Ladakh, a Chhattisgarh company, a Uttarakhand
 * company, and two real LLPINs. Loading the sample does not imply that the
 * entities are active or that the identifiers are still current.
 */
export const SAMPLE_INPUT = [
  'L17110MH1973PLC019786',
  'L85110KA1981PLC013115',
  'U72200KA2015PTC082236',
  'U65929MH2020PLN350399',
  'U74999LH2021GOI011282',
  'U45200CT2011PTC022293',
  'U74999UR2016PTC007216',
  'AAB-4321',
  'AAM-2052',
].join('\n')

export const SAMPLE_PLACEHOLDER = `Paste one identifier per line, for example:

L17110MH1973PLC019786
U72200KA2015PTC082236
AAB-4321`

export const STATUS = Object.freeze({
  valid: 'valid',
  warning: 'warning',
  invalid: 'invalid',
})

export const ENTITY_TYPE = Object.freeze({
  company: 'Company',
  llp: 'LLP',
  unknown: 'Unknown',
})
