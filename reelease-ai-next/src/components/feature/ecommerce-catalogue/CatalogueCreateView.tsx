'use client'

import { AIPromptDescribeSection } from '@/components/feature/ai-common/AIPromptDescribeSection'
import { PageHeader } from '@/components/reusable/PageHeader'
import type { CatalogueCreateViewProps } from '@/types/ecommerceCatalogue'
import { AIRecentGenerationsHistory } from '@/components/feature/ai-common/AIRecentGenerationsHistory'
import { useTranslation } from 'react-i18next'
import { CatalogueCharacterPicker } from './CatalogueCharacterPicker'
import { CatalogueProductPicker } from './CatalogueProductPicker'
import { CatalogueSummarySidebar } from './CatalogueSummarySidebar'
import { CatalogueVideoSettings } from './CatalogueVideoSettings'
import { ROUTES } from '@/constants/routes'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

type CatalogueCreateViewExtendedProps = CatalogueCreateViewProps & {
  catalogueTasks: any[]
  addWatermark: boolean
  addBackgroundMusicToggle: boolean
  customMusicUrl: string
  onAddWatermarkChange: (v: boolean) => void
  onAddBackgroundMusicToggleChange: (v: boolean) => void
  onCustomMusicUrlChange: (v: string) => void
  onSelectHistory: (log: any) => void
}

export function CatalogueCreateView({
  selectedModel,
  selectedProduct,
  promptText,
  aspectRatio,
  duration,
  isGenerating,
  isEnhancingPrompt,
  isLoadingCharacters,
  characters,
  catalogueTasks,
  onBack,
  onPickCharacterFromLibrary,
  onPickProduct,
  onClearProduct,
  onPromptChange,
  generateCaption,
  onOpenPromptLibrary,
  onDurationChange,
  onAspectRatioChange,
  sound,
  onSoundChange,
  onGenerate,
  addWatermark,
  addBackgroundMusicToggle,
  customMusicUrl,
  onAddWatermarkChange,
  onAddBackgroundMusicToggleChange,
  onCustomMusicUrlChange,
  onSelectHistory,
}: any) {
// }: CatalogueCreateViewExtendedProps) {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <>
      <PageHeader
        // icon={<ShoppingBag className="w-6 h-6 text-primary animate-pulse" />}
        title={t('create_video_showcase', { defaultValue: 'Create Ecommerce Catalogue' })}
        subtitle={t('create_showcase_subtitle', {
          defaultValue: 'Choose your character, product, and creative style — all in one place.',
        })}
        showBackButton={true}
        onBack={() => router.push(ROUTES.ECOMMERCE_CATALOGUE)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CatalogueCharacterPicker
              selectedModel={selectedModel}
              isLoading={isLoadingCharacters}
              hasNoCharacters={!isLoadingCharacters && characters.length === 0}
              onPickFromLibrary={onPickCharacterFromLibrary}
            />

            <CatalogueProductPicker
              selectedProduct={selectedProduct}
              onPickProduct={onPickProduct}
              onClearProduct={onClearProduct}
            />
          </div>

          <AIPromptDescribeSection
            stepNumber={3}
            title={t('creative_prompt_title', { defaultValue: 'Add Prompt' })}
            description={t('creative_prompt_desc', {
              defaultValue: 'Describe how the influencer should present your product.',
            })}
            placeholder={t('showcase_prompt_placeholder', {
              defaultValue:
                'The model smiles while holding the product, rotating it slowly to show details, cinematic lighting...',
            })}
            prompt={promptText}
            onPromptChange={onPromptChange}
            isEnhancingPrompt={isEnhancingPrompt}
            onImprovePrompt
            onAddDetails
            onSurpriseMe
            generateCaption={generateCaption}
            t={t}
            onOpenPromptLibrary={onOpenPromptLibrary}
          />

          <CatalogueVideoSettings
            stepNumber={4}
            title={t('video_settings_title', { defaultValue: 'Video Settings' })}
            description={t('video_settings_desc', { defaultValue: 'Configure your video preferences' })}
            duration={duration}
            aspectRatio={aspectRatio}
            sound={sound}
            addWatermark={addWatermark}
            addBackgroundMusicToggle={addBackgroundMusicToggle}
            customMusicUrl={customMusicUrl}
            onDurationChange={onDurationChange}
            onAspectRatioChange={onAspectRatioChange}
            onSoundChange={onSoundChange}
            onAddWatermarkChange={onAddWatermarkChange}
            onAddBackgroundMusicToggleChange={onAddBackgroundMusicToggleChange}
            onCustomMusicUrlChange={onCustomMusicUrlChange}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <CatalogueSummarySidebar
            selectedModel={selectedModel}
            selectedProduct={selectedProduct}
            aspectRatio={aspectRatio}
            duration={duration}
            isGenerating={isGenerating}
            promptText={promptText}
            onGenerate={onGenerate}
          />
          <div className="dark:bg-white/3 bg-white border border-glass-border rounded-border-radius overflow-hidden mt-6">
            <AIRecentGenerationsHistory
              logs={catalogueTasks}
              mediaType="video"
              onSelectLog={onSelectHistory}
              title={t('recent_showcases', { defaultValue: 'Recent Showcases' })}
              emptyMessage={t('no_recent_showcases', { defaultValue: 'No recent showcases found.' })}
            />
          </div>
        </div>
      </div>
    </>
  )
}
