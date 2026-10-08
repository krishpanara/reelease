'use client'

import { useParams, useRouter } from 'next/navigation'
import { useGetBlogByIdQuery } from '@/redux/api/blogApi'
import BlogForm from '@/components/feature/blog/BlogForm'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/reusable/PageHeader'
import { ROUTES } from '@/constants/routes'

export default function EditBlogPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const { data: blog, isLoading, error } = useGetBlogByIdQuery(id as string)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">{t('loading_blog_details', 'Loading blog details...')}</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive font-medium">{t('blog_not_found', 'Blog not found')}</p>
        <Button onClick={() => router.push(ROUTES.BLOGS)} variant="default" className="pl-2 primary-btn text-white! primary-btn">
          <ArrowLeft className="w-4 h-4 mr-2 rtl:rotate-180" />
          {t('back_to_blogs', 'Back to Blogs')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('edit_blog_post', 'Edit Blog Post')}
        showBackButton
        onBack={() => router.push(ROUTES.BLOGS)}
      />

      <BlogForm blog={blog} onClose={() => router.push(ROUTES.BLOGS)} />
    </div>
  )
}
