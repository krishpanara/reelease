'use client'

import React from 'react'
import { Download, CheckCircle2, FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step2SidebarProps {
  csvFileName: string
  rows: any[]
  isRowFilled: (row: any) => boolean
  downloadTemplate: () => void
}

export const Step2Sidebar = ({
  csvFileName,
  rows,
  isRowFilled,
  downloadTemplate,
}: Step2SidebarProps) => {
  const validRowsCount = rows.filter(isRowFilled).length
  const totalRowsCount = rows.length

  return (
    <>
      {/* CSV Template placement inside step 2 */}
      <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-4 backdrop-blur-md animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black/3 dark:bg-white/5 border border-glass-border flex items-center justify-center text-subtitle-color shrink-0" >
            <Download className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-bold text-title-color dark:text-white">CSV Template</h4>
            <p className="text-sm text-subtitle-color mt-0.5 leading-relaxed">
              Download our CSV template and follow the format.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={downloadTemplate}
          className="w-full h-9 rounded-xl primary-btn hover:bg-primary/95 text-white! font-extrabold text-xs shadow-md transition-all"
        >
          Download Template
        </Button>
      </div>

      {/* Import status */}
      {csvFileName || validRowsCount > 0 ? (
        <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-4 backdrop-blur-md animate-in fade-in duration-300">
          <h4 className="text-[14px] font-black text-subtitle-color pb-3 border-b border-glass-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            CSV Manifest Status
          </h4>
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-title-color dark:text-white">
                {validRowsCount} posts are ready to import.
              </h4>
              {totalRowsCount - validRowsCount > 0 && (
                <p className="text-sm text-red-400/80 mt-1">
                  {totalRowsCount - validRowsCount} rows have errors.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-4 backdrop-blur-md animate-in fade-in duration-300">
          <h4 className="text-[14px] font-black text-subtitle-color pb-3 border-b border-glass-border flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            CSV Manifest Status
          </h4>
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-black/3 dark:bg-white/5 border border-glass-border flex items-center justify-center mx-auto text-subtitle-color">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-subtitle-color">No posts imported yet</h4>
              <p className="text-sm text-subtitle-color/60 mt-1">Upload a CSV file or add posts manually</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-4 backdrop-blur-md animate-in fade-in duration-300">
        <h4 className="text-[14px] font-black text-subtitle-color pb-3 border-b border-glass-border flex items-center gap-2">
          <Info className="w-4 h-4 text-primary shrink-0" />
          Quick Tips
        </h4>
        <ul className="space-y-2.5 text-sm text-subtitle-color leading-relaxed">
          <li className="flex items-center gap-2">
            <span className="text-primary font-bold">→</span>
            <span>Use the CSV template for best results.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary font-bold">→</span>
            <span>Date format: YYYY-MM-DD HH:mm</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary font-bold">→</span>
            <span>Leave optional columns blank if not needed.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary font-bold">→</span>
            <span>Media can be image, video or carousel links.</span>
          </li>
        </ul>
      </div>
    </>
  )
}
