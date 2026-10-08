'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import {  useGetTemplatesQuery } from '@/redux/api/aiTemplateApi'
import { AITemplate } from '@/types'
import { Plus, Sparkles, Video, Wand2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function TextToVideoTemplates() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: templatesRaw, isLoading } = useGetTemplatesQuery({ status: true })
  
  const templates = Array.isArray(templatesRaw) ? templatesRaw : templatesRaw?.templates || []
  
  // Filter for video templates if category exists, or just show all relevant to video
  const videoTemplates = templates.filter((t: AITemplate) => 
    t.prompt.toLowerCase().includes('video') || 
    t.title.toLowerCase().includes('video') ||
    t.category_id?.name?.toLowerCase().includes('video')
  )

  const handleCreateNew = () => {
    router.push(`${ROUTES.TEXT_TO_VIDEO}/generate`)
  }

  const handleUseTemplate = (templateId: string) => {
    router.push(`${ROUTES.TEXT_TO_VIDEO}/generate?templateId=${templateId}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            {t('text_to_video', { defaultValue: 'Text to Video' })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('text_to_video_desc', { defaultValue: 'Turn your stories into cinematic videos with AI' })}
          </p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-105 active:scale-95 group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          {t('create_blank_video', { defaultValue: 'Create Blank Video' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card */}
        <Card 
          className="group relative overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all duration-500 cursor-pointer bg-primary/5 hover:bg-primary/10 rounded-3xl h-[280px]"
          onClick={handleCreateNew}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
              <Video className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{t('start_from_scratch', { defaultValue: 'Start from Scratch' })}</h3>
              <p className="text-sm text-muted-foreground mt-1 px-4">
                {t('create_video_without_template', { defaultValue: 'Describe your vision and watch it come to life' })}
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          [1, 2].map((i) => (
            <Card key={i} className="rounded-3xl h-[280px] bg-muted/20 animate-pulse border-none" />
          ))
        ) : (
          videoTemplates.map((template: AITemplate) => (
            <Card 
              key={template.id || template._id}
              className="group relative overflow-hidden glass-dark-card border-white/5 hover:border-primary/40 transition-all duration-500 cursor-pointer rounded-3xl h-[280px]"
              onClick={() => handleUseTemplate(template.id || template._id!)}
            >
              <CardContent className="p-0 h-full flex flex-col">
                <div className="h-2/5 bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Wand2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="h-3/5 p-6 space-y-2">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{template.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed italic">
                    {template.prompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
