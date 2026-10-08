'use client'

import { Button } from '@/components/ui/button'
import { catalogueCreditCost } from '@/data/ecommerceCatalogue'
import type { CatalogueSummarySidebarProps } from '@/types/ecommerceCatalogue'
import { getMediaUrl } from '@/utils'
import { Loader2, Sparkles, Video } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

function MediaImage({ path, alt }: { path: string; alt: string }) {
  const src = getMediaUrl(path)
  if (!src) return null
  return <Image src={src} alt={alt} fill unoptimized className="object-cover" />
}

export function CatalogueSummarySidebar({
  selectedModel,
  selectedProduct,
  aspectRatio,
  duration,
  isGenerating,
  promptText,
  onGenerate,
}: CatalogueSummarySidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="dark:bg-white/3 bg-white border border-glass-border rounded-border-radius p-5 space-y-4">
        <h4 className="text-base font-bold text-title-color dark:text-white border-b border-glass-border pb-3">
          {t('creative_summary', { defaultValue: 'Creative Summary' })}
        </h4>

        {selectedModel ? (
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <MediaImage path={selectedModel.image_url} alt={selectedModel.name} />
            </div>
            <div>
              <p className="text-sm text-title-color dark:text-white">
                {t('selected_influencer', { defaultValue: 'Influencer' })}
              </p>
              <p className="text-xs font-bold text-subtitle-color">{selectedModel.name}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-subtitle-color">{t('no_model_selected', { defaultValue: 'No character selected' })}</p>
        )}

        {selectedProduct ? (
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <MediaImage path={selectedProduct.image_url} alt={selectedProduct.name} />
            </div>
            <div>
              <p className="text-sm text-title-color dark:text-white">
                {t('selected_product', { defaultValue: 'Product' })}
              </p>
              <p className="text-sm font-bold text-subtitle-color truncate max-w-[160px]">{selectedProduct.name}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-subtitle-color pt-2 border-t border-glass-border">
            {t('no_product_selected', { defaultValue: 'No product selected' })}
          </p>
        )}

        <div className="pt-2 border-t border-glass-border space-y-2 text-sm text-subtitle-color">
          <div className="flex justify-between">
            <span>{t('aspect_ratio', { defaultValue: 'Aspect Ratio' })}</span>
            <span className="text-title-color font-bold">{aspectRatio}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('duration_summary', { defaultValue: 'Duration' })}</span>
            <span className="text-title-color font-bold">{duration}s</span>
          </div>
          <div className="flex justify-between">
            <span>{t('credits_deducted_summary', { defaultValue: 'Credit Cost' })}</span>
            <span className="text-purple-400 font-bold">{catalogueCreditCost}</span>
          </div>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating || !selectedModel || !selectedProduct || !promptText.trim()}
          className="w-full h-12 rounded-xl primary-btn text-white! text-sm font-bold border-0 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('submitting', { defaultValue: 'Initiating...' })}
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              {t('generate_video', { defaultValue: 'Generate Showcase' })}
            </>
          )}
        </Button>
      </div>

      <div className="dark:bg-white/3 bg-white border border-glass-border rounded-border-radius p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-4 h-4" />
          <h4 className="text-sm font-bold">Pro Tips</h4>
        </div>
        <p className="text-sm text-subtitle-color leading-relaxed">
          Describe how the influencer holds, rotates, or wears the product. Mention lighting and camera motion for
          stronger showcase videos.
        </p>
      </div>
    </div>
  )
}
