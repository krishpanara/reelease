import { Button } from '@/components/ui/button'
import { categoryColors } from '@/data/features'
import { PromptCardProps } from '@/types/components/ai-prompts'
import { Copy, Edit2, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { copyToClipboard } from '@/utils/clipboard'

export function getCategoryColor(category: string) {
  return categoryColors[category] || categoryColors['default']
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    copyToClipboard(prompt.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative glass-card dark:bg-white/3 bg-white hover-gradient-border rounded-border-radius p-5 flex flex-col gap-3 transition-all duration-300">
      {/* Category badge */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(prompt.category)}`}
        >
          <Tag className="w-3 h-3" />
          {prompt.category}
        </span>
        {/* Action buttons */}
        <div className="flex items-center gap-1.5 transition-all">
          <Button
            onClick={handleCopy}
            title={t('copy', { defaultValue: 'Copy' })}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            {copied ? <span className="text-green-500 text-xs p-2! font-bold">✓</span> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          {onEdit && (
            <Button
              onClick={() => onEdit(prompt)}
              title={t('edit', { defaultValue: 'Edit' })}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(prompt)}
              title={t('delete', { defaultValue: 'Delete' })}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive bg-destructive/10 rounded-lg hover:bg-destructive hover:text-white transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Prompt text */}
      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4 flex-1">{prompt.prompt}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {prompt.prompt.length} {t('characters', { defaultValue: 'characters' })}
        </span>
        {prompt.created_at && (
          <span className="text-xs text-muted-foreground">{new Date(prompt.created_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

export function PromptSkeleton() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-6 w-24 bg-muted rounded-full" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-4/6" />
      </div>
      <div className="h-3 w-16 bg-muted rounded" />
    </div>
  )
}
