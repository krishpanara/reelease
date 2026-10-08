'use client'

import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { PageHeader } from '@/components/reusable/PageHeader'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { csvHeader, csvSample } from '@/data/bulk'
import { mockAccounts } from '@/data/socialMedia'
import { useGetSocialAccountsQuery } from '@/redux/api/socialApi'
import { useBulkPublishMutation } from '@/redux/api/socialPublishApi'
import { BulkResult, BulkRow } from '@/types/bulk'
import { ArrowLeft, ArrowRight, Layers2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfirmClearModal } from './ConfirmClearModal'
import { ResultsModal } from './ResultsModal'
import { Step1Accounts } from './Step1Accounts'
import { Step1Sidebar } from './Step1Sidebar'
import { Step2CsvUpload } from './Step2CsvUpload'
import { Step2Sidebar } from './Step2Sidebar'
import { Step3Settings } from './Step3Settings'
import { Step3Sidebar } from './Step3Sidebar'
import { Step4Review } from './Step4Review'
import { Step4Sidebar } from './Step4Sidebar'
import { StepWizardStepper } from './StepWizardStepper'

const newRow = (): BulkRow => ({
  id: Math.random().toString(36).slice(2),
  caption: '',
  accountIds: [],
  mediaUrl: '',
  contentType: 'post',
  scheduledAt: '',
  errors: {},
})

