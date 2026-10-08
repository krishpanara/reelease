'use client'

import PromptLibraryModal from '@/components/feature/ai-common/PromptLibraryModal'
import CharacterPickerModal from '@/components/feature/characters/CharacterPickerModal'
import MediaPickerModal from '@/components/feature/media-library/MediaPickerModal'
import { catalogueAspectDuration } from '@/data/ecommerceCatalogue'
import { useGetCharactersQuery } from '@/redux/api/characterApi'
import {
  useGenerateCatalogueVideoMutation,
  useGetCatalogueVideosQuery,
} from '@/redux/api/ecommerceCatalogueApi'
import { useGenerateCaptionMutation } from '@/redux/api/socialPublishApi'
import type { Character } from '@/types/character'
import { normalizeUploadPath } from '@/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

import {
  CatalogueModelItem,
  CataloguePickerMode,
  CatalogueProductItem,
} from '@/types/ecommerceCatalogue'
import { CatalogueCreateView } from './CatalogueCreateView'

export default function EcommerceCatalogueCreate() {
  const { t } = useTranslation()
  const router = useRouter()

  // Create-form state
  const [selectedModel, setSelectedModel] = useState<CatalogueModelItem | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<CatalogueProductItem | null>(null)
  const [promptText, setPromptText] = useState('')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [duration, setDuration] = useState(catalogueAspectDuration)
  const [sound, setSound] = useState(false)
  const [addWatermark, setAddWatermark] = useState(false)
  const [addBackgroundMusicToggle, setAddBackgroundMusicToggle] = useState(false)
  const [customMusicUrl, setCustomMusicUrl] = useState('')
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false)

  // Modal/UI state
  const [pickerMode, setPickerMode] = useState<CataloguePickerMode>(null)

  // API hooks
  const { data: catalogueData } = useGetCatalogueVideosQuery()
  const { data: charactersData, isLoading: isLoadingCharacters } = useGetCharactersQuery({
    page: 1,
    limit: 50,
    status: 'active',
  })
  const [generateVideo, { isLoading: isGenerating }] = useGenerateCatalogueVideoMutation()
  const [generateCaption, { isLoading: isEnhancingPrompt }] = useGenerateCaptionMutation()

  const catalogueTasks = catalogueData?.data || []
  const characters: Character[] = charactersData?.data?.characters || []

  // Media / Character picker callback
  const handleMediaSelected = (attachment: any) => {
    const raw = Array.isArray(attachment) ? attachment[0] : attachment
    if (!raw?.file_path && !raw?.image_url) return
    const asset = {
      id: raw._id || raw.id || '',
      name: raw.name || 'Selected Asset',
      image_url: raw.image_url || normalizeUploadPath(raw.file_path),
    }
    if (pickerMode === 'otherCharacter') {
      setSelectedModel({
        ...asset,
        description: t('library_character_desc', { defaultValue: 'Character selected from media library' }),
        isFromLibrary: true,
      })
    } else if (pickerMode === 'product') {
      setSelectedProduct(asset)
    }
    setPickerMode(null)
  }

  // Generation
  const handleStartGeneration = async () => {
    if (!selectedModel) {
      toast.error(t('select_model_error', { defaultValue: 'Please select an influencer model.' }))
      return
    }
    if (!selectedProduct) {
      toast.error(t('select_product_error', { defaultValue: 'Please select a product image.' }))
      return
    }
    if (!promptText.trim()) {
      toast.error(t('enter_prompt_error', { defaultValue: 'Please provide a prompt for the scene.' }))
      return
    }

    try {
      const res = await generateVideo({
        character: {
          id: selectedModel.id,
          name: selectedModel.name,
          image_url: selectedModel.image_url,
          description: selectedModel.description || '',
        },
        product: { id: selectedProduct.id, name: selectedProduct.name, image_url: selectedProduct.image_url },
        prompt: promptText,
        aspectRatio,
        duration: `${duration}s`,
        sound,
        addWatermark,
        addBackgroundMusic: addBackgroundMusicToggle || !!customMusicUrl.trim(),
        backgroundMusicUrl: customMusicUrl.trim() || undefined,
      }).unwrap()

      if (res.success) {
        if (res.taskId) {
          sessionStorage.setItem('current_catalogue_task_id', res.taskId)
        }
        toast.success(
          t('generation_started_success', {
            defaultValue: 'Creative processing started! Your product showcase is being generated.',
          }),
        )
        router.push(ROUTES.ECOMMERCE_CATALOGUE)
      }
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message ||
          t('gen_failed_error', { defaultValue: 'Failed to initiate video generation' }),
      )
    }
  }

  const handleHistorySelect = (log: any) => {
    const payload = log.payload
    if (payload) {
      if (payload.prompt) setPromptText(payload.prompt)
      if (payload.aspectRatio) setAspectRatio(payload.aspectRatio)
      if (payload.duration) setDuration(parseInt(payload.duration.replace('s', ''), 10) || catalogueAspectDuration)
      if (payload.sound !== undefined) setSound(payload.sound)
      if (payload.character) setSelectedModel(payload.character)
      if (payload.product) setSelectedProduct(payload.product)
      if (payload.addWatermark !== undefined) setAddWatermark(payload.addWatermark)
      if (payload.backgroundMusicUrl) {
        setCustomMusicUrl(payload.backgroundMusicUrl)
        setAddBackgroundMusicToggle(true)
      } else if (payload.addBackgroundMusic !== undefined) {
        setAddBackgroundMusicToggle(payload.addBackgroundMusic)
      }
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <CatalogueCreateView
        selectedModel={selectedModel}
        selectedProduct={selectedProduct}
        promptText={promptText}
        aspectRatio={aspectRatio}
        duration={duration}
        isGenerating={isGenerating}
        isEnhancingPrompt={isEnhancingPrompt}
        isLoadingCharacters={isLoadingCharacters}
        characters={characters}
        catalogueTasks={catalogueTasks}
        onBack={() => router.push(ROUTES.ECOMMERCE_CATALOGUE)}
        onPickCharacterFromLibrary={() => setPickerMode('otherCharacter')}
        onPickProduct={() => setPickerMode('product')}
        onClearProduct={() => setSelectedProduct(null)}
        onPromptChange={setPromptText}
        generateCaption={generateCaption}
        onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
        onDurationChange={setDuration}
        onAspectRatioChange={setAspectRatio}
        sound={sound}
        onSoundChange={setSound}
        addWatermark={addWatermark}
        onAddWatermarkChange={setAddWatermark}
        addBackgroundMusicToggle={addBackgroundMusicToggle}
        onAddBackgroundMusicToggleChange={setAddBackgroundMusicToggle}
        customMusicUrl={customMusicUrl}
        onCustomMusicUrlChange={setCustomMusicUrl}
        onGenerate={handleStartGeneration}
        onSelectHistory={handleHistorySelect}
      />

      {/* Modals */}
      <MediaPickerModal
        isOpen={pickerMode === 'product'}
        onClose={() => setPickerMode(null)}
        onSelect={handleMediaSelected}
        type="image"
        multiSelect={false}
      />

      <CharacterPickerModal
        isOpen={pickerMode === 'otherCharacter'}
        onClose={() => setPickerMode(null)}
        onSelect={handleMediaSelected}
      />

      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelect={(p) => setPromptText(p)}
        mode="text_to_video"
      />
    </div>
  )
}
