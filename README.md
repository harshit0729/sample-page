# FileSure — CIN & LLPIN Checker

A browser-only workbench for checking and decoding Indian company identifiers (CIN) and limited liability partnership identifiers (LLPIN).

Paste up to 500 identifiers. FileSure validates their **structure**, decodes every embedded block, explains every failure, and keeps a clear line between *format* and *fact*. It does not query the MCA register.

> Format is not a fact. The register is the record.

---

## Live demo

The source is published at [github.com/harshit0729/sample-page](https://github.com/harshit0729/sample-page). A live Vercel URL is not available yet: Vercel required owner authentication, and the anonymous temporary deployment it offers was blocked at Vercel's edge with a `403` (`X-Vercel-Mitigated: deny`), so no deployment URL is claimed. See [Deployment](#deployment) for the exact owner steps.

The production build is verified locally:

```bash
npm ci
npm run build
npm run preview
```

---

## What it does

- Checks **21-character CINs** and **LLPINs** (`AAB-4321`) against fixed structural rules.
- Decodes CIN blocks: listing status, industry code, state, year, category, ROC serial.
- Decodes LLPIN blocks: series prefix, separator, serial — and says plainly that state, year and class are not encoded.
- Runs independent structural checks for every CIN (length, characters, listing, industry, state, year, category, registration) and still shows a partial trace when a row is malformed.
- Detects ISO-style state codes that MCA does not use in CINs (`OD`, `CG`, `UK`, `UA`, `LA`) and suggests the MCA code.
- Accepts legacy state codes in circulation (`TS`, `UT`, `DD`, `DN`) and annotates them instead of failing them.
- Handles **up to 500 identifiers per batch**; an over-limit batch is rejected whole and nothing is processed.
- Marks duplicate lines without removing them, so counts always reconcile with what was pasted.
- Normalises case and surrounding whitespace **visibly**, preserving the original text.
- Filters by status or identifier type, searches decoded fields, expands per-row decode traces, copies records, exports CSV.
- Includes a field guide, method section and row-level caveats.

Everything runs in the browser. No backend, database, account, analytics, upload or MCA API call.

---

## What it does not do

- It does not prove that a company or LLP exists, is active, or is owned by a particular person.
- It does not query MCA master data, directors, charges or filings.
- It does not resolve NIC industry names; the five-digit code is shown as recorded.
- It does not support FCRN, FLLPIN, DIN, GSTIN or other identifiers.
- It does not validate beyond format. A green result is a statement about the string, not the entity.

Use the [MCA register](https://www.mca.gov.in/) for registration status and statutory records.

---

## Identifier rules

### CIN — 21 characters

| Positions | Block | Rule |
| --- | --- | --- |
| 1 | Listing status | `L` (listed) or `U` (unlisted) |
| 2–6 | Industry code | five digits (NIC sub-class) |
| 7–8 | State / jurisdiction | accepted MCA code |
| 9–12 | Year of incorporation | four digits, 1850 to current year |
| 13–15 | Company category | mapped three-letter code |
| 16–21 | ROC serial | six digits; `000000` rejected |

Example: `U72200KA2015PTC082236` decodes to an unlisted private limited company, registered in Karnataka, incorporated in 2015.

### LLPIN — 8 characters

| Positions | Block | Rule |
| --- | --- | --- |
| 1–3 | Series prefix | three letters; not a state or year code |
| 4 | Separator | plain hyphen |
| 5–8 | Serial | four digits |

Example: `AAB-4321`. There is no state, year, class or check digit in an LLPIN.

### Status meanings

| Status | Meaning |
| --- | --- |
| **Valid format** | Every structural rule passed. |
| **Review notes** | Shape is valid, but a field is suspicious: unknown category, all-zero industry code, or a legacy state code. |
| **Invalid** | At least one structural rule failed. The decode trace still shows what could be read. |

### Code provenance

- State codes are limited to codes observed in MCA CINs or documented historical variants. `OD`, `CG`, `UK`, `UA` and `LA` are **not** accepted in the state block; the checker suggests the MCA equivalents. See `src/data/stateCodes.js`.
- Category mappings follow MoSPI/MCA material. `FLC`/`FTC` are read as public/private subsidiaries of a foreign company, not as “financial leasing” companies (a common secondary-source error). `PLN` is marked as an observed Nidhi code because it is absent from some older published lists. Unknown three-letter categories produce a warning, never a guess.
- Legacy does not mean invalid. `TS` (Telangana before the 2024 migration to `TG`), `UT` (Uttarakhand), `DD`/`DN` (pre-2020 Daman and Diu / Dadra and Nagar Haveli) and `LH` (Ladakh) are accepted and annotated.
- An LLPIN has no check digit. A clean format result cannot establish registration.

The full code lists and confidence flags live in `src/data/`. The Field guide modal exposes them to the user.

---

## Batch behaviour

- Input is split into non-blank lines; one identifier per line. Blank lines are ignored.
- The limit is **500 identifiers**. Over-limit input shows an explicit rejection, disables the run button and processes nothing.
- Every pasted line is kept in the result set. Duplicate identifiers are annotated (`×3`) and counted individually.
- A result is tied to the batch that was checked. Editing the input afterwards shows a “previous batch” notice with a re-run action.
- Pagination is 50 rows per page to keep large batches responsive.
- CSV exports include original and normalised identifiers, decoded fields, errors, warnings, occurrence count and the format-only verification note. Spreadsheet-formula injection is escaped.
- “Copy all” produces tab-separated text for pasting into Excel or Sheets.

---

## Tech stack

- React 18 + Vite 6
- JavaScript (no TypeScript)
- Tailwind CSS 3 with a small design-token layer
- Lucide React icons
- Self-hosted Fontsource fonts (Manrope, Instrument Serif, IBM Plex Mono)
- Vitest for unit tests
- ESLint

No runtime dependency makes a network request. Fonts are bundled at build time.

---

## Local development

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

### Verified locally

- `npm test` — **59 tests passing** across 6 test files
- `npm run lint` — clean
- `npm run build` — successful production build
- Responsive layout checked at 320, 375, 768, 1024 and 1440 px with no horizontal overflow

---

## Project structure

```text
src/
  App.jsx                     batch state, actions, toasts, modal wiring
  index.css                   base styles, design tokens, component classes
  main.jsx                    entry point and font imports
  components/
    Header.jsx                sticky header and section navigation
    Hero.jsx                  hero copy, sample action, stats
    AnatomyCard.jsx           interactive CIN / Nidhi / LLPIN specimen
    BatchWorkbench.jsx        intake + notes panel
    IdentifierInput.jsx       dark batch intake and limit handling
    BatchNotes.jsx            live tally and house rules
    RegisterSection.jsx       results state, filtering, pagination
    SummaryStrip.jsx          ledger summary
    FilterBar.jsx             status/type filters, search, export
    ResultsTable.jsx          desktop table
    ResultCards.jsx           mobile result cards
    ResultDetails.jsx         decode trace, checks, notes, row actions
    FormatGuideModal.jsx      field reference and accepted codes
    MethodSection.jsx         method, limits and references
    EmptyStates.jsx           first-run and no-match states
    StatusBadge.jsx           status pill
    Pagination.jsx            page controls
    Toast.jsx                 transient notifications
    Logo.jsx / SectionHeading.jsx / Footer.jsx
  data/
    stateCodes.js             accepted MCA state codes, legacy notes, aliases
    companyTypes.js           category codes, labels, provenance flags
  utils/
    cinDecoder.js             pure position slicing
    cinValidator.js           CIN checks and decode result
    llpinValidator.js         LLPIN shape checks and decode result
    validateIdentifier.js     family detection and unknown-result shape
    batchProcessor.js         line parsing, limits, duplicate annotation
    csvExport.js              CSV building, escaping and download
    resultFormatter.js        copy text formats
    clipboard.js              clipboard with legacy fallback
    validationUtils.js        shared normalisation and check helpers
  hooks/
    useMediaQuery.js          table/card switch
```

Tests sit beside the utilities they cover (`*.test.js`).

---

## Design notes

The interface is deliberately closer to a registry desk than a generic SaaS dashboard:

- Deep navy intake against warm paper, with ONE signal blue. Green, amber and red are reserved for status.
- A fixed-width, monospace identifier strip makes position reading concrete.
- Section numbering, hairline rules, ledger strips and figure labels give the page an editorial rhythm.
- Motion is limited to a short rise on the hero, row-detail reveal and toast. Reduced-motion preferences are respected.
- The “format only” boundary appears in the header, summary, row details, CSV and footer — not buried in a disclaimer.
- Table below `lg`, cards on smaller screens; 50-row pagination keeps 500-row batches usable.

Typography: Instrument Serif for display, Manrope for UI, IBM Plex Mono for identifiers and technical labels.

---

## Deployment

The app is a static Vite site. No environment variables are needed.

### Vercel dashboard

1. Push the repository to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy.

### Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

The deployment must be authenticated to the account that should own it. This workspace was logged out of Vercel, so no deployment URL is claimed here. The GitHub remote is pushed and verified; the Vercel project still needs to be created by the owner.

### GitHub

The repository is pushed: `main` tracks `origin/main` at `https://github.com/harshit0729/sample-page.git`.

```bash
gh auth login
git push -u origin main
```

Only run the push if you make further local changes; the initial history is already on the remote.

---

## Testing approach

The unit suite covers:

- CIN decode for listed/unlisted, state, year and category fields.
- Length, character, state, year, category and registration failures.
- Legacy state codes, MCA-vs-ISO aliases, observed `PLN` and the `FLC`/`FTC` reading.
- LLPIN normalisation, separators, serial, length and zero-serial warning.
- Identifier-family detection and unknown input.
- Batch limit rejection, duplicate annotation, stats and original line preservation.
- CSV escaping (quotes, commas, newlines, formula injection) and column output.
- Per-row and all-row copy formatting.

There are no UI snapshot tests; the interaction paths were verified in a real browser at multiple breakpoints.

---

## Research and honesty

This is an independent structural checker, not an MCA product. Sources used for the format rules include MCA CIN/company-category material, MoSPI Annual Survey of Industries CIN instructions, the Companies Act 2013 and LLP Act 2008 for context, plus observed MCA CINs for legacy state codes and `PLN`.

Where sources conflict, the app records the conflict instead of hiding it:

- **FLC/FTC** — official MCA/MoSPI material describes foreign-company subsidiaries; several secondary blogs say “financial leasing”. The official reading is used and the row note explains the discrepancy.
- **PLN** — observed in MCA CINs for Nidhi companies, absent from some older lists. Treated as observed.
- **State codes** — MCA-specific forms (`CT`, `OR`, `UR`) are accepted; ISO forms (`CG`, `OD`, `UK`) are rejected with a suggestion.
- **LLPIN** — three letters + hyphen + four digits. No check digit is invented.

See [`AI_USAGE_LOG.md`](./AI_USAGE_LOG.md) for an honest account of how AI tools were used, and [`INTERVIEW_GUIDE.md`](./INTERVIEW_GUIDE.md) / [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for walkthrough material.

---

## Scope statement

FileSure is a portfolio project. It is not affiliated with the Ministry of Corporate Affairs or any government body. Do not use a format result as evidence of registration, good standing or ownership.
