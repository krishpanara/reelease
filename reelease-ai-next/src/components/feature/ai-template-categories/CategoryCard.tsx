import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CategoryCardProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { Edit2, Layers, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  onStatusChange,
  canUpdate = true,
  canDelete = true,
}: CategoryCardProps & { canUpdate?: boolean; canDelete?: boolean }) {
  const { t } = useTranslation()
  const imageUrl = getMediaUrl((category?.attachment_id as any)?.file_path)

  const isAdmin = canUpdate || canDelete

  if (!isAdmin) {
    return (
      <div className="group relative glass-card dark:bg-white/3 bg-white rounded-border-radius p-5 flex flex-col h-full hover-gradient-border">

        {/* Header section with Icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {imageUrl ? (
              <Image width={500} height={500} unoptimized src={imageUrl} alt={category.name} className="w-full h-full rounded-border-radius object-cover" />
            ) : (
              <Layers className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className='flex flex-col'>

            {/* Title */}
            <h3
              className="font-bold text-lg text-title-color line-clamp-1 transition-colors"
              title={category.name}
            >
              {category.name}
            </h3>
            {/* Description */}
            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3" title={category.description}>
              {category.description || t('no_description_provided', { defaultValue: 'No description provided' })}
            </p>
          </div>
        </div>


        {/* Footer / Meta info */}
        <div className="flex items-center gap-2 pt-3 mt-auto border-t border-border text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center px-3 py-0.5 rounded bg-primary text-white ">{category.slug}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative glass-card dark:bg-white/3 bg-white rounded-border-radius p-5 flex flex-col h-full hover-gradient-border">
      {/* Header section with Icon & Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="w-12 h-12 rounded-[9px] bg-primary/10 flex items-center justify-center shrink-0">
          {imageUrl ? (
            <Image width={500} height={500} unoptimized src={imageUrl} alt={category.name} className="w-full h-full rounded-[9px] object-cover" />
          ) : (
            <Layers className="w-6 h-6 text-primary" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 -duration-200">
          {canUpdate && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(category)
              }}
              title={t('edit')}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-white"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(category.id || category._id!)
              }}
              title={t('delete')}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground text-destructive bg-destructive/10 rounded-lg hover:bg-destructive hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Title & Status */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="font-semibold text-md text-title-color line-clamp-1 flex-1 transition-colors"
          title={category.name}
        >
          {category.name}
        </h3>
        {canUpdate && (
          <Switch
            checked={category.status}
            onCheckedChange={() => onStatusChange(category.id || category._id!, category.status, category)}
            className="data-[state=checked]:bg-primary h-5 w-9 shrink-0 [&_span]:h-4 [&_span]:w-4 [&_span]:data-[state=checked]:translate-x-4 rtl:[&_span]:data-[state=checked]:-translate-x-4 mt-0.5"
          />
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3 mb-2 flex-1" title={category.description}>
        {category.description || t('no_description_provided', { defaultValue: 'No description provided' })}
      </p>

      {/* Footer / Meta info */}
      <div className="flex items-center gap-2 pt-3 mt-auto border-t border-border text-xs text-muted-foreground font-medium">
        <span className="flex items-center px-3 py-0.5 rounded bg-primary/10 text-primary break-all  whitespace-normal">{category.slug}</span>
      </div>
    </div>
  )
}
