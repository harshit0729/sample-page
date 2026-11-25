/**
 * MCA-style state / jurisdiction codes used in the 7th–8th characters of a CIN.
 *
 * A code is included only where it has been observed in MCA CINs or is a
 * documented historical variant. ISO state abbreviations that MCA does not use
 * in CINs (for example OD, CG and UK) are deliberately *not* accepted.
 *
 * `legacy` does not mean invalid. It means the code is tied to an older
 * jurisdiction, a renamed state, or a code MCA has since migrated away from.
 * Old identifiers remain in circulation, so the checker accepts them and says
 * why they are unusual.
 */
export const STATE_CODES = Object.freeze({
  AN: { name: 'Andaman and Nicobar Islands', kind: 'Union territory', status: 'current' },
  AP: {
    name: 'Andhra Pradesh',
    kind: 'State',
    status: 'current',
    note: 'Also used by Telangana companies incorporated before the 2014 bifurcation.',
  },
  AR: { name: 'Arunachal Pradesh', kind: 'State', status: 'current' },
  AS: { name: 'Assam', kind: 'State', status: 'current' },
  BR: { name: 'Bihar', kind: 'State', status: 'current' },
  CH: { name: 'Chandigarh', kind: 'Union territory', status: 'current' },
  CT: {
    name: 'Chhattisgarh',
    kind: 'State',
    status: 'current',
    note: 'MCA uses CT in CINs, not the ISO code CG.',
  },
  DD: {
    name: 'Daman and Diu',
    kind: 'Union territory',
    status: 'legacy',
    note: 'Former UT. After the 2020 merger, CINs have been seen with DN or DD.',
  },
  DN: {
    name: 'Dadra and Nagar Haveli',
    kind: 'Union territory',
    status: 'legacy',
    note: 'Former UT. After the 2020 merger, CINs have been seen with DN or DD.',
  },
  DL: { name: 'Delhi', kind: 'Union territory', status: 'current' },
  GA: { name: 'Goa', kind: 'State', status: 'current' },
  GJ: { name: 'Gujarat', kind: 'State', status: 'current' },
  HR: { name: 'Haryana', kind: 'State', status: 'current' },
  HP: { name: 'Himachal Pradesh', kind: 'State', status: 'current' },
  JK: { name: 'Jammu and Kashmir', kind: 'Union territory', status: 'current' },
  JH: { name: 'Jharkhand', kind: 'State', status: 'current' },
  KA: { name: 'Karnataka', kind: 'State', status: 'current' },
  KL: { name: 'Kerala', kind: 'State', status: 'current' },
  LD: { name: 'Lakshadweep', kind: 'Union territory', status: 'current' },
  LH: {
    name: 'Ladakh',
    kind: 'Union territory',
    status: 'current',
    note: 'Observed in MCA CINs from 2021 onward. Some ROC tables show LA, but CIN samples use LH.',
  },
  MP: { name: 'Madhya Pradesh', kind: 'State', status: 'current' },
  MH: { name: 'Maharashtra', kind: 'State', status: 'current' },
  MN: { name: 'Manipur', kind: 'State', status: 'current' },
  ML: { name: 'Meghalaya', kind: 'State', status: 'current' },
  MZ: { name: 'Mizoram', kind: 'State', status: 'current' },
  NL: { name: 'Nagaland', kind: 'State', status: 'current' },
  OR: {
    name: 'Odisha',
    kind: 'State',
    status: 'current',
    note: 'MCA uses OR in CINs, not the ISO code OD.',
  },
  PY: { name: 'Puducherry', kind: 'Union territory', status: 'current' },
  PB: { name: 'Punjab', kind: 'State', status: 'current' },
  RJ: { name: 'Rajasthan', kind: 'State', status: 'current' },
  SK: { name: 'Sikkim', kind: 'State', status: 'current' },
  TN: { name: 'Tamil Nadu', kind: 'State', status: 'current' },
  TG: {
    name: 'Telangana',
    kind: 'State',
    status: 'current',
    note: 'Current MCA code. Older CINs may still carry TS.',
  },
  TS: {
    name: 'Telangana',
    kind: 'State',
    status: 'legacy',
    note: 'Older Telangana code. MCA ordered a migration from TS to TG in 2024; both remain in circulation.',
  },
  TR: { name: 'Tripura', kind: 'State', status: 'current' },
  UP: { name: 'Uttar Pradesh', kind: 'State', status: 'current' },
  UR: {
    name: 'Uttarakhand',
    kind: 'State',
    status: 'current',
    note: 'Common MCA code, including pre-2007 Uttaranchal-era CINs.',
  },
  UT: {
    name: 'Uttarakhand',
    kind: 'State',
    status: 'legacy',
    note: 'Observed in some 2007-era CINs. UR is the more common code.',
  },
  WB: { name: 'West Bengal', kind: 'State', status: 'current' },
})

/** Codes that look right but are not used by MCA in the CIN state block. */
export const STATE_CODE_ALIASES = Object.freeze({
  OD: { code: 'OR', name: 'Odisha' },
  CG: { code: 'CT', name: 'Chhattisgarh' },
  UK: { code: 'UR', name: 'Uttarakhand' },
  UA: { code: 'UR', name: 'Uttarakhand' },
  LA: { code: 'LH', name: 'Ladakh' },
})

export const STATE_CODE_LIST = Object.entries(STATE_CODES)
  .map(([code, state]) => ({ code, ...state }))
  .sort((a, b) => a.name.localeCompare(b.name) || a.code.localeCompare(b.code))

export function getState(code) {
  return STATE_CODES[code] ?? null
}
