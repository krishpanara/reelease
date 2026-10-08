'use client'

import { Button } from '@/components/ui/button'
import { BlogDetailsSidebarProps } from '@/types'
import { getMediaUrl } from '@/utils'
import { User } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

export default function BlogSidebar({ recentBlogs, onNavigate, onClose }: BlogDetailsSidebarProps) {
  const { t } = useTranslation()

  return (
    <div className="lg:col-span-1 space-y-6 sm:space-y-8">
      {/* Author Card */}
      <div className="rounded-border-radius sm:p-6 p-4 border border-glass-border text-center space-y-4 bg-white dark:bg-white/3">
        <div className="w-24 h-24 rounded-full icon-effect p-0.5 mx-auto overflow-hidden bg-white">
          <div className="w-full h-full rounded-border-radius flex items-center justify-center overflow-hidden bg-white dark:bg-transparent">
            <User className="w-12 h-12 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-title-color dark:text-white">
            {t('admin_author', { defaultValue: 'Admin Author' })}
          </h3>
          <p className="text-sm text-subtitle-color">
            {t('author_position', { defaultValue: 'Content Strategist & Web Architect' })}
          </p>
        </div>
        <p className="text-sm text-subtitle-color leading-relaxed italic">
          "
          {t('author_quote', {
            defaultValue: 'Curating the best in design and technology to keep you ahead of the digital curve.',
          })}
          "
        </p>
      </div>

      {/* Recent Posts Sidebar */}
      <div className="rounded-border-radius sm:p-6 p-4 bg-white dark:bg-white/3 border border-glass-border">
        <h3 className="text-xl font-bold text-title-color dark:text-white flex items-center gap-2">
          {t('recent_articles', { defaultValue: 'Recent Articles' })}
        </h3>
        <div className="space-y-6">
          {recentBlogs.map((recent) => {
            return <div
              key={recent._id || (recent as any).id}
              onClick={() => onNavigate(recent)}
              className="group flex gap-4 cursor-pointer"
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-border/40">
                {recent.thumbnail_id ? (
                  <Image
                    width={100}
                    height={100}
                    unoptimized
                    src={getMediaUrl(recent.thumbnail_id)}
                    alt={recent.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-bold text-lg">
                    {recent.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-1">
                <h4 className="text-sm font-bold text-title-color dark:text-white line-clamp-2 leading-snug  transition-colors">
                  {recent.title}
                </h4>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground break-all line-clamp-1 whitespace-normal">
                  {recent.created_at ? new Date(recent.created_at).toLocaleDateString() : 'Unknown Date'}
                </p>
              </div>
            </div>;
          })}
          {recentBlogs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('no_other_articles', { defaultValue: 'No other articles yet.' })}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-6 rounded-radius text-sm font-medium h-11 primary-btn text-white!"
          onClick={onClose}
        >
          {t('view_all_posts', { defaultValue: 'View All Posts' })}
        </Button>
      </div>
    </div>
  )
}
