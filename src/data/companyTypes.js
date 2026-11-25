/**
 * Company category / ownership codes used in positions 13–15 of a CIN.
 *
 * Sources and confidence:
 * - MoSPI, Annual Survey of Industries instructions (official CIN structure):
 *   GOI, SGC, PLC, PTC, FLC, FTC, ULL, ULT, GAP, GAT, NPL.
 * - MCA General Circular 02/2024 and the MCA's 2026 FAQ describe FTC/FLC as
 *   private/public subsidiaries of a foreign company. Many secondary blogs
 *   call FLC a "financial leasing company"; that description is not used here.
 * - PLN is observed in MCA CINs for Nidhi companies (e.g. U65929MH2020PLN350399)
 *   but is absent from several older code lists. It is therefore marked as an
 *   observed category rather than an official table entry.
 * - MCA publishes no single consolidated public table. Unknown three-letter
 *   codes are surfaced as a warning, never silently mapped to a guessed type.
 */
export const COMPANY_TYPES = Object.freeze({
  PTC: {
    label: 'Private limited company',
    shortLabel: 'Private limited',
    description: 'A private company limited by shares or guarantee (Indian non-government company).',
    family: 'Company',
    confidence: 'documented',
  },
  PLC: {
    label: 'Public limited company',
    shortLabel: 'Public limited',
    description: 'A public company limited by shares or guarantee (Indian non-government company).',
    family: 'Company',
    confidence: 'documented',
  },
  OPC: {
    label: 'One Person Company',
    shortLabel: 'One Person Company',
    description: 'A one-person company under the Companies Act, 2013.',
    family: 'Company',
    confidence: 'documented',
  },
  NPL: {
    label: 'Not-for-profit licence company (Section 8)',
    shortLabel: 'Section 8 / not-for-profit',
    description: 'A company licensed under Section 8 of the Companies Act, 2013 (Section 25 under the 1956 Act).',
    family: 'Company',
    confidence: 'documented',
  },
  FTC: {
    label: 'Private limited subsidiary of a foreign company',
    shortLabel: 'Foreign subsidiary (private)',
    description: 'A private limited Indian company that is a subsidiary of a foreign company.',
    family: 'Company',
    confidence: 'documented',
  },
  FLC: {
    label: 'Public limited subsidiary of a foreign company',
    shortLabel: 'Foreign subsidiary (public)',
    description: 'A public limited Indian company that is a subsidiary of a foreign company.',
    family: 'Company',
    confidence: 'documented',
  },
  GOI: {
    label: 'Government of India company',
    shortLabel: 'Government of India',
    description: 'A company owned or controlled by the Central Government.',
    family: 'Government',
    confidence: 'documented',
  },
  SGC: {
    label: 'State government company',
    shortLabel: 'State government',
    description: 'A company owned or controlled by a State Government.',
    family: 'Government',
    confidence: 'documented',
  },
  GAP: {
    label: 'Guarantee and association company (public)',
    shortLabel: 'Guarantee company (public)',
    description: 'A public company limited by guarantee, often an association or membership body.',
    family: 'Company',
    confidence: 'documented',
  },
  GAT: {
    label: 'Guarantee and association company (private)',
    shortLabel: 'Guarantee company (private)',
    description: 'A private company limited by guarantee, often an association or membership body.',
    family: 'Company',
    confidence: 'documented',
  },
  ULL: {
    label: 'Public company with unlimited liability',
    shortLabel: 'Unlimited liability (public)',
    description: 'A public company with unlimited liability for its members.',
    family: 'Company',
    confidence: 'documented',
  },
  ULT: {
    label: 'Private company with unlimited liability',
    shortLabel: 'Unlimited liability (private)',
    description: 'A private company with unlimited liability for its members.',
    family: 'Company',
    confidence: 'documented',
  },
  PLN: {
    label: 'Nidhi company (public limited)',
    shortLabel: 'Nidhi company',
    description: 'A Nidhi company, incorporated as a public limited company under Section 406 of the Companies Act, 2013.',
    family: 'Company',
    confidence: 'observed',
  },
})

export const COMPANY_TYPE_CODES = Object.keys(COMPANY_TYPES)

export function getCompanyType(code) {
  return COMPANY_TYPES[code] ?? null
}
