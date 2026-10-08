'use client'

import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Save, Loader2, FileText } from 'lucide-react'
import TextInput from '@/components/shared/form-fields/TextInput'
import TextAreaField from '@/components/shared/form-fields/TextAreaField'
import MultiSelectFormField from '@/components/shared/form-fields/MultiSelectFormField'
import { useGetBlogsQuery } from '@/redux/api/blogApi'
import Label from '@/components/ui/label'
import { BlogFormProps } from '@/types/landing'
import { getValidationSchemas } from '@/utils/validation-schemas/landingPage'



export default function BlogForm({ data, onSubmit, isLoading }: BlogFormProps) {
  const { t } = useTranslation()
  const {
  BlogValidationSchema,
} = getValidationSchemas(t)
  const { data: blogsData, isLoading: isLoadingBlogs } = useGetBlogsQuery({})

  const initialValues = {
    badge: data?.badge || '',
    title: data?.title || '',
    description: data?.description || '',
    blog_ids: data?.blog_ids?.map((b: any) => b._id || b.id || b) || [],
  }

  

  // Transformed response from blogApi might differ
  const blogs = Array.isArray(blogsData) ? blogsData : (blogsData as any)?.blogs || []
  const blogOptions = blogs.map((blog: any) => ({
    label: blog.title,
    value: blog._id || blog.id,
  })) || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="sm:w-6 sm:h-6 w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-md sm:text-xl font-bold dark:text-white text-title-color">{t('blog_configuration')}</h2>
            <p className="text-subtitle-color text-sm font-medium">{t('manage_blog_section_articles')}</p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={BlogValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, dirty, isValid }) => (
          <Form className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-6">
                <TextInput
                  name="badge"
                  label={t('badge_text')}
                  placeholder={t('enter_badge_text')}
                />
                <TextInput
                  name="title"
                  label={t('section_title')}
                  placeholder={t('enter_section_title')}
                />
                <TextAreaField
                  name="description"
                  label={t('description')}
                  placeholder={t('enter_description')}
                  rows={3}
                />

                <div className="space-y-2">
                  <Label className="text-sm  text-foreground  block mb-2">{t('select_articles')}</Label>
                  <MultiSelectFormField
                    name="blog_ids"
                    options={blogOptions}
                    placeholder={isLoadingBlogs ? t('loading_blogs') : t('select_articles_to_display')}
                    isLoading={isLoadingBlogs}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t dark:border-white/5 border-black/5">
              <Button
                type="submit"
                disabled={isLoading || !dirty || !isValid}
                className="rounded-xl h-12 px-8 primary-btn  text-white! font-bold gap-2 transition-all "
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {t('save_changes')}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
