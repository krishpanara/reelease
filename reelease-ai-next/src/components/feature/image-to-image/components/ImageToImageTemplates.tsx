'use client'

import { Sparkles, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getMediaUrl } from '@/utils'
import Image from 'next/image'
import { ImageToImageTemplatesSidebarProps } from '@/types/components/features'
import { AITemplate } from '@/types'

export function ImageToImageTemplatesSidebar({
  isLoadingTemplates,
  templates,
  onTemplateClick,
}: ImageToImageTemplatesSidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg flex items-center gap-2 px-2">
        <Sparkles className="w-5 h-5 text-primary" />
        {t('inspiration_templates', { defaultValue: 'Inspiration Templates' })}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {isLoadingTemplates ? (
          [1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className="h-48 rounded-3xl bg-muted/20 animate-pulse border border-white/5" />
          ))
        ) : templates.length > 0 ? (
          templates.map((template: AITemplate) => {
            const imageUrl = template.file_path || template.attachment_id?.file_path || template.attachment_id?.url || template.attachment_id;
            return (
              <div
                key={template.id || template._id}
                onClick={() => onTemplateClick(template)}
                className="group p-4 bg-black/40 backdrop-blur-xl rounded-[24px] border border-white/5 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all space-y-3"
              >
                {imageUrl && typeof imageUrl === 'string' && (
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-2">
                    <Image
                      width={100}
                      height={100}
                      unoptimized
                      src={imageUrl.startsWith('http') ? imageUrl : getMediaUrl(imageUrl)}
                      alt={template.title || 'Template Image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-primary" />
                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                      {template.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed italic">
                    {template.prompt}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full">
            <p className="text-sm text-muted-foreground text-center py-10">{t('no_templates_available', { defaultValue: 'No templates available' })}</p>
          </div>
        )}
      </div>
    </div>
  )
}
