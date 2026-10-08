'use client'

import { BlogFormProps } from '@/types'
import { Form, Formik } from 'formik'
import BlogGeneralInfo from './form/BlogGeneralInfo'
import BlogSEOInfo from './form/BlogSEOInfo'
import BlogSidebar from './form/BlogSidebar'
import { useBlogForm } from './hooks/useBlogForm'

export default function BlogForm({ blog, onClose }: BlogFormProps) {
  const {
    categories,
    tags,
    isEditing,
    thumbnailUrl,
    setThumbnailUrl,
    initialValues,
    validationSchema,
    handleSubmit,
    isLoading,
    isUploading,
    uploadAttachment
  } = useBlogForm(blog, onClose)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-500">


      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, errors, touched, dirty }) => (
          <Form className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <BlogGeneralInfo setFieldValue={setFieldValue} values={values} isEditing={isEditing} />
              <BlogSEOInfo />
            </div>

            <BlogSidebar
              values={values}
              setFieldValue={setFieldValue}
              touched={touched}
              errors={errors}
              categories={categories}
              tags={tags}
              thumbnailUrl={thumbnailUrl}
              setThumbnailUrl={setThumbnailUrl}
              uploadAttachment={uploadAttachment}
              isUploading={isUploading}
              isLoading={isLoading}
              isEditing={isEditing}
              onClose={onClose}
              dirty={dirty}
            />
          </Form>
        )}
      </Formik>
    </div>
  )
}
