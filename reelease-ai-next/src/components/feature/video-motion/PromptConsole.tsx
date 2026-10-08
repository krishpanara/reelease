'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textArea'
import { PromptConsoleProps } from '@/types/components/features'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const PromptConsole = ({
  prompt,
  setPrompt,
  isGenerating,
  credits,
  onGenerate,
  onOpenPromptLibrary,
  disabled,
}: PromptConsoleProps) => {
  const { t } = useTranslation()

  return (
    <div className="glass-card border-glass-border dark:bg-white/3 bg-white rounded-border-radius sm:p-6 p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-base font-medium text-title-color dark:text-white">{t('creative_prompt')}</span>
        <Button
          onClick={onOpenPromptLibrary}
          variant="ghost"
          size="sm"
          className="h-8 gap-2 bg-primary/10! text-primary hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20"
        >
          <Sparkles className="w-3 h-3" />
          {t('prompt_library', { defaultValue: 'Prompt Library' })}
        </Button>
      </div>

      <div className="relative group flex flex-col">
        <div className="absolute top-6 left-6 p-2.5 rounded-border-radius bg-primary/10 text-primary z-10 hidden md:flex items-center justify-center border border-secondary/20 shadow-[0_0_15px_rgba(167,139,250,0.2)]">
          <Sparkles className="w-6 h-6 fill-primary/20" />
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the motion physics, lighting transitions, and cinematic energy..."
          className="w-full min-h-40 bg-black/3 dark:bg-white/3  sm:min-h-55 border-glass-border  text-base sm:text-lg sm:p-6 p-4 md:pl-20 rounded-border-radius focus-visible:ring-primary/20 focus-visible:border-primary/80 transition-all  placeholder:text-/30 resize-none  hover:border-primary/70"
        />
      </div>

      <Button
        onClick={onGenerate}
        disabled={disabled}
        className="h-12 primary-btn ml-auto rtl:ml-[unset] rtl:mr-auto flex  rounded-radius font-semibold relative overflow-hidden border-0 hover:opacity-90 text-white! transition-all"
      >
        {isGenerating ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className=' text-sm sm:text-base'>{t('processing')}...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Wand2 className="w-5 h-5" />
            <span className=' text-sm sm:text-base'>{t('generate_motion')}</span>
            {!isGenerating && credits && (
              <span className="w-7 h-7  flex items-center justify-between ml-1 px-1 py-1 bg-black/20 rounded-full text-[12px] font-bold border border-black/20">
                {credits}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  )
}
