'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmClearModalProps } from '@/types/socialMedia'


export const ConfirmClearModal = ({
  isOpen,
  onConfirm,
  onCancel,
  rowCount,
}: ConfirmClearModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#0f0f1a]/90 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 backdrop-blur-xl space-y-5">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Clear all rows?
          </h3>
          <p className="text-xs text-white/50 leading-relaxed">
            This will remove all <span className="text-white font-bold">{rowCount}</span> rows. This action cannot be undone and you will lose all unsubmitted data.
          </p>
        </div>
        
        <div className="flex gap-3 pt-1">
          <Button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-xs font-bold text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  )
}
