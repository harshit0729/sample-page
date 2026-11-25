# Demo script

A five-minute live walkthrough. The sample batch is already built in, so nothing needs to be typed during the demo unless you want to show the error paths.

**Before you start**

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). Keep the window at a normal laptop width; the table/card breakpoint is at 1024 px.

---

## 0:00 — Frame the problem (30 seconds)

> “A CIN is 21 characters. People paste them into spreadsheets and half of them are one character short, or use `OD` instead of `OR`. A regex will tell you it failed, but not why. And a green tick does not mean the company exists.”

Point at the header chip: **FORMAT ONLY**.

> “So this checks structure, decodes every block, and says where the paper trail stops.”

---

## 0:30 — Run the sample (45 seconds)

Click **Run the sample batch** in the hero.

The page loads nine identifiers and scrolls to the register.

> “Seven CINs and two LLPINs. One of them is a Nidhi company, one is a government company in Ladakh, one uses the old Chhattisgarh code, one is Uttarakhand. There is a listed company from 1973 and a 2020 Nidhi.”

Point at the summary strip:

> “Checked nine, valid format nine, no review notes, no invalid. The scope cell says format only.”

If any row shows **Review notes**, say so — it is a real outcome, not a failure:

> “Amber means the shape is valid but a field is worth a second look — an unknown category, or a legacy state code.”

---

## 1:15 — Open one row (60 seconds)

Click a CIN row to expand.

Walk down the panel in order:

1. **Decode trace** — listing bit, NIC code, state, year, category, ROC serial, each with its position range.
2. **Checks** — every rule listed separately, pass or fail.
3. **Notes** — the plain-language summary, and any provenance caveat.
4. **Copy row** — the record as text.

> “The trace is generated from fixed positions, not from a lookup. That is why a malformed string still produces a partial trace.”

Open the Nidhi row if present (`U65929MH2020PLN350399`):

> “`PLN` is a Nidhi category. It is missing from some older published lists, so it is flagged as observed rather than silently accepted or silently rejected.”

Open the Ladakh row (`U74999LH2021GOI011282`):

> “`LH` is Ladakh, `GOI` is a government company. Both are accepted and annotated.”

---

## 2:15 — Show a failure (45 seconds)

Select all in the textarea and paste a deliberate mistake:

```
U72200KA2015PTC08223
U72200OD2015PTC082236
AAB4321
```

Click **Check identifiers**.

> “Three different failures. The first is 20 characters — the trace still shows which block is short. The second uses the ISO code `OD`; the checker says MCA uses `OR` rather than just rejecting it. The third is an LLPIN missing its hyphen.”

Point at the red status and the inline error text.

> “Nothing is guessed. The fix is named.”

---

## 3:00 — Batch behaviour (45 seconds)

Paste 501 lines (or press End and paste one extra line onto a long batch).

> “The limit is 500. It rejects the batch whole — it does not quietly check the first 500. The run button disables and the previous results stay behind a notice.”

Then paste:

```
U72200KA2015PTC082236
U72200KA2015PTC082236
u72200ka2015ptc082236
```

Run it.

> “Three lines, one identifier. Duplicates are kept and marked `×2`, and the lowercase line shows both its original and normalised form. Counts always reconcile with what was pasted.”

---

## 3:45 — Search, filter, export (45 seconds)

- Click **Review** / **Invalid** filters; the counts come from the current batch.
- Type `Karnataka` in search; it matches decoded fields, not just the raw string.
- Click **CSV**. Open the download.

> “The export carries the original and normalised identifier, every decoded field, errors, warnings, occurrence count, and the format-only note. Leading `=`, `+`, `-` and `@` are escaped so a spreadsheet cannot execute a cell.”

Click **Copy all** and paste into a blank editor to show the tab-separated shape.

---

## 4:30 — Field guide and method (30 seconds)

Click **Field guide**.

> “The same code lists the validator uses, with the legacy notes and the conflicts. This is not a separate document that can drift from the code.”

Scroll to **Method & limits**.

> “A well-formed CIN can still belong to a struck-off company. LLPINs carry no state, year or check digit. The tool says that in the UI, in the CSV and in the README.”

Close on:

> “Format is not a fact. The register is the record.”

---

## Recovery lines

| If | Say |
| --- | --- |
| The scroll does not move after running the sample | “The scroll is a convenience; the results are below.” Scroll manually. It can be suppressed in a background tab. |
| A screenshot tool or projector crops the table | Resize to below 1024 px to show the card layout. |
| Someone asks for a live MCA lookup | “Deliberately out of scope — there is no unauthenticated MCA API, and faking one would undermine the format-only claim.” |
| Someone pastes a real CIN that returns invalid | Check length and state code first. If it looks correct, it may use a code not yet in the snapshot; that is the known limitation. |

---

## What not to claim

- Do not say a green row means the company exists or is active.
- Do not say the app verifies with MCA.
- Do not say the code lists are exhaustive or current to today.
- Do not claim a deployment URL unless it has been opened and checked.
