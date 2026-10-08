'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Caption } from '@/types'
import { Edit2, Trash2, Copy, Check, Clock, Sparkles, User, Tag as TagIcon, Info } from 'lucide-react'
import { CustomTooltip } from '@/components/reusable/CustomTooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { CaptionCardProps } from '@/types/socialMedia'
import { copyToClipboard } from '@/utils/clipboard'



export const CaptionCard = ({ caption, onEdit, onDelete }: CaptionCardProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    copyToClipboard(caption.content)
    setCopied(true)
    toast.success(t('caption_copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const sourceColor =
    caption.source === 'ai'
      ? 'bg-primary/10 text-primary border-primary/20'
      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  const statusColor =
    {
      active: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      inactive: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      draft: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    }[caption.status] || 'bg-muted text-muted-foreground border-glass-border'

  return (
    <Card className="glass-card border-glass-border rounded-border-radius overflow-hidden group hover:border-primary/30 flex flex-col h-full bg-white dark:bg-transparent">
      <CardHeader className="p-4 bg-muted/30 dark:bg-white/3 border-b border-glass-border flex flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 mb-0">
          <span
            className={cn(
              'text-xs font-black  px-2 py-0.5 rounded border flex items-center gap-1',
              sourceColor,
            )}
          >
            {caption.source === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
            {caption.source}
          </span>
          <span
            className={cn('text-xs font-black px-2 py-0.5 rounded border', statusColor)}
          >
            {caption.status}
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDistanceToNow(new Date(caption.created_at), { addSuffix: true })}
        </span>
      </CardHeader>

      <CardContent className="p-4 dark:bg-white/3 flex-1 flex flex-col space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 pt-1">
              <h3 className="text-base font-bold text-title-color dark:text-white truncate">
                {caption.name}
              </h3>
              {caption.notes && (
                <CustomTooltip title={caption.notes} className='bg-light-body!'>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer shrink-0" />
                </CustomTooltip>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                onClick={() => onEdit(caption)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0! rounded-lg bg-primary/10! text-primary! hover:text-primary-foreground dark:hover:text-black transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 rounded-lg transition-all bg-primary/10! text-primary!',
                  copied ? 'text-green-600 dark:text-green-500 bg-green-500/10' : '',
                )}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button
                onClick={() => onDelete(caption.id || (caption as any)._id)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-destructive/10! text-destructive!"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">&quot;{caption.content}&quot;</p>
        </div>

        {caption.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
            {caption.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/60 dark:bg-white/5 text-muted-foreground border border-glass-border flex items-center gap-1"
              >
                <TagIcon className="w-4 h-4 opacity-40" />
                {tag}
              </span>
            ))}
          </div>
        )}


      </CardContent>
    </Card>
  )
}
