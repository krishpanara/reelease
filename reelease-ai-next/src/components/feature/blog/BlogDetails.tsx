'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BlogDetailsProps, Tag } from '@/types'
import { ArrowLeft, Calendar, Clock, Tag as TagIcon, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import BlogHeader from './details/BlogHeader'
import BlogNavigation from './details/BlogNavigation'
import BlogSidebar from './details/BlogSidebar'
import DOMPurify from 'dompurify'

export default function BlogDetails({ blog, allBlogs, onClose, onNavigate }: BlogDetailsProps) {
  const { t } = useTranslation()

  const currentIndex = allBlogs.findIndex((b) => (b._id || (b as any).id) === (blog._id || (blog as any).id))
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null
  const nextBlog = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null

  const recentBlogs = allBlogs.filter((b) => (b._id || (b as any).id) !== (blog._id || (blog as any).id)).slice(0, 5)
  const sanitizedContent = DOMPurify.sanitize(blog?.content || '', {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'ul', 'ol', 'li', 'br'],
  })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-11 rounded-radius primary-btn text-white! gap-2 px-5 font-semibold transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          {t('back_to_blogs')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          {/* Main Content Card */}
          <div className="rounded-border-radius border border-glass-border bg-white dark:bg-white/3 overflow-hidden">
            <BlogHeader blog={blog} />

            {/* Meta Info */}
            <div className="sm:px-8 px-4 py-6 border-b border-border/40 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-6 sm:gap-8 bg-muted/10">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold">{t('author', { defaultValue: 'Author' })}</p>
                  <p className="text-sm font-semibold text-title-color dark:text-white">
                    {t('admin_team', { defaultValue: 'Admin Team' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold">
                    {t('published', { defaultValue: 'Published' })}
                  </p>
                  <p className="text-sm font-semibold text-title-color dark:text-white">
                    {blog.created_at
                      ? new Date(blog.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })
                      : 'Unknown Date'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold">
                    {t('reading_time', { defaultValue: 'Reading Time' })}
                  </p>
                  <p className="text-sm font-semibold text-title-color dark:text-white">
                    {t('reading_time_val', { defaultValue: '5 min read' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="sm:p-8 p-4">
              <div
                className="prose sm:prose-lg dark:prose-invert max-w-none prose-headings:text-title-color prose-p:text-subtitle-color prose-a:text-primary prose-strong:text-current lg:prose-xl"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Tags Section */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-glass-border">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-title-color dark:text-white mb-3 sm:mb-4">
                    <TagIcon className="h-5 w-5 text-primary" />
                    {t('related_tags', { defaultValue: 'Related Tags' })}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(blog.tags as Tag[]).map((tag) => (
                      <Badge
                        key={tag._id || tag.id}
                        variant="outline"
                        className="px-5 py-2 rounded-xl text-sm border-border/60 hover:border-primary hover:text-primary transition-all cursor-pointer"
                      >
                        #{tag.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls (Desktop only) */}
          <div className="hidden lg:block">
            <BlogNavigation prevBlog={prevBlog} nextBlog={nextBlog} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Sidebar */}
        <BlogSidebar recentBlogs={recentBlogs} onNavigate={onNavigate} onClose={onClose} />
      </div>

      {/* Navigation Controls (Mobile only) */}
      <div className="lg:hidden mt-6 sm:mt-8">
        <BlogNavigation prevBlog={prevBlog} nextBlog={nextBlog} onNavigate={onNavigate} />
      </div>
    </div>
  )
}
