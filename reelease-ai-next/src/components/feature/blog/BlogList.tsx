'use client'

import { DeleteConfirmationModal } from '@/components/reusable/DeleteConfirmationModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { useDeleteBlogMutation, useGetBlogsQuery } from '@/redux/api/blogApi'
import { useGetCategoriesQuery } from '@/redux/api/categoryApi'
import { Blog, BlogListProps } from '@/types'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import BlogCard from './BlogCard'
import { CategoryFilter } from '@/components/reusable/CategoryFilter'
import { usePermission } from '@/hooks/usePermission'
import { PERMISSIONS } from '@/constants/permissions'



const BlogList = ({ search, onEdit }: BlogListProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const canManageBlogs = hasPermission(PERMISSIONS.MANAGE_BLOGS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [categoryFilter, setCategoryFilter] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { data: blogsResponse, isLoading } = useGetBlogsQuery({
    page,
    limit,
    search: debouncedSearch,
    category: categoryFilter || undefined,
  })

  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 })
  const categories = categoriesData?.categories || []

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null)

  const blogs = blogsResponse?.blogs || []
  const totalPages = blogsResponse?.totalPages || 0

  const handleDelete = async () => {
    if (!blogToDelete) return
    try {
      await deleteBlog(blogToDelete).unwrap()
      toast.success(t('blog_deleted_successfully'))
      setIsDeleteModalOpen(false)
      setBlogToDelete(null)
    } catch (error: any) {
      toast.error(error?.data?.message || t('something_went_wrong'))
    }
  }

  const handleEdit = (blog: Blog) => {
    onEdit(blog)
  }

  const handleDetails = (blog: Blog) => {
    router.push(`/blog/${blog._id || (blog as any).id}`)
  }

  return (
    <div className="space-y-8">
      <CategoryFilter 
        categories={categories}
        activeCategory={categoryFilter}
        onCategoryChange={(val) => { setCategoryFilter(val); setPage(1) }}
        allLabel={t('all_blogs', { defaultValue: 'All Posts' })}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video rounded-3xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  2xl:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id || (blog as any).id}
              blog={blog}
              onEdit={canManageBlogs ? handleEdit : undefined}
              onClick={handleDetails}
              onDelete={
                canManageBlogs
                  ? (id) => {
                      setBlogToDelete(id)
                      setIsDeleteModalOpen(true)
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center dark:bg-white/3 justify-center py-20 text-center space-y-6 bg-card/20 rounded-border-radius border border-dashed border-border/60">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutGrid className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
             <h3 className="text-2xl font-bold text-title-color dark:text-white">{t('no_blogs_found')}</h3>
             <p className="text-subtitle-color max-w-sm mx-auto">
               {t('no_blogs_desc', { defaultValue: "You haven't published any blog posts yet. Click the create new post button to create your first article." })}
             </p>
           </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <Button
            variant="outline"
            className="rounded-xl h-12 w-12 p-0 border-border/40"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'default' : 'outline'}
                className={cn(
                  "h-12 w-12 rounded-xl border-border/40 font-bold",
                  page === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/30" : "hover:bg-primary/5 hover:text-primary"
                )}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            className="rounded-xl h-12 w-12 p-0 border-border/40"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setBlogToDelete(null)
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t('delete_blog_title')}
        description={t('delete_blog_description')}
      />
    </div>
  )
}

export default BlogList
