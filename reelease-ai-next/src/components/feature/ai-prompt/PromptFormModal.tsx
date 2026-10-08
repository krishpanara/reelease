import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Input from '@/components/ui/input'
import Label from '@/components/ui/label'
import { Textarea } from '@/components/ui/textArea'
import { useGetPromptCategoriesQuery } from '@/redux/api/aiPromptApi'
import { PromptFormModalProps } from '@/types/components/ai-prompts'
import { Form, Formik } from 'formik'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PromptFormModal = ({ isOpen, onClose, onSave, prompt, isLoading }: PromptFormModalProps) => {
  const { t } = useTranslation()
  const { data: categorySuggestions = [] } = useGetPromptCategoriesQuery()
  const [isCustomCategory, setIsCustomCategory] = useState(false)

  const categories = (categorySuggestions?.categories || []).map((c: any) => c.name || c)
  const uniqueCategories = Array.from(new Set(categories.filter(Boolean))) as string[]

  useEffect(() => {
    if (isOpen) {
      if (prompt?.category) {
        const exists = uniqueCategories.some((c) => c.toLowerCase() === prompt.category.toLowerCase())
        setIsCustomCategory(!exists)
      } else {
        setIsCustomCategory(uniqueCategories.length === 0)
      }
    }
  }, [isOpen, prompt, categorySuggestions])

  const validationSchema = Yup.object({
    category: Yup.string().required(t('category_is_required', { defaultValue: 'Category is required' })),
    prompt: Yup.string().required(t('prompt_is_required', { defaultValue: 'Prompt is required' })),
  })

  const handleSubmit = async (values: { category: string; prompt: string }) => {
    await onSave({ category: values.category.trim(), prompt: values.prompt.trim() })
  }

  const isEditing = !!prompt

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg! max-w-[calc(100%-2rem)]! bg-light-body dark:bg-modal-bg-color rounded-border-radius overflow-auto">
        <div className="pb-3 border-b border-border/50">
          <DialogTitle className="text-lg font-bold text-foreground">
            {isEditing
              ? t('edit_prompt', { defaultValue: 'Edit Prompt' })
              : t('add_prompt', { defaultValue: 'Add Prompt' })}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5 text-start rtl:text-end">
            {isEditing
              ? t('update_prompt_desc', { defaultValue: 'Update the category and content of this prompt.' })
              : t('create_prompt_desc', { defaultValue: 'Add a reusable AI prompt to your library.' })}
          </p>
        </div>

        <Formik
          initialValues={{
            category: prompt?.category || '',
            prompt: prompt?.prompt || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, dirty }) => (
            <Form className="space-y-5">
              {/* Category */}
              <div className="space-y-2 flex flex-col">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold text-foreground text-start rtl:text-end">
                    {t('category')} <span className="text-destructive">*</span>
                  </Label>
                  {uniqueCategories.length > 0 && (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory)
                        setFieldValue('category', '')
                      }}
                    >
                      {isCustomCategory
                        ? t('select_existing_category', { defaultValue: 'Select existing' })
                        : t('add_new_category', { defaultValue: '+ Add new category' })}
                    </Button>
                  )}
                </div>

                {isCustomCategory ? (
                  <Input
                    name="category"
                    value={values.category}
                    onChange={(e) => setFieldValue('category', e.target.value)}
                    placeholder={t('enter_category', { defaultValue: 'e.g. Marketing, SEO, Blog...' })}
                    className={errors.category && touched.category ? 'border-destructive' : ''}
                  />
                ) : (
                  <Select
                    value={values.category}
                    onValueChange={(val) => setFieldValue('category', val)}
                  >
                    <SelectTrigger
                      className={cn(
                        'flex h-11 w-full rounded-radius px-3 py-2 text-sm bg-black/2 dark:bg-white/3 border border-glass-border focus-visible:outline-0 focus-visible:ring-0 focus:border-primary dark:text-subtitle-color',
                        errors.category && touched.category && 'border-destructive'
                      )}
                    >
                      <SelectValue placeholder={t('select_category_placeholder', { defaultValue: 'Select a category' })} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#0A0A0A] border-glass-border">
                      {uniqueCategories.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Quick-select chips */}
                {!isCustomCategory && uniqueCategories.length > 0 && (
                  <div className="flex flex-wrap rtl:flex-row-reverse gap-1.5 pt-1">
                    {uniqueCategories.map((cat: string) => (
                      <Button
                        key={cat}
                        type="button"
                        onClick={() => setFieldValue('category', cat)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${values.category === cat
                          ? 'bg-primary text-primary border-primary dark:text-primary'
                          : 'border-border text-muted-foreground dark:text-white/50 dark:border-white/20  hover:border-primary/50 hover:text-foreground'
                          }`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                )}
                {errors.category && touched.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              {/* Prompt */}
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold text-foreground text-start rtl:text-end">
                  {t('prompt', { defaultValue: 'Prompt' })} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  name="prompt"
                  value={values.prompt}
                  onChange={(e: any) => setFieldValue('prompt', e.target.value)}
                  placeholder={t('enter_prompt_placeholder', { defaultValue: 'Write a detailed AI prompt...' })}
                  rows={5}
                  className={`resize-none ${errors.prompt && touched.prompt ? 'border-destructive' : ''}`}
                />
                <div className="flex justify-between items-center">
                  {errors.prompt && touched.prompt ? (
                    <p className="text-xs text-destructive">{errors.prompt}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">{values.prompt.length} Characters</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex rtl:flex-row-reverse gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 rounded-full font-bold!   sm:h-12 h-10 text-base dark:bg-white/3 bg-black/3 hover:bg-destructive! hover:text-white! "
                  disabled={isLoading}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:h-12 h-10 primary-btn text-white! text-base"
                  disabled={isLoading || (isEditing && !dirty)}
                >
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? t('update', { defaultValue: 'Update' }) : t('create')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default PromptFormModal
