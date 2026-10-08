'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CatalogueCharacterPickerProps } from '@/types/ecommerceCatalogue'
import { getMediaUrl } from '@/utils'
import { Loader2, Plus, Users } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

function MediaImage({ path, alt }: { path: string; alt: string }) {
  const src = getMediaUrl(path)
  if (!src) return null
  return <Image src={src} alt={alt} fill unoptimized className="object-cover" />
}

export function CatalogueCharacterPicker({
  selectedModel,
  isLoading,
  hasNoCharacters,
  onPickFromLibrary,
}: CatalogueCharacterPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="dark:bg-white/3 bg-white border border-glass-border rounded-border-radius p-4 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-xs shrink-0">
          1
        </span>
        <div>
          <h3 className="text-base font-bold dark:text-white text-title-color flex items-center gap-2 ">
            {t('select_influencer_title', { defaultValue: 'Select Your Virtual Influencer' })}
          </h3>
          <p className="text-sm text-subtitle-color mt-0.5 truncate line-clamp-1 max-w-[200px]">
            {t('select_influencer_desc', {
              defaultValue: 'Choose a character from My Characters or pick another portrait from your media library.',
            })}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center sm:p-6 p-4 border border-dashed border-glass-border rounded-border-radius dark:bg-white/3 min-h-[220px] bg-black/3">
          {selectedModel ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-secoundery">
                <MediaImage path={selectedModel.image_url} alt={selectedModel.name} />
                <Button
                  type="button"
                  onClick={() => onPickFromLibrary()} // Need to add an onClear handler or just change
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center hidden" // Hiding this for now since we have a Change button
                >
                </Button>
              </div>
              <p className="text-xs font-bold text-subtitle-color">{selectedModel.name}</p>
              <Button
                type="button"
                onClick={onPickFromLibrary}
                className="h-8 px-4 text-xs rounded-xl primary-btn  text-white! font-medium flex items-center justify-center"
              >
                {t('change_character', { defaultValue: 'Change Character' })}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Users className="w-7 h-7" />
              </div>
              <Button
                type="button"
                onClick={onPickFromLibrary}
                className="h-10 px-4 rounded-xl primary-btn text-white!  border-0 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-0" />
                {t('select_virtual_influencer', { defaultValue: 'Select Virtual Influencer' })}
              </Button>
            </div>
          )}
        </div>
      )}

      {!isLoading && hasNoCharacters && (
        <p className="text-sm text-subtitle-color text-center py-2">
          {t('no_characters_hint', {
            defaultValue: 'No characters yet — create one in My Characters.',
          })}
        </p>
      )}
    </div>
  )
}
