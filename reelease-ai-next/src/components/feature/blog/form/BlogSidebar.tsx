'use client'

import MultiSelectField from '@/components/shared/form-fields/MultiSelectField'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { BlogFormSidebarProps } from '@/types'
import { Image as ImageIcon, Loader2, Save } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import MediaPickerModal from '../../media-library/MediaPickerModal'

export default function BlogSidebar({
  values,
  setFieldValue,
  touched,
  errors,
  categories,
  tags,
  thumbnailUrl,
  setThumbnailUrl,
  uploadAttachment,
  isUploading,
  isLoading,
  isEditing,
  onClose,
  dirty,
}: BlogFormSidebarProps) {
  const { t } = useTranslation()
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  return (
    <div className="space-y-8">
      <Card className="rounded-border-radius border border-glass-border bg-white p-4 sm:p-6 space-y-8 glass-dark-card dark:bg-white/3">
        <div className="space-y-6">
          {/* Thumbnail Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('thumbnail_image') || 'Thumbnail Image'}</h4>
            <div
              onClick={() => setIsMediaModalOpen(true)}
              className="w-full aspect-video rounded-border-radius border-2 border-dashed border-border/60 hover:border-primary/50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
            >
              {thumbnailUrl ? (
                <>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_STORAGE_URL || ''}/${thumbnailUrl}`}
                    alt="Thumbnail"
                    fill
                    className="object-cover group-hover:opacity-50 transition-all"
                    unoptimized
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2 h-12 primary-btn text-white rounded-radius"
                    >
                      <ImageIcon className="w-4 h-4" /> Change Image
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
                  <span className="text-sm font-medium">{t('click_to_upload') || 'Click to upload image'}</span>
                </div>
              )}
            </div>
          </div>

          <MediaPickerModal
            isOpen={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            onSelect={(attachment) => {
              const singleAttachment = Array.isArray(attachment) ? attachment[0] : attachment
              if (!singleAttachment) return
              setFieldValue('thumbnail_id', singleAttachment.id || (singleAttachment as any)._id)
              setThumbnailUrl(singleAttachment.file_path)
              setIsMediaModalOpen(false)
            }}
          />

          {/* Categories */}
          <MultiSelectField
            label={t('categories')}
            placeholder={t('select_categories')}
            options={categories.map((c: any) => ({ label: c.name, value: c._id || c.id }))}
            value={values.categories}
            onChange={(val) => setFieldValue('categories', val)}
            error={touched.categories && errors.categories ? (errors.categories as string) : undefined}
          />

          {/* Tags */}
          <MultiSelectField
            label={t('tags')}
            placeholder={t('select_tags')}
            options={tags.map((t: any) => ({ label: t.title, value: t._id || t.id }))}
            value={values.tags}
            onChange={(val) => setFieldValue('tags', val)}
            error={touched.tags && errors.tags ? (errors.tags as string) : undefined}
          />

          <div className="flex items-center justify-between p-3 glass-dark-card bg-black/3 dark:bg-white/3 rounded-full border border-glass-border">
            <span className="text-base font-medium text-title-color dark:text-white">
              {t('featured') || 'Featured'}
            </span>
            <Switch
              checked={values.is_featured}
              onCheckedChange={(checked) => setFieldValue('is_featured', checked)}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-black/3 dark:bg-white/3 rounded-full border border-glass-border">
            <span className="text-base font-medium text-title-color dark:text-white">
              {t('status') || 'Visible Status'}
            </span>
            <Switch
              checked={values.status}
              onCheckedChange={(checked) => setFieldValue('status', checked)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-4 flex gap-3 rtl:flex-row-reverse">
            <Button
              type="submit"
              disabled={isLoading || isUploading || !dirty}
              className="w-full mb-0 h-12 rounded-radius landing-[2]! primary-btn text-base btn-color text-white! transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isEditing
                    ? t('update_blog_btn', { defaultValue: 'Update Blog' })
                    : t('publish_blog_btn', { defaultValue: 'Publish Blog' })}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading || isUploading}
              className="w-full h-12 rounded-radius hover:bg-destructive! font-bold dark:hover:bg-destructive! glass-dark-card dark:bg-white/3!  bg-black/3 hover:text-white! border hover:border-border/40"
            >
              {t('cancel_changes')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
