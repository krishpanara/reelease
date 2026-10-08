'use client'

import { useState } from 'react'
import { useCreateBlogMutation, useUpdateBlogMutation } from '@/redux/api/blogApi'
import { useGetCategoriesQuery } from '@/redux/api/categoryApi'
import { useGetTagsQuery } from '@/redux/api/tagApi'
import { useUploadAttachmentsMutation } from '@/redux/api/attachmentApi'
import { ApiError, Category, Tag, Blog } from '@/types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

export function useBlogForm(blog: Blog | null | undefined, onClose: () => void) {
  const { t } = useTranslation()
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation()
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation()
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentsMutation()
  
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 })
  const { data: tagsData } = useGetTagsQuery({ limit: 100 })
  
  const categories = categoriesData?.categories || []
  const tags = tagsData?.tags || []
  
  const isEditing = !!blog
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    blog?.thumbnail_id && typeof blog.thumbnail_id !== 'string' ? blog.thumbnail_id.file_path : null
  )

  const extractIds = (items: string[] | Category[] | Tag[]) => {
    if (!items || !Array.isArray(items)) return []
    return items.map((item: any) => typeof item === 'string' ? item : item._id || item.id)
  }

  const initialValues = {
    title: blog?.title || '',
    slug: blog?.slug || '',
    description: blog?.description || '',
    content: blog?.content || '',
    thumbnail_id: typeof blog?.thumbnail_id === 'string' ? blog.thumbnail_id : blog?.thumbnail_id?.id || '',
    categories: extractIds(blog?.categories || []),
    tags: extractIds(blog?.tags || []),
    status: blog?.status ?? true,
    is_featured: blog?.is_featured ?? false,
    meta_title: blog?.meta_title || '',
    meta_description: blog?.meta_description || '',
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t('title_required') || 'Title is required'),
    slug: Yup.string().required(t('slug_required') || 'Slug is required'),
  })

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const payload: any = { ...values }
      if (!payload.thumbnail_id) {
        delete payload.thumbnail_id
      }
      if (isEditing && blog) {
        const id = blog._id || blog.id
        const res = await updateBlog({ id, data: payload }).unwrap()
        toast.success(res.message || t('blog_updated_successfully'))
      } else {
        const res = await createBlog(payload).unwrap()
        toast.success(res.message || t('blog_created_successfully'))
      }
      onClose()
    } catch (error) {   
      const apiError = error as ApiError
      toast.error(apiError?.data?.message || t('something_went_wrong'))
    }
  }

  const isLoading = isCreating || isUpdating

  return {
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
  }
}
