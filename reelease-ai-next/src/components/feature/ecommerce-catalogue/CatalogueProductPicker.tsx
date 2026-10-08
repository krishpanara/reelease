'use client'

import { Button } from '@/components/ui/button'
import type { CatalogueProductPickerProps } from '@/types/ecommerceCatalogue'
import { getMediaUrl } from '@/utils'
import { Plus, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

function MediaImage({ path, alt }: { path: string; alt: string }) {
  const src = getMediaUrl(path)
  if (!src) return null
  return <Image src={src} alt={alt} fill unoptimized className="object-cover" />
}

export function CatalogueProductPicker({ selectedProduct, onPickProduct, onClearProduct }: CatalogueProductPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="dark:bg-white/3 bg-white border border-glass-border rounded-border-radius p-5 md:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full primary-btn text-white font-bold text-sm shrink-0">
          2
        </span>
        <div>
          <h3 className="text-base font-bold text-title-color flex items-center gap-2">
            {t('display_product_title', { defaultValue: 'Choose Showcase Product' })}
          </h3>
          <p className="text-sm text-subtitle-color mt-0.5 truncate line-clamp-1 max-w-[200px]">
            {t('display_product_desc', {
              defaultValue: 'Select a high-quality photo of the product your influencer will showcase.',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center sm:p-6 p-4 border border-dashed border-glass-border rounded-border-radius dark:bg-white/3 min-h-[220px] bg-black/3">
        {selectedProduct ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-purple-500/30">
              <MediaImage path={selectedProduct.image_url} alt={selectedProduct.name} />
              <button
                type="button"
                onClick={onClearProduct}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold subtitle-color max-w-[200px] truncate line-clamp-1">{selectedProduct.name}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPickProduct}
              className="h-8 text-xs primary-btn  text-white!"
            >
              {t('change_product', { defaultValue: 'Change Product' })}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <Button
              type="button"
              onClick={onPickProduct}
              className="h-10 rounded-xl primary-btn text-white! font-bold border-0"
            >
              <Plus className="w-4 h-4" />
              {t('choose_from_media', { defaultValue: 'Select Product Asset' })}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
