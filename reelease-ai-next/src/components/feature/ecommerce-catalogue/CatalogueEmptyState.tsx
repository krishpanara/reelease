'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Film, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CatalogueEmptyStateProps } from '@/types/ecommerceCatalogue'

export function CatalogueEmptyState({ onCreateClick }: CatalogueEmptyStateProps) {
  const { t } = useTranslation()

  return (
    <Card className="border-0 p-12 dark:bg-white/3 bg-white shadow-none text-center flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Film className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-title-color dark:text-white">
        {t('no_catalogs_yet', { defaultValue: 'Your Catalogue is Empty' })}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
        {t('no_catalogs_desc', {
          defaultValue:
            'Create professional advertising clips of models demonstrating your accessories, devices, or clothing products.',
        })}
      </p>
    </Card>
  )
}
