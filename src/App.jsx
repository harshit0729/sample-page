import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import BatchWorkbench from './components/BatchWorkbench'
import RegisterSection from './components/RegisterSection'
import MethodSection from './components/MethodSection'
import Footer from './components/Footer'
import Toast from './components/Toast'
import FormatGuideModal from './components/FormatGuideModal'
import { BatchLimitError, getInputStats, processBatch } from './utils/batchProcessor'
import { SAMPLE_INPUT } from './utils/constants'
import { csvFilename, downloadResultsCsv } from './utils/csvExport'
import { formatAllResultsText, formatResultText } from './utils/resultFormatter'
import { copyToClipboard } from './utils/clipboard'

function scrollToId(id, behavior = 'smooth') {
  document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
}

export default function App() {
  const [input, setInput] = useState('')
  const [batch, setBatch] = useState(null)
  const [lastRunInput, setLastRunInput] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [page, setPage] = useState(1)
  const [guideOpen, setGuideOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const textareaRef = useRef(null)
  const toastTimerRef = useRef(null)
  const toastIdRef = useRef(0)

  const stats = useMemo(() => getInputStats(input), [input])
  const dirty = Boolean(batch) && lastRunInput !== input

  const notify = useCallback((message, tone = 'success') => {
    toastIdRef.current += 1
    setToast({ id: toastIdRef.current, message, tone })
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3400)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(toastTimerRef.current)
    },
    [],
  )

  const openGuide = useCallback(() => setGuideOpen(true), [])
  const closeGuide = useCallback(() => setGuideOpen(false), [])

  function resetView() {
    setFilter('all')
    setTypeFilter('all')
    setQuery('')
    setExpandedIds(new Set())
    setPage(1)
  }

  function runValidation(text) {
    try {
      const nextBatch = processBatch(text)
      setBatch(nextBatch)
      setLastRunInput(text)
      setError('')
      resetView()
      return nextBatch
    } catch (caught) {
      if (caught instanceof BatchLimitError) {
        setError(caught.message)
        notify(caught.message, 'error')
        textareaRef.current?.focus()
      } else {
        setError('The batch could not be read. Try again with one identifier per line.')
        notify('The batch could not be read.', 'error')
      }
      return null
    }
  }

  function announceBatch(nextBatch, prefix = 'Checked') {
    const { total, validOnly, warnings, invalid } = nextBatch.stats
    const parts = [`${total} ${total === 1 ? 'identifier' : 'identifiers'}`]
    if (validOnly) parts.push(`${validOnly} valid`)
    if (warnings) parts.push(`${warnings} review`)
    if (invalid) parts.push(`${invalid} invalid`)
    notify(`${prefix}: ${parts.join(' · ')}.`, invalid ? 'info' : 'success')
  }

  function handleRun() {
    if (!input.trim()) {
      setError('Paste at least one CIN or LLPIN before running the check.')
      textareaRef.current?.focus()
      return
    }
    const nextBatch = runValidation(input)
    if (!nextBatch) return
    announceBatch(nextBatch)
    requestAnimationFrame(() => scrollToId('register'))
  }

  function handleRunSample() {
    setInput(SAMPLE_INPUT)
    const nextBatch = runValidation(SAMPLE_INPUT)
    if (!nextBatch) return
    announceBatch(nextBatch, 'Sample checked')
    requestAnimationFrame(() => scrollToId('register'))
  }

  function handleLoadSample() {
    setInput(SAMPLE_INPUT)
    setError('')
    notify('Sample loaded — 9 mixed identifiers. Press “Check identifiers” to run it.', 'info')
  }

  function handleClear() {
    setInput('')
    setBatch(null)
    setLastRunInput(null)
    setError('')
    resetView()
    notify('Workspace cleared. The input and the register are empty.', 'info')
    textareaRef.current?.focus()
  }

  function handlePasteOwn() {
    scrollToId('workbench')
    window.setTimeout(() => textareaRef.current?.focus({ preventScroll: true }), 280)
  }

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter)
    setPage(1)
    setExpandedIds(new Set())
  }

  function handleTypeChange(nextType) {
    setTypeFilter(nextType)
    setPage(1)
    setExpandedIds(new Set())
  }

  function handleQueryChange(nextQuery) {
    setQuery(nextQuery)
    setPage(1)
    setExpandedIds(new Set())
  }

  function handleClearFilters() {
    resetView()
  }

  function handlePageChange(nextPage) {
    setPage(nextPage)
    setExpandedIds(new Set())
    scrollToId('register')
  }

  function handleToggle(id) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCopyResult(result) {
    const copied = await copyToClipboard(formatResultText(result))
    notify(
      copied
        ? `Record for ${result.normalized || 'this line'} copied.`
        : 'Copy failed. Select the text manually.',
      copied ? 'success' : 'error',
    )
  }

  async function handleCopyAll(results) {
    const copied = await copyToClipboard(formatAllResultsText(results))
    notify(
      copied
        ? `${results.length} rows copied as tab-separated text.`
        : 'Copy failed. Use the CSV export instead.',
      copied ? 'success' : 'error',
    )
  }

  function handleExport(results) {
    downloadResultsCsv(results, csvFilename())
    notify(`CSV downloaded — ${results.length} rows, including errors and notes.`, 'success')
  }

  return (
    <div className="min-h-screen bg-paper">
      <a href="#workbench" className="skip-link">
        Skip to the workbench
      </a>

      <Header onOpenGuide={openGuide} />

      <main>
        <Hero onRunSample={handleRunSample} onOpenGuide={openGuide} />

        <BatchWorkbench
          value={input}
          onChange={(value) => {
            setInput(value)
            if (error) setError('')
          }}
          onRun={handleRun}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
          stats={stats}
          error={error}
          textareaRef={textareaRef}
        />

        <RegisterSection
          batch={batch}
          dirty={dirty}
          onRerun={handleRun}
          onRunSample={handleRunSample}
          onPasteOwn={handlePasteOwn}
          onOpenGuide={openGuide}
          filter={filter}
          onFilterChange={handleFilterChange}
          typeFilter={typeFilter}
          onTypeChange={handleTypeChange}
          query={query}
          onQueryChange={handleQueryChange}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          onCopyAll={handleCopyAll}
          onCopy={handleCopyResult}
          expandedIds={expandedIds}
          onToggle={handleToggle}
          page={page}
          onPageChange={handlePageChange}
        />

        <MethodSection onOpenGuide={openGuide} />
      </main>

      <Footer onOpenGuide={openGuide} />

      <Toast toast={toast} />
      {guideOpen ? <FormatGuideModal onClose={closeGuide} /> : null}
    </div>
  )
}
