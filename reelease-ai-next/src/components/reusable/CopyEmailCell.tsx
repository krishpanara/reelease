'use client'

import { cn } from '@/lib/utils'
import { CopyEmailCellProps } from '@/types'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { copyToClipboard } from '@/utils/clipboard'

/**
 * Renders an email string in a table cell with a copy-to-clipboard icon
 * that appears on hover. Shows a check mark briefly after copying.
 */
export const CopyEmailCell = ({ email, truncate = true }: CopyEmailCellProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyToClipboard(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <span className="group/email inline-flex items-center gap-1! max-w-full">
      <span className={cn('text-sm text-subtitle-color', truncate ? 'truncate' : 'break-all')}>{email}</span>
      <Button
        variant='default'
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy email'}
        className="shrink-0 opacity-0 group-hover/email:opacity-100 h-0! p-0! pl-1! transition-opacity duration-150 text-muted-foreground bg-transparent!"
      >
        {copied ? <Check className="w-2 h-2 text-green-500" /> : <Copy className="w-3! h-3!" />}
      </Button>
    </span>
  )
}
