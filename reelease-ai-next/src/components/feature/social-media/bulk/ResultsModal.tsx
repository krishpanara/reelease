'use client'

import React from 'react'
import { X, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BulkResult } from '@/types/bulk'
import { ResultsModalProps } from '@/types/socialMedia'

export const ResultsModal = ({ result, onClose }: ResultsModalProps) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-light-body border border-white/10 rounded-border-radius shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 backdrop-blur-xl">
        <div className="sm:p-6 p-4 border-b border-glass-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-title-color dark:text-white ">
            Bulk Publish Results
          </h2>
          <Button
            onClick={onClose}
            className="w-8 p-0! h-8 flex items-center justify-center rounded-full text-black dark:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="sm:p-6 p-4 space-y-5">
          <div className="grid sm:grid-cols-3 grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-border-radius p-4 text-center border border-glass-border dark:bg-white/3 hover:border-white/10 transition-colors">
              <p className="text-2xl font-bold dark:text-white text-title-color">{result.total}</p>
              <p className="text-sm font-semibold text-subtitle-color mt-1">Total</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-border-radius p-4 text-center hover:bg-emerald-500/15 transition-colors">
              <p className="text-2xl font-bold text-emerald-400">{result.succeeded}</p>
              <p className="text-sm font-semibold text-emerald-400/70 mt-1">Succeeded</p>
            </div>
            <div className={`rounded-border-radius p-4 text-center transition-colors ${result.failed > 0
              ? 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/15'
              : 'bg-black/3 dark:bg-white/3 border border-glass-border'
              }`}>
              <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-400' : 'text-title-color dark:text-white'}`}>{result.failed}</p>
              <p className={`text-sm font-semibold mt-1 ${result.failed > 0 ? 'text-red-400/70' : 'text-subtitle-color'}`}>Failed</p>
            </div>
          </div>

          {result.failedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Failed rows details:
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {result.failedItems.map((f) => (
                  <div key={f.index} className="flex items-start gap-3 p-2.5 rounded-border-radius bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-base font-bold dark:text-white/70 text-subtitle-color ">Row {f.index + 1}:</span>
                      <span className="text-base dark:text-subtitle-color ml-1.5 break-words">{f.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-glass-border dark:bg-white/3 bg-white/[0.01]">
          <Button
            onClick={onClose}
            className="w-full py-3 rounded-border-radius primary-btn text-white! text-sm font-bold active:scale-[0.98] transition-all duration-300"
          >
            Close & View Activity
          </Button>
        </div>
      </div>
    </div>
  )
}