export default function BulkScheduleContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const csvRef = useRef<HTMLInputElement>(null)

  // ── API Accounts & Mutations ────────────────────────────────────────────────
  const { data: accountsData } = useGetSocialAccountsQuery(undefined)
  const accounts: any[] = accountsData?.data || []
  const displayedAccounts = accounts.length > 0 ? accounts : mockAccounts
  // const displayedAccounts = accounts.length > 0 ? accounts : []

  const [bulkPublish, { isLoading }] = useBulkPublishMutation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // ── Steps state ───────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1)

  // ── Step 1: Selected Accounts State ─────────────────────────────────────────
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])

  // ── Step 2: CSV / Data State ────────────────────────────────────────────────
  const [rows, setRows] = useState<BulkRow[]>([newRow()])
  const [csvFileName, setCsvFileName] = useState<string>('')
  const [csvFileSize, setCsvFileSize] = useState<string>('')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isDragOverCsv, setIsDragOverCsv] = useState(false)
  const [isDragOverMedia, setIsDragOverMedia] = useState(false)

  // ── Step 3: Settings State ─────────────────────────────────────────────────
  const [postingInterval, setPostingInterval] = useState(10)
  const [timezone, setTimezone] = useState('(GMT+5:30) Asia/Kolkata')
  const [timezoneDropdownOpen, setTimezoneDropdownOpen] = useState(false)

  const [maxPostsPerDay, setMaxPostsPerDay] = useState<number | ''>(10)
  const [skipHolidays, setSkipHolidays] = useState(false)
  const [autoHashtagRules, setAutoHashtagRules] = useState<string[]>([])
  const [hashtagRuleInput, setHashtagRuleInput] = useState('')
  const [stopOnError, setStopOnError] = useState(true)
  const [addFirstComment, setAddFirstComment] = useState(true)

  // Start Date popover state: default tomorrow at 10:00 AM
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d
  })
  const [scheduledTime, setScheduledTime] = useState<string>('10:00')

  // Column detection state
  const [detectedColumns, setDetectedColumns] = useState({
    dateTime: 'Optional',
    caption: 'Optional',
    mediaUrl: 'Optional',
    platforms: 'Optional',
    firstComment: 'Optional',
    location: 'Optional',
    labels: 'Optional',
  })

  // ── Step 4: Confirm State ─────────────────────────────────────────────────
  const [isReviewed, setIsReviewed] = useState(false)
  const [result, setResult] = useState<BulkResult | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  // Group accounts by platform
  const groupedAccounts = displayedAccounts.reduce((acc: any, account: any) => {
    const platform = account.platform?.toLowerCase() || 'other'
    if (!acc[platform]) acc[platform] = []
    acc[platform].push(account)
    return acc
  }, {})

  const allAccountsSelected = selectedAccountIds.length === displayedAccounts.length

  const handleSelectAllAccounts = () => {
    if (allAccountsSelected) {
      setSelectedAccountIds([])
    } else {
      setSelectedAccountIds(displayedAccounts.map((a) => a.id || a._id))
    }
  }

  const handleToggleAccount = (id: string) => {
    setSelectedAccountIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  // Update account mapping in rows whenever step 1 accounts or rows changes
  useEffect(() => {
    if (selectedAccountIds.length > 0) {
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          accountIds: selectedAccountIds,
        })),
      )
    }
  }, [selectedAccountIds])

  // ── Row management ──────────────────────────────────────────────────────────
  const addRow = () => setRows((r) => [...r, { ...newRow(), accountIds: selectedAccountIds }])

  const removeRow = (id: string) =>
    setRows((r) =>
      r.length === 1 ? [{ ...newRow(), accountIds: selectedAccountIds }] : r.filter((row) => row.id !== id),
    )

  const updateRow = (id: string, field: string, value: any) =>
    setRows((r) =>
      r.map((row) => {
        if (row.id !== id) return row
        const newErrors = { ...row.errors }
        delete newErrors[field]
        return { ...row, [field]: value, errors: newErrors }
      }),
    )

  // ── Validation ──────────────────────────────────────────────────────────────
  const isRowFilled = (row: BulkRow) => {
    return (
      row.caption.trim() !== '' ||
      row.mediaUrl.trim() !== '' ||
      ((row as any).mediaFiles && (row as any).mediaFiles.length > 0)
    )
  }

  const allRowsFilled = rows.every(isRowFilled)
  const validRowsCount = rows.filter(isRowFilled).length
  const validationPercentage = rows.length > 0 ? Math.round((validRowsCount / rows.length) * 100) : 0

  const validate = (): boolean => {
    let valid = true
    setRows((prev) =>
      prev.map((row) => {
        const errors: Record<string, string> = {}
        const hasAttachedMedia = (row as any).mediaFiles && (row as any).mediaFiles.length > 0
        if (!row.caption.trim() && !row.mediaUrl.trim() && !hasAttachedMedia) {
          errors.caption = 'Caption or media is required'
          valid = false
        }
        if (selectedAccountIds.length === 0 && row.accountIds.length === 0) {
          errors.accountIds = 'At least one account is required'
          valid = false
        }
        return { ...row, errors }
      }),
    )
    return valid
  }

  // Apply scheduling interval to rows on transition to step 4
  const applySettingsToRows = () => {
    const baseDate = scheduledDate ? new Date(scheduledDate) : new Date()
    if (scheduledTime) {
      const [h, m] = scheduledTime.split(':')
      baseDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0)
    }

    let currentTime = new Date(baseDate)
    const intervalMinutes = postingInterval || 10
    let postsToday = 0

    const advanceToNextValidDay = (date: Date) => {
      date.setDate(date.getDate() + 1)
      if (scheduledTime) {
        const [h, m] = scheduledTime.split(':')
        date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0)
      } else {
        date.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0)
      }

      if (skipHolidays) {
        while (date.getDay() === 0 || date.getDay() === 6) {
          date.setDate(date.getDate() + 1)
        }
      }
    }

    // Ensure the initial day is valid if skipHolidays is true
    if (skipHolidays) {
      while (currentTime.getDay() === 0 || currentTime.getDay() === 6) {
        advanceToNextValidDay(currentTime)
      }
    }

    const maxPostsLimit = maxPostsPerDay === '' ? 10 : maxPostsPerDay

    setRows((prev) => {
      return prev.map((row, index) => {
        if (index > 0) {
          postsToday++
          if (postsToday >= maxPostsLimit) {
            advanceToNextValidDay(currentTime)
            postsToday = 0
          } else {
            currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes)
          }
        }

        const pad = (n: number) => n.toString().padStart(2, '0')
        const val = `${currentTime.getFullYear()}-${pad(currentTime.getMonth() + 1)}-${pad(currentTime.getDate())}T${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}`

        return {
          ...row,
          scheduledAt: val,
        }
      })
    })
  }

  // ── CSV Import ─────────────────────────────────────────────────────────────
  const downloadTemplate = () => {
    const blob = new Blob([csvHeader + '\n' + csvSample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk_posts_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please select a valid CSV file.')
      return
    }

    setCsvFileName(file.name)
    setCsvFileSize(`${(file.size / 1024).toFixed(1)} KB`)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        const lines = text.split('\n').filter(Boolean)
        const headerLine = lines[0].toLowerCase().trim()
        const headers = headerLine.split(',')

        if (!headerLine.includes('caption')) {
          toast.error('Invalid CSV format. Please use the provided template.')
          return
        }

        // Auto column validation state
        setDetectedColumns({
          dateTime: headers.includes('scheduled_at') ? 'Valid' : 'Optional',
          caption: headers.includes('caption') ? 'Valid' : 'Optional',
          mediaUrl: headers.includes('media_url') ? 'Valid' : 'Optional',
          platforms: headers.includes('content_type') ? 'Valid' : 'Optional',
          firstComment: headers.includes('first_comment') ? 'Valid' : 'Optional',
          location: headers.includes('location') ? 'Valid' : 'Optional',
          labels: headers.includes('labels') ? 'Valid' : 'Optional',
        })

        const dataLines = lines.slice(1)
        const imported: BulkRow[] = dataLines
          .map((line) => {
            const cols = line.split(',')
            const rowMediaUrl = cols[1]?.trim() || ''
            return {
              id: Math.random().toString(36).slice(2),
              caption: cols[0]?.trim() || '',
              mediaUrl: rowMediaUrl,
              contentType: cols[2]?.trim() || 'post',
              scheduledAt: cols[3]?.trim() || '',
              firstComment: cols[4]?.trim() || '',
              accountIds: selectedAccountIds,
              mediaFiles: rowMediaUrl ? [rowMediaUrl] : [], // Populate mediaFiles carousel with CSV mediaUrl
              errors: {},
            } as any
          })
          .filter((r) => r.caption || r.mediaUrl)

        if (imported.length === 0) {
          toast.error('No valid rows found in CSV.')
          return
        }
        setRows(imported)
        toast.success(`${imported.length} rows imported from CSV`)
      } catch {
        toast.error('Failed to parse CSV file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Drag & Drop Handlers ───────────────────────────────────────────────────
  const handleCsvDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverCsv(true)
  }

  const handleCsvDragLeave = () => {
    setIsDragOverCsv(false)
  }

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverCsv(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      const fakeEvent = {
        target: {
          files: [file],
          value: '',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleCsvImport(fakeEvent)
    } else {
      toast.error('Please drop a valid CSV file.')
    }
  }

  const handleMediaDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverMedia(true)
  }

  const handleMediaDragLeave = () => {
    setIsDragOverMedia(false)
  }

  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverMedia(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const localAttachments = files.map((f) => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        file_path: URL.createObjectURL(f),
        file_type: f.type.startsWith('video/') ? 'video' : 'image',
        mime_type: f.type,
      }))
      handleMediaSelect(localAttachments)
      toast.success(`${files.length} files dropped successfully!`)
    }
  }

  // ── Media Library Selection ────────────────────────────────────────────────
  const handleMediaSelect = (attachments: any | any[]) => {
    const newMedia = Array.isArray(attachments) ? attachments : [attachments]

    // Add selected media items to ALL rows as multiple media (carousel)
    setRows((prev) =>
      prev.map((row) => {
        const existing = (row as any).mediaFiles || []
        const existingPaths = new Set(existing.map((m: any) => m.id || m._id || m.file_path || m))
        const filteredNew = newMedia.filter((m) => !existingPaths.has(m.id || m._id || m.file_path))
        return {
          ...row,
          mediaFiles: [...existing, ...filteredNew],
        }
      }),
    )

    toast.success(`${newMedia.length} media item(s) selected and mapped to rows`)
  }

  // ── Hashtag Rules Handlers ───────────────────────────────────────────────────
  const handleAddHashtagRule = () => {
    const cleanTag = hashtagRuleInput.trim().replace(/^#/, '')
    if (cleanTag && !autoHashtagRules.includes(cleanTag)) {
      setAutoHashtagRules((prev) => [...prev, cleanTag])
      setHashtagRuleInput('')
    }
  }

  const handleRemoveHashtagRule = (tagToRemove: string) => {
    setAutoHashtagRules((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // ── Submit Publish ─────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!validate()) {
      toast.error('Fix errors before publishing')
      return
    }

    const posts = rows.map((row) => {
      const listMedia = (row as any).mediaFiles?.map((m: any) => m.file_path || m) || []

      return {
        accountIds: row.accountIds.length > 0 ? row.accountIds : selectedAccountIds,
        caption: row.caption,
        contentTypes: [row.contentType],
        mediaUrl: listMedia[0] || row.mediaUrl || undefined, // fallback first media URL
        mediaUrls: listMedia.length > 0 ? listMedia : undefined, // support carousel (multiple media)
        scheduled_at: row.scheduledAt || undefined,
        firstComment: addFirstComment ? (row as any).firstComment || 'First comment' : undefined,
      }
    })

    try {
      const response = await bulkPublish({
        posts,
        settings: {
          postingInterval,
          stopOnError,
          timezone,
          addFirstComment,
          maxPostsPerDay: maxPostsPerDay === '' ? 10 : maxPostsPerDay,
          skipHolidays,
          autoHashtagRules,
        },
      }).unwrap()
      const summary = response.data?.summary || {}
      const failedItems = (response.data?.failed || []).map((f: any) => ({
        index: f.index,
        message: f.message,
      }))
      setResult({
        total: summary.total || posts.length,
        succeeded: summary.succeeded || 0,
        failed: summary.failed || 0,
        failedItems,
      })
      if (summary.succeeded > 0) {
        setRows([newRow()])
        setSelectedAccountIds([])
        setCsvFileName('')
        setCsvFileSize('')
        setCurrentStep(1)
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to process bulk publish')
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (selectedAccountIds.length === 0) {
        toast.error('Please select at least one account to proceed')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (rows.length === 0 || (rows.length === 1 && !isRowFilled(rows[0]) && !csvFileName)) {
        toast.error('Please upload a CSV file')
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      if (maxPostsPerDay === '' || maxPostsPerDay < 1) {
        toast.error('Maximum posts per day must be at least 1')
        return
      }
      applySettingsToRows()
      setCurrentStep(4)
    }
  }

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Bulk Post Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          icon={<Layers2 className="w-6 h-6 text-primary animate-pulse" />}
          title={t('bulk_posts')}
          subtitle={t('bulk_post_desc', {
            defaultValue: 'Bulk upload and schedule multiple social media posts at once.',
          })}
          showBackButton={false}
        />
      </div>

      {/* Stepper wizard banner */}
      <StepWizardStepper currentStep={currentStep} />

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column (Form / wizard active step content) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ACCOUNTS PANEL */}
          {currentStep === 1 && (
            <Step1Accounts
              groupedAccounts={groupedAccounts}
              selectedAccountIds={selectedAccountIds}
              allAccountsSelected={allAccountsSelected}
              handleSelectAllAccounts={handleSelectAllAccounts}
              handleToggleAccount={handleToggleAccount}
            />
          )}

          {/* STEP 2: CSV & CONTENT PANEL */}
          {currentStep === 2 && (
            <Step2CsvUpload
              csvFileName={csvFileName}
              csvFileSize={csvFileSize}
              isDragOverCsv={isDragOverCsv}
              csvRef={csvRef}
              handleCsvImport={handleCsvImport}
              handleCsvDragOver={handleCsvDragOver}
              handleCsvDragLeave={handleCsvDragLeave}
              handleCsvDrop={handleCsvDrop}
            />
          )}

          {/* STEP 3: SETTINGS & RULES PANEL */}
          {currentStep === 3 && (
            <Step3Settings
              postingInterval={postingInterval}
              setPostingInterval={setPostingInterval}
              scheduledDate={scheduledDate}
              setScheduledDate={setScheduledDate}
              scheduledTime={scheduledTime}
              setScheduledTime={setScheduledTime}
              timezone={timezone}
              setTimezone={setTimezone}
              timezoneDropdownOpen={timezoneDropdownOpen}
              setTimezoneDropdownOpen={setTimezoneDropdownOpen}
              skipWeekends={skipHolidays}
              setSkipWeekends={setSkipHolidays}
              maxPostsPerDay={maxPostsPerDay}
              setMaxPostsPerDay={setMaxPostsPerDay}
              autoHashtagRules={autoHashtagRules}
              hashtagRuleInput={hashtagRuleInput}
              setHashtagRuleInput={setHashtagRuleInput}
              handleAddHashtagRule={handleAddHashtagRule}
              handleRemoveHashtagRule={handleRemoveHashtagRule}
              stopOnError={stopOnError}
              setStopOnError={setStopOnError}
              addFirstComment={addFirstComment}
              setAddFirstComment={setAddFirstComment}
            />
          )}

          {/* STEP 4: REVIEW & CONFIRM PANEL */}
          {currentStep === 4 && (
            <Step4Review
              rows={rows}
              selectedAccountIds={selectedAccountIds}
              postingInterval={postingInterval}
              scheduledDate={scheduledDate}
              scheduledTime={scheduledTime}
              isReviewed={isReviewed}
              setIsReviewed={setIsReviewed}
              isLoading={isLoading}
              handleBackStep={handleBackStep}
              handlePublish={handlePublish}
            />
          )}

          {/* Inline controls for step 1, 2, and 3 */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between ">
              <Button
                type="button"
                onClick={handleBackStep}
                disabled={currentStep === 1}
                className="h-9 px-4 rounded-radius p-button-padding! border border-glass-border bg-black/3 dark:bg-white/3 hover:primary-btn text-xs font-bold text-title-color dark:text-white transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                className="h-9 px-5 rounded-radius primary-btn text-white! p-button-padding! text-xs font-extrabold transition-all flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Right column sidebar panels (dynamic stats / templates) */}
        <div className="lg:col-span-4 space-y-6">
          {/* STEP 1: Accounts Right Panel */}
          {currentStep === 1 && (
            <Step1Sidebar rows={rows} isRowFilled={isRowFilled} detectedColumns={detectedColumns} />
          )}

          {/* STEP 2: CSV Right Panel */}
          {currentStep === 2 && (
            <Step2Sidebar
              csvFileName={csvFileName}
              rows={rows}
              isRowFilled={isRowFilled}
              downloadTemplate={downloadTemplate}
            />
          )}

          {/* STEP 3: Settings Right Panel */}
          {currentStep === 3 && <Step3Sidebar />}

          {/* STEP 4: Review Right Panel */}
          {currentStep === 4 && (
            <Step4Sidebar
              selectedAccountIds={selectedAccountIds}
              displayedAccounts={displayedAccounts}
              rows={rows}
              isRowFilled={isRowFilled}
              postingInterval={postingInterval}
            />
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        multiSelect={true}
        type={
          displayedAccounts
            .filter((a) => selectedAccountIds.includes(a.id || a._id))
            .some((a) => a.platform === 'youtube')
            ? 'video'
            : 'all'
        }
      />

      {/* Results modal */}
      {result && (
        <ResultsModal
          result={result}
          onClose={() => {
            setResult(null)
            if (result.succeeded > 0) router.push(ROUTES.SOCIAL_MEDIA.ACTIVITY)
          }}
        />
      )}

      {/* Confirm clear modal */}
      <ConfirmClearModal
        isOpen={confirmClear}
        rowCount={rows.length}
        onConfirm={() => {
          setRows([{ ...newRow(), accountIds: selectedAccountIds }])
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
