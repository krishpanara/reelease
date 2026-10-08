'use client'

import BlogDetails from '@/components/feature/blog/BlogDetails'
import BlogForm from '@/components/feature/blog/BlogForm'
import StatusPage from '@/components/reusable/StatusPage'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetBlogByIdQuery, useGetBlogsQuery } from '@/redux/api/blogApi'
import { Blog } from '@/types'
import { FileQuestion } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function BlogDetailsPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view')

  const { data: blog, isLoading: isBlogLoading, error: blogError } = useGetBlogByIdQuery(id as string)
  const { data: blogsResponse, isLoading: isAllLoading } = useGetBlogsQuery({ limit: 100 })

  if (isBlogLoading || isAllLoading) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 space-y-12">
        <Skeleton className="h-12 w-40 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <Skeleton className="aspect-[21/9] w-full rounded-[3rem]" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <Skeleton className="h-64 w-full rounded-[2.5rem]" />
            <Skeleton className="h-96 w-full rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    )
  }

  if (blogError || !blog) {
    return (
      //  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      //   <h2 className="text-2xl font-bold">{t('blog_not_found', 'Blog not found')}</h2>
      //   <Button
      //     onClick={() => router.push('/blogs')}
      //     className="text-primary hover:underline font-semibold primary-btn text-white!"
      //   >
      //     {t('back_to_blogs', 'Back to Blogs')}
      //   </Button>
      //    </div>
        <StatusPage
          title={t('blog_not_found')}
          description={t('blog_not_found_desc')}
          errorCode="404"
          icon={FileQuestion}
          showHome={true}
        />
    )
  }

  const allBlogs = blogsResponse?.blogs || []

  if (view === 'edit') {
    return (
      <div className="max-w-[1400px] mx-auto sm:p-8 p-4">
        <BlogForm
          blog={blog}
          onClose={() => router.push(`/blog/${id}`)}
        />
      </div>
    )
  }

  return (
    <div>
      <BlogDetails
        blog={blog}
        allBlogs={allBlogs}
        onClose={() => router.push('/blogs')}
        onNavigate={(b: Blog) => router.push(`/blog/${b._id || b.id}`)}
      />
    </div>
  )
}
