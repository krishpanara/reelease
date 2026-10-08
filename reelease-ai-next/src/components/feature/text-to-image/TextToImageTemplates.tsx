'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { useGetPromptsQuery } from '@/redux/api/aiPromptApi'
import { AiPrompt } from '@/types/components/ai-prompts'
import { ArrowLeft, Plus, Tag, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function TextToImageTemplates() {
  const { t } = useTranslation()
  const router = useRouter()

  const { data: promptsData, isLoading } = useGetPromptsQuery({ page: 1, limit: 100 })
  const prompts = promptsData?.prompts || []

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10 bg-primary/10! text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/20 rounded-radius transition-all shrink-0 flex items-center justify-center border border-primary/20"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold leading-[1.3] dark:text-white">
              <span className="text-title-color dark:text-white">
                {t('content_templates', { defaultValue: 'Content Templates' }).split(' ')[0]}
              </span>
              {t('content_templates', { defaultValue: 'Content Templates' }).split(' ').length > 1 && (
                <>
                  {' '}
                  <span className="text-primary title-color">
                    {t('content_templates', { defaultValue: 'Content Templates' }).split(' ').slice(1).join(' ')}
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{t('select_starting_template', { defaultValue: 'Select a starting template or create from scratch' })}</p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            onClick={() => router.push(`${ROUTES.TEXT_TO_IMAGE}/generate`)}
            className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl font-bold bg-primary! text-black text-sm sm:text-base space-x-2 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5 mr-0" />
            <span>{t('create_blank_image', { defaultValue: 'Create Blank Image' })}</span>
          </Button>
        </div>
      </div>


      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="glass-dark-card border-white/5 animate-pulse min-h-[220px]" />
          ))}
        </div>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prompts.map((template: AiPrompt) => (
            <Card
              key={template.id || template._id}
              onClick={() => router.push(`${ROUTES.TEXT_TO_IMAGE}/generate?templateId=${template.id || template._id}`)}
              className="glass-dark-card border-white/5 hover:border-primary/50 cursor-pointer group transition-all overflow-hidden relative min-h-[220px] flex flex-col"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative z-10 flex flex-col gap-4 flex-1">
                <div className="w-10 h-10 rounded-[9px] bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-lg text-title-color dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                    {template.category}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {template.prompt}
                  </p>
                </div>
                <div className="mt-auto pt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <Wand2 className="w-4 h-4 mr-2" />
                  {t('use_template', { defaultValue: 'Use Template' })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-black/10 rounded-2xl border border-white/5">
          <Wand2 className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('no_templates_found')}</h3>
          <p className="text-muted-foreground mb-6">{t('no_templates_desc', { defaultValue: 'Start from scratch to generate your first image.' })}</p>
        </div>
      )}
    </div>
  )
}
