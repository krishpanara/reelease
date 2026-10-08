'use client'

import CKEditorField from '@/components/shared/form-fields/CKEditorField'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import TextInput from '@/components/shared/form-fields/TextInput'
import { Card } from '@/components/ui/card'
import { BlogGeneralInfoProps } from '@/types'
import { useTranslation } from 'react-i18next'

export default function BlogGeneralInfo({ setFieldValue, values, isEditing }: BlogGeneralInfoProps) {
  const { t } = useTranslation()

  return (
    <Card className="rounded-[2.5rem] border border-border/40  overflow-hidden p-4 sm:p-6 space-y-8 glass-dark-card dark:bg-white/3  bg-white">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            name="title"
            label={t('title')}
            placeholder={t('enter_title')}
            className="h-14 rounded-radius! border-border/40 focus:bg-background"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value
              setFieldValue('title', val)
              if (!isEditing) {
                setFieldValue(
                  'slug',
                    val
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]+/g, ''),
                )
              }
            }}
          />
          <TextInput
            name="slug"
            label={t('slug')}
            placeholder={t('enter_slug')}
            className="h-14 rounded-radius! border-border/40 focus:bg-background font-mono"
          />
        </div>

        <TextAreaField
          name="description"
          label={t('short_description')}
          rows={3}
          placeholder={t('enter_short_description')}
          className="rounded-radius border-border/40"
        />

        <div className="space-y-4">
          <CKEditorField
            label={t('content')}
            value={values.content}
            onChange={(val) => setFieldValue('content', val)}
            placeholder={t('start_typing_content')}
          />
        </div>
      </div>
    </Card>
  )
}
