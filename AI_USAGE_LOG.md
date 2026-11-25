# AI usage log

This project was built with an AI coding assistant (OpenCode) working under human direction. This file records what that actually meant: what the assistant produced, what it got wrong, what was verified, and what remains a human responsibility.

It is intentionally specific. A log that says “AI helped with the code” is not useful to a reviewer.

---

## 1. Division of work

**Human direction**

- Chose the product: a format-only CIN/LLPIN checker, not a company lookup.
- Set the constraints: browser-only, React + Vite + JavaScript + Tailwind, no backend/API/auth, 500-row limit, tests and docs.
- Specified the visual direction: registry desk, navy/paper, restrained colour, no generic dashboard cards.
- Supplied the repository and the requirement not to force-push or commit secrets.
- Reviewed output in a real browser and rejected several iterations (spacing, wording, mobile layout).

**AI assistance**

- Drafted the component structure and wrote the implementation.
- Wrote the validation, decoding, batch, CSV and formatting utilities and their tests.
- Drafted the README, this log, the interview guide and the demo script.
- Ran the test, lint and build commands and reported the results.
- Drove the browser for responsive checks and interaction testing.

**Not delegated**

- Deciding whether a rule is correct in the real world.
- Accepting a deployment or a push on the owner’s behalf.
- Claiming that a company exists because its CIN parses.

---

## 2. Research and the corrections that mattered

The assistant’s first-pass summaries of Indian identifier rules contained errors that were caught before shipping.

### 2.1 `FLC` / `FTC`

**First pass:** “financial leasing company”.

**Correction:** MCA and MoSPI material describe these as public and private subsidiaries of foreign companies. The “financial leasing” reading is widespread in secondary blogs and appears to be a propagation error.

**Resolution:** the app uses the foreign-subsidiary reading and explains the discrepancy in the row note. See `src/data/companyTypes.js`.

### 2.2 `PLN`

**First pass:** absent from the category list.

**Correction:** `PLN` appears in observed MCA CINs for Nidhi companies but is missing from some older published lists.

**Resolution:** added as an *observed* code with an explicit provenance flag, not presented as an official-list entry.

### 2.3 State codes

**First pass:** ISO state codes (`OD`, `CG`, `UK`, `UA`, `LA`) accepted alongside MCA codes.

**Correction:** MCA CINs use `OR`, `CT`, `UR`, etc. Accepting ISO aliases would silently validate identifiers that the registry would not issue.

**Resolution:** MCA codes are accepted; ISO forms are rejected with a suggestion. Legacy MCA codes (`TS`, `UT`, `DD`, `DN`, `LH`) are accepted and annotated. See `src/data/stateCodes.js`.

### 2.4 LLPIN

**First pass:** an assumed check digit, because “most identifiers have one”.

**Correction:** an LLPIN is three letters, a hyphen and four digits. There is no check digit and no embedded state or year.

**Resolution:** the decoder says exactly that, and the UI does not invent fields to fill space.

**What this says about the process:** the assistant was useful for structure and volume, and unreliable on domain facts. Every mapping that carries a real-world claim was checked against a named source or observed data before it was allowed into the UI.

---

## 3. Real defects found during review

These were observed in the running app, not hypothetical.

| # | Defect | Cause | Fix |
| --- | --- | --- | --- |
| 1 | Horizontal scroll at 320 px | `body { min-width: 320px }` combined with scrollbar width made the document wider than the viewport | Removed the min-width; verified `scrollWidth === clientWidth` at 320 px |
| 2 | Field guide tables were unreadable on phones | Four-column tables forced into a 320 px modal | Replaced with a responsive grid that stacks the reading under the block |
| 3 | Status badges wrapped mid-word | Badge lacked `whitespace-nowrap` | Added it; badge height is stable at 19 px |
| 4 | Duplicate wording was ambiguous | “N repeated lines are kept” did not say what was repeated | Rewritten to count repeated identifiers and state that occurrences are counted individually |
| 5 | Search placeholder was truncated | Placeholder text longer than the field at 375 px | Shortened to “Search identifier or state” and fixed the field width |
| 6 | Summary strip left an empty cell at 768 px | Five cells across a two-column layout | Scope cell spans the remaining columns at that breakpoint |
| 7 | Copy/CSV buttons crowded the filter bar on mobile | Text labels plus icons | Icon-only under `sm`, with `aria-label` and `title` retained |
| 8 | Auto-scroll after “Run the sample” did not fire in a background tab | `requestAnimationFrame` is paused when the tab is hidden | Accepted as expected browser behaviour; documented in the demo script |
| 9 | Category displayed twice in mobile cards | Card meta repeated fields already in the header | Meta now shows NIC code, ROC serial and state |
| 10 | `FLC`/`FTC` note contradicted the row label | Label and note came from different passes | Unified on the foreign-subsidiary reading |

The first seven were fixed and re-checked. The eighth is a browser constraint, not a bug to paper over.

---

## 4. Verification performed

**Automated**

- `npm test` — 59 tests across 6 files, all passing.
- `npm run lint` — no warnings or errors.
- `npm run build` — production build completed; `dist/` generated.

**Manual, in a real browser**

- 320, 375, 768, 1024 and 1440 px: no horizontal overflow after fix #1.
- Table renders at 1024 px and above; cards below.
- Sample batch: nine rows, expected statuses.
- Over-limit: 501 lines disables the run, shows the limit alert, preserves the previous batch, and flags the input as stale.
- CSV: downloaded, opened, header and BOM checked, formula-injection escaping present.
- Field guide: opens, focus moves to the close button, background scroll locks, Escape closes.
- Pagination and filters at 50 rows per page.

**Not verified**

- Safari and Firefox. Testing was Chromium-based only.
- Screen-reader announcement order beyond focus management and labels.
- Real MCA records. The app does not query them, by design.

---

## 5. Claims the assistant did **not** make

- No live deployment URL was claimed. Vercel CLI was logged out; an anonymous temporary deployment was created, but Vercel's edge returned `403` (`X-Vercel-Mitigated: deny`) when it was opened, so it was not treated as a deployment. The GitHub push did succeed using an existing git credential even though `gh` was logged out, and the remote `main` commit was verified with `git ls-remote`.
- No test count, build result or responsive result in this repository is estimated. Each was produced by running the command or inspecting the page.
- No MCA record, company status or ownership claim is made anywhere in the app or docs.
- No source is cited that was not actually consulted. Where a code is based on observed identifiers rather than a published list, it is labelled “observed”.

---

## 6. Residual risks

1. **Code-list drift.** MCA adds categories and migrates state codes. The snapshot can lag; unknown codes warn rather than guess, but the warning still depends on a human reading it.
2. **LLPIN format variance.** The `AAA-0000` shape is well established, but the app cannot prove a serial was actually issued.
3. **Single-browser QA.** Layout and keyboard behaviour were checked in Chromium only.
4. **No end-to-end test harness.** Interaction paths were verified by hand; a regression could slip through a refactor that leaves the unit tests green.

Each of these is stated in the README or the Method section rather than left implicit.
