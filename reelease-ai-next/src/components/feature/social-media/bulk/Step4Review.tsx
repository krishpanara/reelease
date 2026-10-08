'use client'

import React from 'react'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface Step4ReviewProps {
  rows: any[]
  selectedAccountIds: string[]
  postingInterval: number
  scheduledDate: Date | undefined
  scheduledTime: string
  isReviewed: boolean
  setIsReviewed: (v: boolean) => void
  isLoading: boolean
  handleBackStep: () => void
  handlePublish: () => void
}

export const Step4Review = ({
  rows,
  selectedAccountIds,
  postingInterval,
  scheduledDate,
  scheduledTime,
  isReviewed,
  setIsReviewed,
  isLoading,
  handleBackStep,
  handlePublish,
}: Step4ReviewProps) => {
  return (
    <div className="sm:p-6 p-4 rounded-border-radius border border-glass-border dark:bg-white/3! bg-white space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full primary-btn text-white flex items-center justify-center text-base font-black shrink-0" >
          4
        </div>
        <div>
          <h3 className="text-lg font-bold text-title-color dark:text-white tracking-wide">Review & Confirm</h3>
          <p className="text-sm text-subtitle-color mt-0.5">Preview your posts and confirm import.</p>
        </div>
      </div>

      {/* 4 Summary Grid cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-cyan-500/15 bg-cyan-500/3 text-center space-y-1">
          <h4 className="text-2xl font-black text-cyan-400">{rows.length}</h4>
          <p className="text-sm font-bold text-cyan-400/60">Posts to import</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/15 bg-emerald-500/3 text-center space-y-1">
          <h4 className="text-2xl font-black text-emerald-400">{selectedAccountIds.length}</h4>
          <p className="text-sm font-bold text-emerald-400/60">Accounts selected</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/3 text-center space-y-1">
          <h4 className="text-xl font-black text-amber-400 truncate">{postingInterval}</h4>
          <p className="text-sm font-bold text-amber-400/60">Posting interval</p>
        </div>

        <div className="p-4 rounded-xl border border-purple-500/15 bg-purple-500/3 text-center space-y-1">
          <h4 className="text-[11px] font-extrabold text-purple-400 leading-normal py-1.5 truncate">
            {scheduledDate ? format(scheduledDate, 'PPP') : ''} {scheduledTime}
          </h4>
          <p className="text-sm font-bold text-purple-400/60">Start time</p>
        </div>
      </div>

      {/* CSV Rows Preview Section in Step 4 (commented out per design) */}
      {/* <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-glass-border pb-2">
          <h3 className="text-sm font-bold text-title-color dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            CSV Rows Preview ({rows.length})
          </h3>
          <span className="text-[10px] text-subtitle-color/80 uppercase font-black tracking-wider">
            Uncheck media inside cards to edit
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto no-scrollbar pr-1.5">
          {rows.map((row, idx) => (
            <BulkRowItem
              key={row.id}
              row={row}
              index={idx}
              accounts={displayedAccounts}
              onChange={updateRow}
              onRemove={removeRow}
            />
          ))}

          {rows.length < 200 && (
            <button
              type="button"
              onClick={addRow}
              disabled={!allRowsFilled}
              className="flex flex-col items-center justify-center h-[380px] rounded-2xl border border-dashed border-glass-border bg-black/3 dark:bg-white/[0.01] hover:bg-black/3 dark:hover:bg-white/[0.03] hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="w-10 h-10 rounded-full bg-black/3 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:bg-primary/10 transition-all">
                <Plus className="w-5 h-5 text-subtitle-color group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs font-semibold text-subtitle-color">Add New Post</p>
              {!allRowsFilled && (
                <p className="text-[12px] text-subtitle-color/60 mt-1">Fill existing cards first</p>
              )}
            </button>
          )}
        </div>
      </div> */}

      {/* Confirm check option */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-black/3 dark:bg-white/1 border border-glass-border">
        <Checkbox
          id="review-checked"
          checked={isReviewed}
          onCheckedChange={(checked) => setIsReviewed(checked === true)}
          className="mt-1"
        />
        <label
          htmlFor="review-checked"
          className="text-sm text-subtitle-color select-none cursor-pointer leading-tight"
        >
          I have reviewed the data and confirm that all information is correct.
        </label>
      </div>

      {/* Navigation Back / Submit controls */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between pt-4 border-t border-glass-border">
        <Button
          type="button"
          onClick={handleBackStep}
          className="h-10 px-5 rounded-xl border border-glass-border hover:border-primary/30 bg-black/3 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-title-color dark:text-white transition-all flex items-center gap-2 hover:text-title-color"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handlePublish}
          disabled={isLoading || !isReviewed || rows.length === 0}
          className="h-10 px-6 rounded-border-radius primary-btn text-white! text-xs font-black shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Import & Schedule Posts
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
