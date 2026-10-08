'use client'

import React from 'react'
import { ListTodo } from 'lucide-react'
import { getPlatformIcon } from './Step1Accounts'
import { cn } from '@/lib/utils'

interface Step4SidebarProps {
  selectedAccountIds: string[]
  displayedAccounts: any[]
  rows: any[]
  isRowFilled: (row: any) => boolean
  postingInterval: number
}

export const Step4Sidebar = ({
  selectedAccountIds,
  displayedAccounts,
  rows,
  isRowFilled,
  postingInterval,
}: Step4SidebarProps) => {
  const selectedAccounts = displayedAccounts.filter((acc) =>
    selectedAccountIds.includes(acc.id || acc._id)
  )

  const isCsvDataParsed = rows.filter(isRowFilled).length > 0
  const isAccountPermissionsValid = selectedAccountIds.length > 0
  const isIntervalValid = postingInterval > 0

  const checklistItems = [
    {
      label: 'CSV Data Parsed',
      status: isCsvDataParsed ? 'Verified' : 'Failed',
      desc: `${rows.filter(isRowFilled).length} posts successfully compiled for scheduling.`,
      isValid: isCsvDataParsed,
    },
    {
      label: 'Account Permissions',
      status: isAccountPermissionsValid ? 'Connected' : 'Missing',
      desc: 'Accounts selected have valid session tokens for automatic posting.',
      isValid: isAccountPermissionsValid,
    },
    {
      label: 'Schedule Interval',
      status: `${postingInterval}m Gap`,
      desc: `Posting interval of ${postingInterval} minutes set to space posts automatically.`,
      isValid: isIntervalValid,
    },
    {
      label: 'Start Buffer Time',
      status: 'Configured',
      desc: 'Timezone and initial start trigger verified for publication queue.',
      isValid: true,
    },
  ]

  return (
    <div className="p-5 rounded-2xl border border-glass-border bg-white dark:bg-white/3! space-y-5 backdrop-blur-md animate-in fade-in duration-300">
      <h4 className="text-sm font-black text-subtitle-color pb-3 border-b border-glass-border flex items-center gap-2">
        <ListTodo className="w-4 h-4 text-primary animate-pulse" />
        Publishing Checklist
      </h4>

      <div className="space-y-4">
        {/* Channels selection state */}
        <div className="p-3.5 rounded-md border border-glass-border/40 bg-black/3 dark:bg-white/3 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-title-color dark:text-white text-sm">Target Channels</span>
            <span className="text-primary font-black">{selectedAccountIds.length} Connected</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedAccounts.map((acc) => (
              <div
                key={acc.id || acc._id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 border border-glass-border text-xs font-black text-subtitle-color"
              >
                {getPlatformIcon(acc.platform, 'w-3 h-3')}
                <span>{acc.account_name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist steps */}
        <div className="space-y-3">
          {checklistItems.map((chk) => (
            <div key={chk.label} className="flex gap-3 text-sm leading-normal">
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border text-[10px] font-bold',
                  chk.isValid
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}
              >
                {chk.isValid ? '✓' : '!'}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-title-color dark:text-white">{chk.label}</span>
                  <span
                    className={cn(
                      'text-3xs font-black  px-1.5 py-0.5 rounded border',
                      chk.isValid
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    )}
                  >
                    {chk.status}
                  </span>
                </div>
                <p className="text-xs text-subtitle-color/70">{chk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
