# Interview guide

A short, honest walkthrough of the decisions behind FileSure. It is written for a reviewer who has the app open and ten minutes to spare.

---

## 1. The one-sentence version

FileSure checks whether a CIN or LLPIN is **structurally possible**, decodes every block it can, explains every failure — and refuses to pretend that a well-formed string proves a company exists.

---

## 2. Why the format/fact split drives the design

Most identifier checkers fail in one of two ways:

1. They return a green tick for anything that matches a regex, which implies more than it should.
2. They hide the reasoning, so a user cannot tell a typo from an unsupported code.

The whole interface is built around avoiding both. The phrase **“Format only · no MCA lookup”** appears in the header, the summary strip, every expanded row, the CSV export and the footer. The green state is labelled *Valid format*, never *Verified*.

**Talking point:** a validator that cannot say what it has not checked is not trustworthy; it is just confident.

---

## 3. Architecture decisions worth defending

### 3.1 Validation is split from presentation

```
input string
  → validateIdentifier()        family detection (CIN / LLPIN / unknown)
      → cinDecoder()            pure position slicing, no judgements
      → cinValidator()          per-block checks + aggregate status
      → llpinValidator()        shape checks
  → batchProcessor()            line parsing, 500 limit, duplicate annotation
  → RegisterSection             filtering, pagination, summary
```

The decoder never decides validity. It slices fixed positions and reports what it found. The validator applies rules to that slice. This is why a 20-character CIN still renders a useful six-block trace instead of a generic “invalid” message.

**Talking point:** extraction and judgement are separate so the error can point at the missing character, not at the whole string.

### 3.2 Code lists are data, not conditionals

`src/data/stateCodes.js` and `src/data/companyTypes.js` hold the mappings, each entry carrying a confidence/provenance flag. The validator asks the data layer; the UI renders the same data in the Field guide. Adding a newly notified state code is a one-line data change, not a validator edit.

### 3.3 The 500 limit is a hard stop, not a truncation

`batchProcessor` rejects the whole batch when lines exceed 500. It does not silently drop the tail. The intake panel shows an explicit alert, the run button disables, and the previously checked batch stays visible behind a “previous batch” notice. Silently processing the first 500 of 501 would produce a plausible but wrong report.

### 3.4 Duplicates are annotated, never collapsed

A pasted column is a record of what the user supplied. Removing duplicate lines would break the reconciliation between input count and output count. Duplicates stay, are marked `×N`, and are validated individually. CSV includes an `Occurrences` column.

### 3.5 Original input is preserved

Normalisation (trim, uppercase, strip zero-width characters) is visible: the table shows both `Original identifier` and `Normalised identifier`. If a user pasted lowercase, they can see that the checker changed it.

---

## 4. Research corrections (the part most candidates skip)

These are real conflicts found while building, and they are recorded in the app rather than smoothed over.

| Issue | Common claim | What the app does |
| --- | --- | --- |
| `FLC` / `FTC` | “Financial leasing company” | Reads them as public/private subsidiaries of a foreign company, per MCA/MoSPI material, and explains the discrepancy in the row note. |
| `PLN` | Absent from several older category lists | Treats it as an observed Nidhi code and flags it as observed, not official-list-verified. |
| State codes | ISO codes such as `OD`, `CG`, `UK` | Rejects them in the state block, because MCA CINs use `OR`, `CT`, `UR`, and suggests the MCA code. |
| Legacy codes | `TS`, `UT`, `DD`, `DN`, `LH` look obsolete | Accepts and annotates them. Legacy is not invalid. |
| LLPIN | Some sources imply a check digit | There is none. The decoder says so plainly. |

**Talking point:** where the sources disagree, the tool shows the disagreement. A guessed mapping is worse than a flagged unknown.

---

## 5. UI decisions

- **Registry desk, not dashboard.** Deep navy intake, warm paper, one signal blue. Green/amber/red are reserved exclusively for status, so colour always means the same thing.
- **Fixed-width monospace identifiers.** Position reading is the core task; proportional type makes it harder.
- **No card grid.** Hairline rules, numbered sections and ledger strips carry the hierarchy instead of floating panels.
- **Table at ≥1024 px, cards below.** A 21-character identifier plus status plus actions does not survive a 768 px table without truncation.
- **50 rows per page.** 500 rows in one DOM tree is sluggish on low-end laptops; pagination keeps filtering responsive.
- **Motion is minimal.** A short hero rise, a row-detail reveal, a toast. `prefers-reduced-motion` is respected.

---

## 6. Testing

`npm test` runs **59 tests across 6 files**:

| File | Focus |
| --- | --- |
| `cinValidator.test.js` (19) | decode, length, character, state, year, category, registration, warnings |
| `llpinValidator.test.js` (11) | normalisation, separator, serial, length, warnings |
| `validateIdentifier.test.js` (8) | family detection, unknown input, edge whitespace |
| `batchProcessor.test.js` (8) | 500 limit, duplicates, stats, original preservation |
| `csvExport.test.js` (10) | escaping, quotes, commas, newlines, formula injection |
| `resultFormatter.test.js` (3) | row copy and batch copy formats |

Deliberately **not** tested with snapshots: the UI was verified in a real browser at 320, 375, 768, 1024 and 1440 px, including the over-limit path, CSV download, pagination, filtering and the modal focus trap.

**Talking point:** the pure functions carry the risk; the UI carries the judgement. Testing the first heavily and the second by hand is a deliberate trade for a project this size.

---

## 7. Questions a reviewer may ask

**“Why no TypeScript?”**
The assignment specified JavaScript. The data shapes are documented by the validator result objects and covered by tests. If this grew, the first change would be typed result contracts.

**“Why no MCA API?”**
There is no public unauthenticated MCA lookup API, and adding a proxy would introduce a backend, secrets and a rate-limit problem the brief excluded. Faking a lookup would be worse than not having one.

**“What happens with a valid-looking CIN for a struck-off company?”**
It returns *Valid format*. That is correct and explicitly stated. The app links to the MCA register for the actual record.

**“What is the weakest part?”**
The code lists are a snapshot. MCA adds categories and migrates state codes. The mitigation is provenance flags plus “unknown is a warning, never a guess” — but a list can still lag reality.

**“What would you do with another week?”**
1. Import from `.csv`/`.xlsx` with column selection, instead of paste-only.
2. A diff view for re-checking the same batch over time.
3. A shareable, URL-encoded batch (still client-side).
4. More observed legacy codes, with dates and source links per entry.

---

## 8. File map for a code review

| Concern | File |
| --- | --- |
| Batch state, actions, toasts | `src/App.jsx` |
| Family detection | `src/utils/validateIdentifier.js` |
| CIN rules | `src/utils/cinValidator.js` |
| Position slicing | `src/utils/cinDecoder.js` |
| LLPIN rules | `src/utils/llpinValidator.js` |
| Limit + duplicates | `src/utils/batchProcessor.js` |
| Code mappings | `src/data/stateCodes.js`, `src/data/companyTypes.js` |
| CSV safety | `src/utils/csvExport.js` |
| Results UI | `src/components/RegisterSection.jsx` |
| Field reference | `src/components/FormatGuideModal.jsx` |
| Design tokens | `src/index.css`, `tailwind.config.js` |
