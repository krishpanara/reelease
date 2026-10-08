'use client'

import { AiPrompt } from '@/types/components/ai-prompts'
import { TextToImageTemplatesSidebarProps } from '@/types/components/features'
import { Sparkles, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'



export function TextToImageTemplatesSidebar({
  isLoadingTemplates,
  templates,
  onTemplateClick,
}: TextToImageTemplatesSidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg flex items-center gap-2 px-2">
        <Sparkles className="w-5 h-5 text-primary" />
        {t('prompt_templates', { defaultValue: 'Prompt Templates' })}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {isLoadingTemplates ? (
          [1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className="h-32 rounded-3xl bg-muted/20 animate-pulse border border-white/5" />
          ))
        ) : templates.length > 0 ? (
          templates.map((template: AiPrompt) => (
            <div
              key={template.id || template._id}
              onClick={() => onTemplateClick(template)}
              className="group p-5 bg-black/40 backdrop-blur-xl rounded-[24px] border border-white/5 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3 text-primary" />
                <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                  {template.category}
                </h4>
              </div>
              <p className="text-[10px] text-white/40 line-clamp-3 leading-relaxed italic">
                {template.prompt}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <p className="text-sm text-muted-foreground text-center py-10">{t('no_templates_available', { defaultValue: 'No templates available' })}</p>
          </div>
        )}
      </div>
    </div>
  )
}
