'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step1SidebarProps {
  rows: any[]
  isRowFilled: (row: any) => boolean
  detectedColumns: Record<string, string>
}

export const Step1Sidebar = ({ rows, isRowFilled, detectedColumns }: Step1SidebarProps) => {
  const validRowsCount = rows.filter(isRowFilled).length

  return (
    <>
      {/* Import Summary placeholders */}
      <div className="p-5 rounded-2xl border border-glass-border dark:bg-white/3! bg-white space-y-4 backdrop-blur-md">
        <h4 className="text-base font-black text-subtitle-color pb-3 border-b border-glass-border">
          Import Summary
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-subtitle-color">Total Rows</span>
            <span className="text-title-color dark:text-white font-bold">{rows.length}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-400/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Valid Rows
            </span>
            <span className="text-title-color dark:text-white font-bold">{validRowsCount}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-red-400/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Invalid Rows
            </span>
            <span className="text-title-color dark:text-white font-bold">{rows.length - validRowsCount}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-amber-400/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Duplicate Rows
            </span>
            <span className="text-title-color dark:text-white font-bold">0</span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-subtitle-color/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-subtitle-color/30 dark:bg-white/20"></span> Empty Rows
            </span>
            <span className="text-title-color dark:text-white font-bold">0</span>
          </div>
        </div>
      </div>

      {/* Columns Detected placeholders */}
      <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-4 backdrop-blur-md">
        <h4 className="text-[14px] font-black text-subtitle-color pb-3 border-b border-glass-border">
          Columns Detected
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Date / Time', status: detectedColumns.dateTime },
            { label: 'Caption', status: detectedColumns.caption },
            { label: 'Media URL', status: detectedColumns.mediaUrl },
            { label: 'Platforms', status: detectedColumns.platforms },
            { label: 'First Comment', status: detectedColumns.firstComment },
            { label: 'Location', status: detectedColumns.location },
            { label: 'Labels', status: detectedColumns.labels },
          ].map((col) => (
            <div key={col.label} className="flex justify-between text-xs font-semibold">
              <span className="text-subtitle-color flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-subtitle-color/60 stroke-[3]" /> {col.label}
              </span>
              <span
                className={cn(
                  'text-[11px] uppercase tracking-wider font-extrabold',
                  col.status === 'Valid' ? 'text-emerald-400' : 'text-subtitle-color/80'
                )}
              >
                {col.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
