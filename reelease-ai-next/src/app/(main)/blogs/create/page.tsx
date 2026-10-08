'use client'

import BlogForm from '@/components/feature/blog/BlogForm'
import { PageHeader } from '@/components/reusable/PageHeader'
import { ROUTES } from '@/constants/routes'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function CreateBlogPage() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('create_new_blog', 'Create New Blog')}
        subtitle={t('create_new_blog_description', 'Create a new blog post with AI-generated content')}
        showBackButton
        onBack={() => router.push(ROUTES.BLOGS)}
      />

      <BlogForm blog={null} onClose={() => router.push('/blogs')} />
    </div>
  )
}
