import { useMemo } from 'react'
import { Info, RotateCcw } from 'lucide-react'
import SectionHeading from './SectionHeading'
import SummaryStrip from './SummaryStrip'
import FilterBar from './FilterBar'
import ResultsTable from './ResultsTable'
import ResultCards from './ResultCards'
import Pagination from './Pagination'
import { EmptyRegister, NoMatches } from './EmptyStates'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { STATUS } from '../utils/constants'

const PAGE_SIZE = 50

function haystack(result) {
  const fields = result.fields
  return [
    result.original,
    result.normalized,
    result.type,
    result.summary,
    fields.listingLabel,
    fields.stateName,
    fields.stateCode,
    fields.categoryLabel,
    fields.categoryCode,
    fields.industryCode,
    fields.year,
    fields.registrationNumber,
    fields.llpinPrefix,
    fields.llpinSerial,
  ]
    .filter((value) => value !== null && value !== undefined && value !== '')
    .join(' ')
    .toUpperCase()
}

export default function RegisterSection({
  batch,
  dirty,
  onRerun,
  onRunSample,
  onPasteOwn,
  onOpenGuide,
  filter,
  onFilterChange,
  typeFilter,
  onTypeChange,
  query,
  onQueryChange,
  onClearFilters,
  onExport,
  onCopyAll,
  onCopy,
  expandedIds,
  onToggle,
  page,
  onPageChange,
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const results = useMemo(() => batch?.results ?? [], [batch])

  const counts = useMemo(
    () => ({
      all: results.length,
      valid: results.filter((result) => result.status === STATUS.valid).length,
      warning: results.filter((result) => result.status === STATUS.warning).length,
      invalid: results.filter((result) => result.status === STATUS.invalid).length,
    }),
    [results],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toUpperCase()
    return results.filter((result) => {
      if (filter !== 'all' && result.status !== filter) return false
      if (typeFilter === 'cin' && result.identifierKind !== 'cin') return false
      if (typeFilter === 'llpin' && result.identifierKind !== 'llpin') return false
      if (needle && !haystack(result).includes(needle)) return false
      return true
    })
  }, [results, filter, typeFilter, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(startIndex, startIndex + PAGE_SIZE)
  const showingStart = filtered.length === 0 ? 0 : startIndex + 1
  const showingEnd = Math.min(startIndex + PAGE_SIZE, filtered.length)

  const runTime = batch?.processedAt
    ? batch.processedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <section id="register" className="container-page pb-12 pt-4 lg:pb-16">
      <SectionHeading
        number="02"
        title="The register"
        description="One row per pasted line, in input order. Expand any row to see its decode trace, structural checks and caveats."
        aside={batch ? `Checked at ${runTime}` : 'Awaiting a batch'}
      />

      {!batch ? (
        <EmptyRegister
          onRunSample={onRunSample}
          onPasteOwn={onPasteOwn}
          onOpenGuide={onOpenGuide}
        />
      ) : (
        <>
          {dirty ? (
            <div
              role="status"
              className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-caution-100 bg-caution-50 px-3.5 py-2.5"
            >
              <p className="text-[11px] leading-5 text-caution-700">
                <span className="font-bold">Input edited since this run.</span> The register
                below reflects the previous batch.
              </p>
              <button
                type="button"
                onClick={onRerun}
                className="inline-flex items-center gap-1.5 rounded-md border border-caution-600/25 bg-white px-2.5 py-1.5 text-[10.5px] font-bold text-caution-700 transition hover:border-caution-600/50"
              >
                <RotateCcw size={11} strokeWidth={2.2} aria-hidden="true" />
                Check the new input
              </button>
            </div>
          ) : null}

          <SummaryStrip stats={batch.stats} />

          {batch.stats.duplicateLines > 0 ? (
            <p className="mt-2 flex items-start gap-1.5 text-[10.5px] leading-4 text-caution-700">
              <Info size={11} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {batch.stats.duplicateLines} lines share{' '}
                {batch.stats.duplicateGroups === 1
                  ? 'one repeated identifier'
                  : `${batch.stats.duplicateGroups} repeated identifiers`}
                . Duplicates stay in the register and are counted individually.
              </span>
            </p>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <FilterBar
              filter={filter}
              onFilterChange={onFilterChange}
              counts={counts}
              typeFilter={typeFilter}
              onTypeChange={onTypeChange}
              query={query}
              onQueryChange={onQueryChange}
              onExport={() => onExport(results)}
              onCopyAll={() => onCopyAll(results)}
              disabled={results.length === 0}
            />

            {filtered.length === 0 ? (
              <NoMatches onClear={onClearFilters} />
            ) : isDesktop ? (
              <ResultsTable
                results={pageRows}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onCopy={onCopy}
                onOpenGuide={onOpenGuide}
              />
            ) : (
              <div className="p-3">
                <ResultCards
                  results={pageRows}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onCopy={onCopy}
                  onOpenGuide={onOpenGuide}
                />
              </div>
            )}

            {filtered.length > 0 ? (
              <Pagination
                page={safePage}
                pageCount={pageCount}
                start={showingStart}
                end={showingEnd}
                total={filtered.length}
                onPageChange={onPageChange}
              />
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}
